# Next.js Examples: LLM Page Endpoints (SSG + SSR)

This guide shows minimal code snippets for both Next.js Pages Router and App Router.

## Pages Router (pages/)

### SSG (getStaticProps)

pages/[slug]/llm.ts:

```ts
import type { GetStaticProps, GetStaticPaths } from 'next';
import { createArticlePayload } from '../../lib/llm';

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await fetchSlugs();
  return { paths: slugs.map((s) => ({ params: { slug: s } })), fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params!.slug as string;
  const article = await getArticle(slug);
  const payload = createArticlePayload(article);
  return {
    props: { payload },
    revalidate: 300, // ISR: 5 minutes
  };
};

export default function Handler({ payload }: { payload: any }) {
  return (
    <>
      <meta httpEquiv="Content-Type" content="application/llmpage+json; version=1" />
      <pre>{JSON.stringify(payload, null, 2)}</pre>
    </>
  );
}
```

Note: In production serve JSON directly (e.g., via Next API route) or set headers in middleware.

### SSR (getServerSideProps)

pages/[slug]/llm.ts:

```ts
import type { GetServerSideProps } from 'next';
import { createArticlePayload } from '../../lib/llm';

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const slug = params!.slug as string;
  const article = await getArticle(slug);
  const payload = createArticlePayload(article);
  res.setHeader('Content-Type', 'application/llmpage+json; version=1');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  return { props: { payload } };
};

export default function Handler({ payload }: { payload: any }) {
  return <pre>{JSON.stringify(payload, null, 2)}</pre>;
}
```

## App Router (app/)

### SSG (generateStaticParams + Route Handler)

app/[slug]/llm/route.ts:

```ts
import { NextResponse } from 'next/server';
import { createArticlePayload } from '../../../lib/llm';

export async function generateStaticParams() {
  const slugs = await fetchSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const article = await getArticle(params.slug);
  const payload = createArticlePayload(article);
  const json = JSON.stringify(payload);
  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/llmpage+json; version=1',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      // 'ETag': '"abc"', // compute from content if desired
    },
  });
}
```

### SSR (Route Handler, dynamic)

app/[slug]/llm/route.ts:

```ts
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  // same body as SSG, but dynamic data fetch
}
```

## Linking from Human Page

Add to head of the human page:

```html
<link rel="alternate" type="application/llmpage+json" href="https://example.com/blog/my-article/llm" />
```

## Tips
- Use the schemas in ../../schemas for type contracts; consider codegen for TS types.
- Compute ETag from a canonicalized payload to enable 304s.
- For SSG, consider writing a static JSON file via a build script.

