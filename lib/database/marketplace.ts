import { kv } from '@vercel/kv';

export interface MarketplaceItem {
  id: string;
  slug: string;
  name: string;
  prompt: string;
  
  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string;
    structuredData: any;
  };
  
  // Pinterest
  pinterest: {
    title: string;
    description: string;
    board: string;
    altText: string;
    pinId?: string;
    pinUrl?: string;
  };
  
  // Marketplace
  marketplace: {
    price: number;
    license: string;
    formats: string[];
    category: string;
    tags: string[];
    downloads: number;
    views: number;
    createdAt: string;
    updatedAt: string;
  };
  
  // Vector data
  vector: any;
}

/**
 * Create a new marketplace listing
 */
export async function createMarketplaceListing(enrichedData: any): Promise<MarketplaceItem> {
  const listing: MarketplaceItem = {
    id: enrichedData.id,
    slug: enrichedData.slug,
    name: enrichedData.vector.name,
    prompt: enrichedData.prompt,
    seo: enrichedData.seo,
    pinterest: enrichedData.pinterest,
    marketplace: enrichedData.marketplace,
    vector: enrichedData.vector
  };

  try {
    // Save primary record by slug
    await kv.set(`marketplace:${listing.slug}`, JSON.stringify(listing));
    
    // Save by ID for quick lookups
    await kv.set(`marketplace:id:${listing.id}`, JSON.stringify(listing));
    
    // Add to sorted index (newest first)
    await kv.zadd('marketplace:index', {
      score: Date.now(),
      member: listing.slug
    });
    
    // Add to category index
    await kv.sadd(`marketplace:category:${listing.marketplace.category}`, listing.slug);
    
    // Add to tag indexes
    for (const tag of listing.marketplace.tags) {
      await kv.sadd(`marketplace:tag:${tag}`, listing.slug);
    }
    
    console.log('✅ Marketplace listing created:', listing.slug);
    return listing;
    
  } catch (error) {
    console.error('❌ Failed to create listing:', error);
    throw error;
  }
}

/**
 * Get a marketplace item by slug
 */
export async function getMarketplaceListing(slug: string): Promise<MarketplaceItem | null> {
  try {
    const data = await kv.get(`marketplace:${slug}`);
    
    if (!data) {
      return null;
    }
    
    return typeof data === 'string' ? JSON.parse(data) : (data as MarketplaceItem);
    
  } catch (error) {
    console.error('❌ Failed to get listing:', error);
    return null;
  }
}

/**
 * Get a marketplace item by ID
 */
export async function getMarketplaceListingById(id: string): Promise<MarketplaceItem | null> {
  try {
    const data = await kv.get(`marketplace:id:${id}`);
    
    if (!data) {
      return null;
    }
    
    return typeof data === 'string' ? JSON.parse(data) : (data as MarketplaceItem);
    
  } catch (error) {
    console.error('❌ Failed to get listing by ID:', error);
    return null;
  }
}

/**
 * List marketplace items (paginated)
 */
export async function listMarketplaceItems(limit = 50, offset = 0): Promise<MarketplaceItem[]> {
  try {
    // Get slugs from sorted index (newest first)
    const slugs = await kv.zrange('marketplace:index', offset, offset + limit - 1, {
      rev: true
    });
    
    if (!slugs || slugs.length === 0) {
      return [];
    }
    
    // Fetch all items
    const items = await Promise.all(
      slugs.map(slug => getMarketplaceListing(slug as string))
    );
    
    return items.filter(Boolean) as MarketplaceItem[];
    
  } catch (error) {
    console.error('❌ Failed to list items:', error);
    return [];
  }
}

/**
 * Get items by category
 */
export async function getItemsByCategory(category: string, limit = 50): Promise<MarketplaceItem[]> {
  try {
    const slugs = await kv.smembers(`marketplace:category:${category}`);
    
    if (!slugs || slugs.length === 0) {
      return [];
    }
    
    const items = await Promise.all(
      slugs.slice(0, limit).map(slug => getMarketplaceListing(slug as string))
    );
    
    return items.filter(Boolean) as MarketplaceItem[];
    
  } catch (error) {
    console.error('❌ Failed to get items by category:', error);
    return [];
  }
}

