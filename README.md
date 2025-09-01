
# LLM Pages Specification — v1.0 (Resource-Efficient, Universal)

**Status:** Proposed Standard  
**Focus:** Universal resource efficiency for machine consumers (bots/agents) while preserving fidelity with human pages.  
**2025 Context:** Automated (bot) traffic now makes up ~51% of global web traffic (vs. ~49% human), per Imperva’s 2025 Bad Bot Report (reporting 2024 data). See sources at the end.

---

## 1. Purpose & Scope

Modern web pages ship megabytes of HTML/CSS/JS just to deliver a few kilobytes of informational content. LLM Pages define a **lightweight, structured** companion representation for each human page to let machine consumers (e.g., crawlers, AI agents) retrieve **only** the information they need, dramatically reducing bandwidth, CPU, and cost.

This specification is:
- **Platform-agnostic:** Static sites, custom frameworks, CMS (WordPress, Drupal, etc.).
- **Format-oriented:** Defines discovery, URL conventions, HTTP semantics, and a **minimal mandatory** JSON payload with **extensible** fields.
- **Implementation-neutral:** Any server/application can implement it; separate implementation guides (e.g., WordPress plugin) MAY add AEO features.

---

## 2. Design Goals

1. **Resource Efficiency**  
   - Typical human page: 2–5 MB (plus runtime CPU).  
   - LLM Page target: **5–50 KB** (structured JSON only).  
   - Aim for **95%+ bandwidth** and **90%+ CPU** reduction vs. rendering/scraping the human page.
2. **Parity & Trust**  
   - The LLM Page MUST carry the **same informational content** as the human page (no marketing chrome, ads, nav); see §6.
3. **Interoperability**  
   - Clear discovery, predictable URLs, strict media type, and JSON Schema validation.
4. **Extensibility**  
   - Minimal required core + optional fields; versioned evolution.

---

## 3. Discovery

### 3.1 `llms.txt`
Implementations SHOULD publish a newline-delimited list of LLM Page URLs at:
- `https://example.com/llms.txt` or
- `https://example.com/.well-known/llms.txt`

Each line is an absolute URL to an LLM Page endpoint (see §4).

```
https://example.com/blog/post-a/llm/
https://example.com/guides/xyz/llm/
https://example.com/about/llm/
```

> **Robots.txt & Sitemaps**: `llms.txt` does **not** override `robots.txt`. Publishers MAY list `/llm/` endpoints in sitemaps. Robots directives apply to both human and LLM endpoints.

---

## 4. URL & Negotiation

### 4.1 Path Convention
The recommended path form appends `/llm/` to the canonical human URL:

- Human: `https://example.com/blog/post-title/`  
- LLM:   `https://example.com/blog/post-title/llm/`

### 4.2 Content Negotiation (Optional, Advanced)
Servers MAY also serve LLM content at the canonical URL via `Accept` negotiation:

- Request header: `Accept: application/llmpage+json`
- Response header: `Content-Type: application/llmpage+json; charset=utf-8`
- Response should include `Vary: Accept`

Both patterns are valid. If both are provided, they MUST be **content-identical**.

---

## 5. HTTP Semantics

### 5.1 Media Type
LLM Pages MUST be served as:
```
Content-Type: application/llmpage+json; charset=utf-8
```

### 5.2 Required Headers
```
Link: <https://example.com/blog/post-title/>; rel="canonical"
Cache-Control: public, max-age=3600, stale-while-revalidate=300
ETag: "content-hash-or-strong-validator"
Vary: Accept
```

### 5.3 Status Codes
- **200 OK** — Valid LLM Page JSON returned.
- **404 Not Found** — No LLM version exists for this human page.
- **503 Service Unavailable** — Temporarily unavailable; include `Retry-After`.
- **429 Too Many Requests** — Apply rate limits; include `Retry-After`.

### 5.4 Compression
Servers SHOULD enable gzip or brotli for JSON responses.

### 5.5 Bidirectional Linking (Human → LLM)
Add this to the human page HTML:
```html
<link rel="alternate"
      type="application/llmpage+json"
      href="https://example.com/blog/post-title/llm/"
      title="LLM Structured Content" />
```

---

## 6. Content Requirements

### 6.1 Completeness Principle (MUST)
Include **all meaningful informational content** from the human page:
- Body text and headings
- Key lists, table text (as text or normalized arrays)
- Image **alt** and captions
- Audio/video transcripts (when available)

### 6.2 Exclusions (SHOULD)
Exclude navigation, ads, cookie prompts, social share UIs, purely decorative elements, and comments **unless** they are integral to the content (e.g., Q&A pages).

### 6.3 Internationalization
- Use **BCP 47** language tags (e.g., `en-US`).  
- Provide `alternateLanguagePages` to link localized equivalents.

---

## 7. JSON Payload

### 7.1 Minimal Core (MUST)
```json
{
  "specVersion": "1.0.0",
  "url": "https://example.com/blog/post-title/",
  "title": "Page title",
  "content": "Full textual content of the page",
  "dateModified": "2025-08-30T10:30:00Z",
  "language": "en-US"
}
```

