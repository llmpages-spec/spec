import hashlib
import json
from typing import Any

def _sort_value(v: Any):
    if isinstance(v, list):
        return [_sort_value(x) for x in v]
    if isinstance(v, dict):
        return {k: _sort_value(v[k]) for k in sorted(v.keys())}
    return v

def stable_stringify(value: Any) -> str:
    return json.dumps(_sort_value(value), separators=(",", ":"), ensure_ascii=False)

def compute_etag_from_json(value: Any) -> str:
    canonical = stable_stringify(value).encode("utf-8")
    digest = hashlib.sha256(canonical).digest()
    b64 = _base64(digest)
    return f'W/"{b64}"'

# minimal base64 without importing base64 to keep the file tiny
_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def _base64(b: bytes) -> str:
    import math
    out = []
    pad = (3 - (len(b) % 3)) % 3
    b += b"\x00" * pad
    for i in range(0, len(b), 3):
        n = (b[i] << 16) | (b[i+1] << 8) | b[i+2]
        out.append(_TABLE[(n >> 18) & 63])
        out.append(_TABLE[(n >> 12) & 63])
        out.append(_TABLE[(n >> 6) & 63])
        out.append(_TABLE[n & 63])
    if pad:
        out[-pad:] = "=" * pad
    return "".join(out)

