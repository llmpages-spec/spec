import { NextResponse } from 'next/server';
import { computeETagFromJSON } from '../../../../utilities/canonicalize';
import { createArticlePayload } from '../../../lib/llm';

export const revalidate = 300; // ISR for static params, if used

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const payload = await createArticlePayload(params.slug);
  const etag = computeETagFromJSON(payload);

  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

  return new NextResponse(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/llmpage+json; version=1',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'ETag': etag
    }
  });
}

