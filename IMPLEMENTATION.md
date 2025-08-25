# Implementing LLM Pages (v2.3)


This guide shows how to expose machine-optimized LLM Pages alongside your human pages.

## 1) Discovery via llms.txt

- Path: /.well-known/llms.txt
- Content: UTF-8 text. One absolute LLM Page URL per line.
- Example:

```
https://example.com/blog/llm-pages-blueprint/llm
https://example.com/blog/another-post/llm
```

## 2) Delivery Profiles

- Endpoint Profile (/llm/):
  - Use routes that return application/llmpage+json; version=1
  - Prefer for dynamic/real-time (SSR) or SSG in frameworks with route-first design
- File Profile (.llm.json) [NEW in 2.2]:
  - For static content, publish files like /path/page.llm.json
  - Works on any static host/CDN; trivial caching with ETag/Last-Modified
- Package Profile [Optional]:
  - Provide a bundle file (e.g., /all-content.llm.json) listing embedded items or references
  - Good for bulk ingestion and initial sync

## 3) Discovery via llms.txt (updated)

- Location: Prefer /.well-known/llms.txt
- List absolute URLs to:
  - Individual .llm.json files
  - /llm/ endpoints
  - Optional package file
- Example:

```
https://example.com/blog/post-a.llm.json
https://example.com/blog/post-b/llm/
https://example.com/all-content.llm.json
```

## 4) HTTP semantics (normative)

- Content-Type: application/llmpage+json; version=1
- Caching: ETag + Last-Modified; support 304 with If-None-Match / If-Modified-Since
- Prefer HEAD for freshness checks on hot endpoints
- Compress JSON (gzip/brotli) where appropriate

## 5) Hybrid for dynamic data

- From a static page payload, optionally link live data:
  - dynamic_endpoint: "/live/product-123/llm/"
  - or dynamic_data_url: "/api/product-123-live.llmpage.json"
- Semi-dynamic: Scheduled regeneration acceptable with documented TTLs
- Edge: Route generation at CDN edges is acceptable for latency

### Conditional request examples

GET with If-None-Match:

```
GET /blog/static-blueprint.llm.json HTTP/1.1
Host: example.com
Accept: application/llmpage+json; version=1
If-None-Match: "abc123"
```

HEAD for freshness check:

```
HEAD /blog/static-blueprint.llm.json HTTP/1.1
Host: example.com
Accept: application/llmpage+json; version=1
```

Server response (not modified):

```
HTTP/1.1 304 Not Modified
ETag: "abc123"
Cache-Control: public, max-age=300, stale-while-revalidate=60
```


- Caching: Serve with strong ETag and Cache-Control: max-age=300, stale-while-revalidate=60.
- Robots: Respect robots.txt; llms.txt does not override disallow rules.

## 2) Endpoint Convention

- For each human page URL, provide an alternate LLM endpoint (commonly a subpath like /llm or a .llm suffix).
- Recommended HTTP headers:
  - Content-Type: application/llmpage+json; version=1
  - ETag: "<hash>"
  - Last-Modified: <RFC1123 date>
  - Cache-Control: public, max-age=300, stale-while-revalidate=60

- Link from the human page:

```
<link rel="alternate" type="application/llmpage+json" href="https://example.com/blog/llm-pages-blueprint/llm" />
```

## 3) Schema and Validation

- Use the JSON Schemas in ./schemas to validate your payloads.
- Example (Article): ./examples/article.llmpage.json
- Validation options:
  - CLI (example using ajv-cli):

```
npm i -D ajv-cli
npx ajv validate -s schemas/llm-page-article.schema.json -d examples/article.llmpage.json
```

  - GitHub Action (pseudo):

```
name: Validate LLM Pages
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm i -D ajv-cli
      - run: npx ajv validate -s schemas/llm-page-article.schema.json -d "examples/**/*.llmpage.json"
```

## 4) Generating the LLM Page

- SSG: Generate the LLM Page alongside your static HTML at build time.
- SSR: Render the JSON payload server-side on request from the same content source.
- Integrity fields to include:
  - schema_version, content_version, last_modified, page_checksum

## 5) Caching and Conditional Requests

- Implement ETag and Last-Modified.
- Support 304 Not Modified on If-None-Match / If-Modified-Since.
- Prefer HEAD for freshness checks on busy endpoints.

## 6) Security and Provenance

- Enforce TLS; add rate limits and bot detection.
- Optional signing of payloads (JWS/DSSE/Sigstore). Include provenance block if used.
- Declare license and publisher details explicitly.

## 7) CMS/Framework Tips

- Next.js: add /llm route generating JSON; use getStaticProps for SSG and getServerSideProps for SSR.
- Astro/Hugo: write a parallel generator that outputs .json next to .html.
- WordPress/Shopify: plugin can map posts/products to LLM endpoints with schema validation.

## 8) Example Files in This Repo

- schemas/llm-page-product.schema.json — JSON Schema for product type
- schemas/llm-page-event.schema.json — JSON Schema for event type
- schemas/llm-page-faq.schema.json — JSON Schema for FAQ type
- schemas/llm-page-howto.schema.json — JSON Schema for howto type
- schemas/llm-page-recipe.schema.json — JSON Schema for recipe type
- schemas/llm-page-job.schema.json — JSON Schema for job type
- schemas/llm-page-review.schema.json — JSON Schema for review type
- examples/* — Sample payloads for each type
- tools/validate.mjs — Node CLI validator (ajv)
- utilities/canonicalize.ts, utilities/canonicalize.py — canonicalization and ETag helpers
- examples/nextjs-min — minimal Next.js App Router example

- schemas/llm-page-article.schema.json — JSON Schema for article type
- examples/article.llmpage.json — Sample payload

## 10) Browser-based Validator (No Setup)

Open tools/validator.html in your browser to validate payloads against the bundled schemas locally. Use the dropdown to switch schema types and load example payloads.

## 11) Next.js Examples

See examples/nextjs/README.md for Pages Router and App Router snippets covering SSG (static) and SSR (dynamic) endpoints.

## 12) Example llms.txt

An example discovery file lives at /.well-known/llms.txt with sample LLM endpoints.

- llm-pages-review.md — Rationale, diagrams, and spec suggestions

## 9) FAQ

### Conformance Levels
- Level 1 (Static):
  - Provide valid LLM Pages via /llm/ static route or .llm.json files
  - Implement ETag + Last-Modified + Cache-Control; list in llms.txt
- Level 2 (Hybrid):
  - Level 1 plus dynamic patterns (SSR endpoint and/or dynamic_endpoint fields)
  - Support HEAD for freshness checks on hot endpoints
- Level 3 (Dynamic):
  - Level 2 plus documented freshness targets (SLA), robust conditional requests, and monitoring



- Why not just JSON-LD? JSON-LD remains valuable, but LLM Pages add enforced validation, versioning, caching semantics, and payload completeness at a dedicated endpoint without front-end coupling.
- Where should llms.txt live? Prefer /.well-known/llms.txt at the site root.
- Can I protect the endpoint? For public content, keep it accessible; for private feeds, use API keys or IP allowlists.

