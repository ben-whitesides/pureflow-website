const ALLOWED_ORIGINS = new Set([
  'https://www.pureflowut.com',
  'https://pureflowut.com'
]);
const MAX_BODY_BYTES = 16 * 1024;
const FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  company: 160,
  message: 4000,
  page: 500
};

function jsonResponse(body, status, origin) {
  var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

function normalizeSubmission(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid submission.');
  }
  if (input.form !== 'contact' && input.form !== 'ebook') {
    throw new Error('Invalid form type.');
  }

  var submission = { form: input.form };
  Object.entries(FIELD_LIMITS).forEach(function (entry) {
    var field = entry[0];
    var limit = entry[1];
    if (input[field] === undefined || input[field] === null) return;
    if (typeof input[field] !== 'string' || input[field].length > limit) {
      throw new Error('Invalid ' + field + '.');
    }
    submission[field] = input[field].trim();
  });

  if (!submission.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    throw new Error('A valid email is required.');
  }
  if (!submission.page) {
    throw new Error('Page is required.');
  }
  return submission;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
  });
}

function notificationHtml(submission) {
  var rows = Object.entries(submission).map(function (entry) {
    return '<tr><th align="left" style="padding:6px 12px 6px 0">' +
      escapeHtml(entry[0]) + '</th><td style="padding:6px 0;white-space:pre-wrap">' +
      escapeHtml(entry[1]) + '</td></tr>';
  }).join('');
  return '<h2>New PureFlow lead</h2><table>' + rows + '</table>';
}

async function emailNotification(env, submission) {
  if (!env.RESEND_API_KEY || !env.LEAD_FROM_EMAIL) return false;

  var response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'PureFlow-Lead-Worker/1.0'
    },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL,
      to: [env.LEAD_TO_EMAIL || 'nick@pureflowut.com'],
      subject: 'New PureFlow ' + submission.form + ' lead',
      html: notificationHtml(submission)
    })
  });
  return response.ok;
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var origin = request.headers.get('Origin');

    if (!ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse({ ok: false, error: 'Origin not allowed.' }, 403);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin'
        }
      });
    }
    if (url.pathname !== '/submit' || request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Not found.' }, 404, origin);
    }
    if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
      return jsonResponse({ ok: false, error: 'Content-Type must be application/json.' }, 415, origin);
    }

    var contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: 'Submission is too large.' }, 413, origin);
    }

    var rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: 'Submission is too large.' }, 413, origin);
    }

    var submission;
    try {
      submission = normalizeSubmission(JSON.parse(rawBody));
    } catch (error) {
      return jsonResponse({ ok: false, error: error.message }, 400, origin);
    }

    var receivedAt = new Date().toISOString();
    var storedLead = Object.assign({ receivedAt: receivedAt }, submission);
    var key = receivedAt + '-' + crypto.randomUUID();

    try {
      await env.LEADS.put(key, JSON.stringify(storedLead));
    } catch (error) {
      return jsonResponse({ ok: false, error: 'Unable to store submission.' }, 503, origin);
    }

    var emailed = false;
    try {
      emailed = await emailNotification(env, storedLead);
    } catch (error) {
      emailed = false;
    }

    return jsonResponse({
      ok: true,
      delivery: emailed ? 'stored+emailed' : 'stored'
    }, 200, origin);
  }
};
