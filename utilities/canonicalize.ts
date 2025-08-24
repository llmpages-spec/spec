import crypto from 'node:crypto';

export function stableStringify(value: any): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortValue(value[key]);
    }
    return out;
  }
  return value;
}

export function computeETagFromJSON(value: any): string {
  const canonical = stableStringify(value);
  const hash = crypto.createHash('sha256').update(canonical).digest('base64');
  return 'W/"' + hash + '"'; // weak ETag with base64 SHA-256
}