/**
 * Get items by tag
 */
export async function getItemsByTag(tag: string, limit = 50): Promise<MarketplaceItem[]> {
  try {
    const slugs = await kv.smembers(`marketplace:tag:${tag}`);
    
    if (!slugs || slugs.length === 0) {
      return [];
    }
    
    const items = await Promise.all(
      slugs.slice(0, limit).map(slug => getMarketplaceListing(slug as string))
    );
    
    return items.filter(Boolean) as MarketplaceItem[];
    
  } catch (error) {
    console.error('❌ Failed to get items by tag:', error);
    return [];
  }
}

/**
 * Increment download counter
 */
export async function incrementDownloads(slug: string): Promise<void> {
  try {
    const item = await getMarketplaceListing(slug);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    item.marketplace.downloads += 1;
    item.marketplace.updatedAt = new Date().toISOString();
    
    await kv.set(`marketplace:${slug}`, JSON.stringify(item));
    await kv.set(`marketplace:id:${item.id}`, JSON.stringify(item));
    
  } catch (error) {
    console.error('❌ Failed to increment downloads:', error);
  }
}

/**
 * Increment view counter
 */
export async function incrementViews(slug: string): Promise<void> {
  try {
    const item = await getMarketplaceListing(slug);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    item.marketplace.views += 1;
    item.marketplace.updatedAt = new Date().toISOString();
    
    await kv.set(`marketplace:${slug}`, JSON.stringify(item));
    await kv.set(`marketplace:id:${item.id}`, JSON.stringify(item));
    
  } catch (error) {
    console.error('❌ Failed to increment views:', error);
  }
}

/**
 * Update Pinterest info after posting
 */
export async function updatePinterestInfo(slug: string, pinId: string, pinUrl: string): Promise<void> {
  try {
    const item = await getMarketplaceListing(slug);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    item.pinterest.pinId = pinId;
    item.pinterest.pinUrl = pinUrl;
    item.marketplace.updatedAt = new Date().toISOString();
    
    await kv.set(`marketplace:${slug}`, JSON.stringify(item));
    await kv.set(`marketplace:id:${item.id}`, JSON.stringify(item));
    
    console.log('✅ Pinterest info updated for:', slug);
    
  } catch (error) {
    console.error('❌ Failed to update Pinterest info:', error);
  }
}

/**
 * Delete a marketplace item
 */
export async function deleteMarketplaceItem(slug: string): Promise<void> {
  try {
    const item = await getMarketplaceListing(slug);
    
    if (!item) {
      return;
    }
    
    // Remove from indexes
    await kv.zrem('marketplace:index', slug);
    await kv.srem(`marketplace:category:${item.marketplace.category}`, slug);
    
    for (const tag of item.marketplace.tags) {
      await kv.srem(`marketplace:tag:${tag}`, slug);
    }
    
    // Delete records
    await kv.del(`marketplace:${slug}`);
    await kv.del(`marketplace:id:${item.id}`);
    
    console.log('✅ Marketplace item deleted:', slug);
    
  } catch (error) {
    console.error('❌ Failed to delete item:', error);
  }
}

/**
 * Search marketplace items (simple text search)
 */
export async function searchMarketplace(query: string, limit = 50): Promise<MarketplaceItem[]> {
  try {
    // Get all items (for now - can optimize later with full-text search)
    const allItems = await listMarketplaceItems(1000);
    
    const lowerQuery = query.toLowerCase();
    
    const filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.prompt.toLowerCase().includes(lowerQuery) ||
      item.marketplace.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    
    return filtered.slice(0, limit);
    
  } catch (error) {
    console.error('❌ Search failed:', error);
    return [];
  }
}

/**
 * Get marketplace stats
 */
export async function getMarketplaceStats() {
  try {
    const totalCount = await kv.zcard('marketplace:index');
    
    return {
      totalItems: totalCount || 0,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to get stats:', error);
    return {
      totalItems: 0,
      timestamp: new Date().toISOString()
    };
  }
}
