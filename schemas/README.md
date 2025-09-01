
# LLM Pages Spec — Schemas & CI

- **Schemas**: `schemas/llm-page-core.schema.json` and `schemas/llm-page-article.schema.json` (Draft 2020-12).
- **Examples**: `examples/core-minimal.json`, `examples/article-recommended.json`.
- **Validation**: `npm run validate` (uses ajv-cli).

## Quick Start
```bash
npm i
npm run validate
```

## GitHub Actions
`.github/workflows/validate-llm-pages.yml` validates all examples against both schemas on every push/PR.


## Content-Type Extensions
- **Product**: `schemas/llm-page-product.schema.json` with example `examples/product.json`
- **HowTo**: `schemas/llm-page-howto.schema.json` with example `examples/howto.json`
- **FAQ**: `schemas/llm-page-faq.schema.json` with example `examples/faq.json`


- **HowTo+FAQ Combined**: `schemas/llm-page-howto-faq.schema.json` with example `examples/howto-faq.json`


## Refinements (latest)
- **Product**: `offers[].availability` now restricted to enum; `offers[].priceCurrency` must be ISO 4217 (^[A-Z]{3}$).
- **HowTo / HowTo+FAQ**: `steps[].image` accepts either a URI string **or** a rich object `{url, alt, caption, width, height}`.
