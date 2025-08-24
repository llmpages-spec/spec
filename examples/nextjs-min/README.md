# Minimal Next.js LLM Endpoint (App Router)

This is a tiny example showing an /[slug]/llm route that returns an LLM Page JSON with caching and ETag support.

## Files
- app/[slug]/llm/route.ts — route handler emitting application/llmpage+json
- lib/llm.ts — creates a demo payload

## Try it
- In a Next.js 14+ project, copy the app and lib files under your app/ directory.
- Start dev server and open /hello/llm.

## Notes
- ETag is computed from the canonicalized JSON content using utilities/canonicalize.ts (import path may vary).
- Adjust revalidate and Cache-Control to your freshness targets.

