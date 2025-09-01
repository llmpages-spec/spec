type Article = {
  slug: string;
  title: string;
  body: string;
};

const FAKE_DB: Record<string, Article> = {
  hello: { slug: 'hello', title: 'Hello World', body: 'Welcome to LLM Pages.' }
};

export async function getArticle(slug: string): Promise<Article> {
  return FAKE_DB[slug] || { slug, title: slug, body: 'Generated content' };
}

export async function createArticlePayload(slug: string) {
  const a = await getArticle(slug);
  const now = new Date().toISOString();
  return {
    schema_version: '1.0.0',
    type: 'article',
    id: `https://example.com/articles/${a.slug}`,
    source_url: `https://example.com/blog/${a.slug}`,
    title: a.title,
    language: 'en',
    summary: 'Demo article',
    tags: ['demo'],
    last_modified: now,
    content_version: '1.0.0',
    page_checksum: 'demo==',
    license: 'CC-BY-4.0',
    publisher: { name: 'Example', url: 'https://example.com' },
    content: {
      authors: [{ name: 'Demo' }],
      published_at: now,
      updated_at: now,
      body: a.body,
      sections: [{ heading: 'Intro', content: a.body }]
    }
  };
}

