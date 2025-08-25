# Changelog

## 2.3 — 2025-08-25
- Bump spec to 2.3
- Add File Profile (.llm.json) guidance and examples (docs)
- Add optional Site Package profile with schema and example
- Clarify hybrid dynamic patterns (dynamic_endpoint / dynamic_data_url)
- Expand llms.txt discovery examples to include files/endpoints/package
- Update tools: browser validator and CLI to handle package; CI validates package
- Add FAQ “How is this different from AMP?”

## 2.2 — 2025-08-24
- Consolidated local improvements beyond older GitHub version
- Schemas for article, product, event, faq, howto, recipe, job, review
- Example payloads for each type
- Browser-based validator (Ajv via CDN)
- Node CLI validator (Ajv + ajv-formats)
- Canonicalization and ETag utilities (TS/Python)
- Next.js minimal example (App Router) with ETag
- CI workflow validating examples