### 7.2 Recommended Fields (SHOULD)
```json
{
  "url": "https://example.com/blog/post-title/",
  "title": "Complete Guide to Web Optimization",
  "content": "Full textual content...",
  "dateModified": "2025-08-30T10:30:00Z",
  "datePublished": "2025-08-28T09:00:00Z",
  "language": "en-US",
  "author": {
    "name": "Jane Smith",
    "url": "https://example.com/authors/jane-smith/"
  },
  "excerpt": "Brief summary of the content",
  "wordCount": 1500,
  "categories": ["Web Development", "Performance"],
  "tags": ["optimization", "speed", "efficiency"],
  "media": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "alt": "Alternative text",
      "caption": "Caption if available",
      "width": 800,
      "height": 600
    },
    {
      "type": "video",
      "url": "https://example.com/video.mp4",
      "transcript": "Full transcript text...",
      "duration": 180,
      "thumbnail": "https://example.com/video-thumb.jpg"
    }
  ],
  "alternateLanguagePages": [
    {"lang": "es-ES", "url": "https://example.com/es/blog/post-title/llm/"}
  ],
  "sourceContentHash": "sha256-BASE64-OF-HUMAN-CONTENT"
}
```

> `sourceContentHash` is a **drift-detection** aid: compute a hash of the human page’s normalized text. Agents can check for divergence without re-scraping HTML.

---

## 8. Validation & Conformance

### 8.1 JSON Schema
Publishers SHOULD validate payloads against official JSON Schemas:
- `llm-page-core.schema.json` (minimal core)  
- `llm-page-article.schema.json` (example extension)

Schemas use draft 2020-12; include `$id` and `$schema` and are semver‑versioned. Implementers MUST include `"specVersion"` in every payload.

### 8.2 Conformance Language
- **MUST / MUST NOT** — normative, required for compliance.
- **SHOULD / SHOULD NOT** — strong recommendation; deviations need justification.
- **MAY** — optional behavior.

### 8.3 Test Suite
A conformance harness SHOULD validate:
- Media type and headers
- Required fields
- Date formats (ISO 8601, UTC/Z)
- i18n tags (BCP 47)
- Canonical linkage and content parity

---

## 9. Security & Privacy

- **Input/Output Safety:** Sanitize inputs; escape outputs; return only necessary fields.
- **Rate Limiting:** Use 429 + `Retry-After`; apply user‑agent fingerprinting as needed.
- **CORS:** Default to restrictive (no wildcard). If cross-origin access is intended, scope origins explicitly.
- **Auth (Optional):** API keys or tokens for premium data; document 401/403 semantics.
- **Robots & Privacy:** Respect `robots.txt`; avoid exposing PII inadvertently in structured content.

---

## 10. Performance

- **Caching:** `Cache-Control: public, max-age=3600, stale-while-revalidate=300` (tune per site).  
- **ETag/Last‑Modified:** Provide validators; support conditional requests.  
- **CDN:** Encourage CDN distribution of JSON endpoints.  
- **Compression:** gzip/brotli enabled by default.

---

## 11. Versioning & Governance

- **Spec SemVer:** Increment **major** for breaking changes; **minor** for additive fields; **patch** for clarifications.  
- **Payload Versioning:** The `"specVersion"` field in JSON MUST match a published spec release.
- **Extensions:** Community MAY propose namespaced fields (e.g., `"x-vendor-field"`). Maintain a public registry of extensions and schemas.  
- **Change Process:** Use an RFC workflow (issue + PR), CI validation for examples, and tagged releases.

---

## 12. Implementation Guidance (Non‑Normative)

- **Static Sites:** Pre-generate JSON per page during build; include hash in filename for immutable caching.  
- **Dynamic Sites:** Generate on-demand, cache aggressively, and update on edit events.  
- **CMS Plugins:** Provide admin toggles, drift monitors, and analytics (bytes saved, CPU avoided).  
- **WordPress Example:** Implement `/llm/` routes, admin validation, WP‑CLI bulk generation, and diagnostics isolated to admin-only context.

---

## 13. Rationale & 2025 Context

- Automated traffic crossed a symbolic threshold in reports published 2025, with bots ≈ **51%** of traffic vs humans at ≈ **49%**. This shift makes an efficiency-first machine interface a necessity rather than a luxury.

---

## 14. Sources (2025)

- Imperva / Thales **2025 Bad Bot Report** overview and press materials (51% automated traffic):  
  - https://www.thalesgroup.com/en/worldwide/digital-identity-and-security/magazine/bad-bots-rise-internet-traffic-hits-record-levels  
  - https://cpl.thalesgroup.com/about-us/newsroom/2025-imperva-bad-bot-report-ai-internet-traffic  
  - https://ca.finance.yahoo.com/news/bots-now-majority-internet-traffic-101810746.html  
- Imperva blog summary (trend details): https://www.imperva.com/blog/2025-imperva-bad-bot-report-how-ai-is-supercharging-the-bot-threat/  
- Cloudflare (crawler growth context): https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/

---

*End of Spec.*
