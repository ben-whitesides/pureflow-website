# PureFlow lead worker

The worker stores every validated submission in the `LEADS` KV namespace before it attempts the optional Resend notification. A Resend failure therefore returns `delivery: "stored"`; a KV failure returns an error and never reports success.

## Owner deploy steps

Run these from this directory with an authenticated Wrangler installation:

1. Create the namespace: `npx wrangler kv namespace create LEADS`.
2. Replace `REPLACE_WITH_KV_NAMESPACE_ID` in `wrangler.toml` with the returned namespace ID.
3. Put the Resend secret from its approved local secret file: `npx wrangler secret put RESEND_API_KEY < /approved/path/to/secret-file`. Wrangler reads it directly; do not print it or copy it into this repo.
4. Verify `LEAD_TO_EMAIL` and `LEAD_FROM_EMAIL` in `wrangler.toml`. The From address must be authorized in Resend.
5. Deploy: `npx wrangler deploy`.
6. Smoke-test `/submit` with an allowed `Origin` header and verify both the KV record and notification delivery before relying on the form in production.

Do not commit the Resend API key or any lead data.
