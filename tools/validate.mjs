#!/usr/bin/env node
/**
 * Validate LLM Page JSON against a schema.
 * Usage:
 *   node tools/validate.mjs --schema article --file examples/article.llmpage.json [--json]
 */

import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const [k, v] = a.startsWith('--') ? a.replace(/^--/, '').split('=') : ['file', a];
    return [k, v ?? true];
  }));

  const schemaKey = args.schema || 'article';
  const filePath = args.file || args._ || null;
  const jsonOutput = !!args.json;

  if (!filePath) {
    console.error('Error: --file path/to/payload.json is required');
    process.exit(2);
  }

  // Lazy import Ajv and ajv-formats, provide guidance if missing
  let Ajv, addFormats;
  try {
    ({ default: Ajv } = await import('ajv/dist/2020.js'));
    ({ default: addFormats } = await import('ajv-formats'));
  } catch (e) {
    console.error('Failed to load Ajv dependencies:', e?.message || e);
    console.error('Try installing with: npm i ajv ajv-formats');
    process.exit(2);
  }

  const schemaPath = schemaKey === 'package'
    ? path.join(process.cwd(), 'schemas', `llm-site-package.schema.json`)
    : path.join(process.cwd(), 'schemas', `llm-page-${schemaKey}.schema.json`);
  let schema;
  try {
    schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  } catch (e) {
    console.error(`Could not read schema at ${schemaPath}.`);
    process.exit(2);
  }

  let data;
  try {
    data = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (e) {
    console.error(`Could not read payload at ${filePath}.`);
    process.exit(2);
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (jsonOutput) {
    console.log(JSON.stringify({ valid, errors: validate.errors || [] }, null, 2));
    process.exit(valid ? 0 : 1);
  }

  if (valid) {
    console.log(`OK: ${filePath} is valid against ${schemaKey}`);
    process.exit(0);
  } else {
    console.error(`Invalid: ${filePath} does not conform to ${schemaKey}`);
    for (const err of validate.errors || []) {
      console.error(`- ${err.instancePath || '/'} ${err.message}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});

