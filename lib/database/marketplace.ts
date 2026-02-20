import { createClient } from '@vercel/kv'; // or your DB choice

const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
});

export async function createMarketplaceListing(enrichedData: any) {
  const listing = {
    id: enrichedData.id,
    slug: enrichedData.slug,
    ...enrichedData
  };

  // Save to KV
  await kv.set(`marketplace:${listing.slug}`, JSON.stringify(listing));
  await kv.set(`marketplace:id:${listing.id}`, JSON.stringify(listing));
  
  // Add to index
  await kv.zadd('marketplace:index', {
    score: Date.now(),
    member: listing.slug
  });

  return listing;
}

export async function getMarketplaceListing(slug: string) {
  const data = await kv.get(`marketplace:${slug}`);
  return data ? JSON.parse(data as string) : null;
}

export async function listMarketplaceItems(limit = 50, offset = 0) {
  const slugs = await kv.zrange('marketplace:index', offset, offset + limit - 1, {
    rev: true
  });
  
  const items = await Promise.all(
    slugs.map(slug => getMarketplaceListing(slug as string))
  );
  
  return items.filter(Boolean);
}
