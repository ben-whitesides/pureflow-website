#!/usr/bin/env node
'use strict';

/**
 * PureFlow Image Generator — Nano Banana (Gemini API)
 * Generates hero images and logo for PureFlow website.
 * API key from Shelby vault — injected as env var.
 */

const fs = require('fs');
const path = require('path');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  const vault = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.shelby/api-keys/llm-keys.json'), 'utf8'));
  process.env.GEMINI_API_KEY = vault.gemini.api_key;
}
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const OUTPUT_DIR = path.join(__dirname, 'images');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const PROMPTS = [
  {
    name: 'logo-horizontal',
    prompt: 'Design a modern, premium wordmark logo that says "PureFlow" in a clean geometric sans-serif font similar to Montserrat Extra Bold. Include a subtle water droplet integrated into the letter P or the word. Color: deep blue (#0052CC) on a pure white background. Style: minimal, corporate-premium, Silicon Valley clean. NO tagline, NO "UT", NO extra text. Just the wordmark with water element. High resolution, crisp edges, vector-quality rendering.',
  },
  {
    name: 'logo-icon',
    prompt: 'Design a minimal water droplet icon/mark. Single water drop shape with a subtle wave or flow line inside it. Color: deep blue (#0052CC) with a teal gradient accent (#00B4D8). Pure white background. Style: app icon quality, geometric, modern. NO text. Just the icon. High resolution, crisp edges.',
  },
  {
    name: 'hero-home',
    prompt: 'A stunning product photography shot of crystal clear water being poured into a premium glass on a clean white surface. Blue-tinted lighting creates a premium feel. Water droplets frozen mid-splash. Deep blue and teal color tones. Clean white background fading to soft blue. Style: luxury brand advertising, Apple-level product photography. 16:9 aspect ratio. Ultra high resolution. No text, no logos.',
  },
  {
    name: 'hero-residential',
    prompt: 'A modern kitchen with a sleek under-counter water filtration system installed. Bright, clean, natural lighting. White marble countertops. A glass of perfectly clear water in the foreground. The kitchen feels premium, contemporary, aspirational. Warm natural tones with blue accent lighting on the filter unit. 16:9 aspect ratio. Style: real estate photography meets product advertising. No text, no logos.',
  },
  {
    name: 'hero-commercial',
    prompt: 'A modern office break room or workplace lounge with a sleek freestanding water cooler/dispenser. Professional environment with clean lines. Employees in the background, natural lighting. The water dispenser is the hero — tall, modern, stainless steel with a blue LED indicator. Style: corporate workplace photography, Steelcase/Herman Miller aesthetic. 16:9 aspect ratio. No text, no logos.',
  },
  {
    name: 'hero-about',
    prompt: 'Panoramic landscape of the Wasatch Front mountains in Utah with a crystal clear mountain lake or stream in the foreground. Snow-capped peaks, blue sky, pristine water reflecting the mountains. Morning golden hour lighting. Deep blues, greens, and golds. Style: National Geographic landscape photography. 16:9 aspect ratio. No text, no logos.',
  },
  {
    name: 'tds-comparison',
    prompt: 'A side-by-side comparison infographic showing two glasses of water. Left glass: slightly cloudy/yellowish water with text overlay "Tap Water 350+ ppm TDS" in red. Right glass: perfectly crystal clear sparkling water with text overlay "PureFlow Filtered < 20 ppm" in blue. Clean white background. Professional, scientific feel. Style: health/wellness product comparison, medical-grade clarity. 16:9 aspect ratio.',
  },
];

async function generateImage(item) {
  console.log(`Generating: ${item.name}...`);
  const start = Date.now();

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: item.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error(`  ERROR (${item.name}): ${data.error.message}`);
      return false;
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'webp';
        const outPath = path.join(OUTPUT_DIR, `${item.name}.${ext}`);
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        const size = (Buffer.from(part.inlineData.data, 'base64').length / 1024).toFixed(0);
        console.log(`  ✓ ${item.name}.${ext} (${size}KB, ${duration}s)`);
        return true;
      }
    }
    console.error(`  NO IMAGE in response for ${item.name}`);
    return false;
  } catch (e) {
    console.error(`  FETCH ERROR (${item.name}): ${e.message}`);
    return false;
  }
}

async function main() {
  console.log(`\nPureFlow Image Generator — Nano Banana (${MODEL})`);
  console.log(`Generating ${PROMPTS.length} images...\n`);

  let success = 0;
  let failed = 0;

  // Generate sequentially to avoid rate limits
  for (const item of PROMPTS) {
    const ok = await generateImage(item);
    if (ok) success++;
    else failed++;
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n=== DONE: ${success} generated, ${failed} failed ===`);
  console.log(`Images at: ${OUTPUT_DIR}/`);
}

main();
