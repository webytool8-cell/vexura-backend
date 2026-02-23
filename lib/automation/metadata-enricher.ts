export function enrichMetadata(vectorData: any, prompt: string, custom?: any) {
  const slug = generateSlug(prompt);
  const keywords = extractKeywords(prompt);
  const uniqueId = generateUniqueId();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.vexura.io';

  return {
    id: uniqueId,
    slug,
    
    // SEO Metadata
    seo: {
      title: `${vectorData.name} - Premium Vector Icon | VEXURA`,
      description: `Download ${vectorData.name} - Professional AI-generated vector icon. Perfect for UI design, branding, and digital projects. Commercial license available.`,
      keywords: [
        ...keywords,
        'vector icon',
        'svg download',
        'ai generated',
        'premium design',
        'commercial license',
        'ui icon'
      ],
      canonicalUrl: `${baseUrl}/marketplace/${slug}`,
      ogImage: `${baseUrl}/api/og/${uniqueId}`,
      
      // Schema.org Structured Data
      structuredData: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: vectorData.name,
        image: `${baseUrl}/api/og/${uniqueId}`,
        description: `Premium ${vectorData.type || 'icon'} - AI-generated vector graphic`,
        sku: uniqueId,
        brand: {
          '@type': 'Brand',
          name: 'VEXURA'
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/marketplace/${slug}`,
          priceCurrency: 'USD',
          price: '0.00',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'VEXURA'
          }
        }
      }
    },

    // Pinterest Metadata
    pinterest: {
      title: `${vectorData.name} | Free Vector Icon`,
      description: `${prompt} - Premium AI-generated vector icon. Click to download SVG, PNG, or customize. #vectoricon #uidesign #freedownload`,
      board: categorizeToPinterestBoard(keywords),
      altText: `${vectorData.name} vector icon - ${keywords.slice(0, 3).join(', ')}`,
      
      // Rich Pin Product data
      richPin: {
        product: {
          price: 0,
          currency: 'USD',
          availability: 'in stock'
        }
      }
    },

    // Marketplace Data
    marketplace: {
      price: 0,
      license: 'commercial',
      formats: ['svg', 'png', 'json'],
      category: vectorData.type || 'icon',
      tags: keywords,
      downloads: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Original Vector Data
    vector: vectorData,
    prompt,
    ...custom
  } as any;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

function generateUniqueId(): string {
  return `vex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractKeywords(prompt: string): string[] {
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  return prompt
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 15);
}

function categorizeToPinterestBoard(keywords: string[]): string {
  const boardMap: Record<string, string> = {
    'ui': 'UI Design Icons',
    'brand': 'Branding & Logos',
    'tech': 'Technology Icons',
    'nature': 'Nature & Organic',
    'abstract': 'Abstract Art',
    'business': 'Business Icons'
  };

  for (const [key, board] of Object.entries(boardMap)) {
    if (keywords.some(k => k.includes(key))) {
      return board;
    }
  }
  
  return 'Vector Icons Collection';
}

/**
 * Enrich metadata from manually uploaded JSON file
 */
export function enrichMetadataFromJSON(vectorData: any, fileName: string) {
  // Extract name from filename (remove .json extension)
  const nameFromFile = fileName.replace('.json', '').replace(/[-_]/g, ' ');
  
  // Use vector name or fallback to filename
  const displayName = vectorData.name || nameFromFile;
  
  // Generate prompt from name for keywords
  const prompt = displayName;
  
  const slug = generateSlug(displayName);
  const keywords = extractKeywords(prompt);
  const uniqueId = generateUniqueId();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.vexura.io';

  return {
    id: uniqueId,
    slug,
    
    // SEO Metadata
    seo: {
      title: `${displayName} - Premium Vector Icon | VEXURA`,
      description: `Download ${displayName} - Professional vector graphic. Perfect for UI design, branding, and digital projects. Commercial license available.`,
      keywords: [
        ...keywords,
        'vector icon',
        'svg download',
        'premium design',
        'commercial license',
        'ui icon'
      ],
      canonicalUrl: `${baseUrl}/marketplace/${slug}`,
      ogImage: `${baseUrl}/api/og/${uniqueId}`,
      
      // Schema.org Structured Data
      structuredData: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: displayName,
        image: `${baseUrl}/api/og/${uniqueId}`,
        description: `Premium vector graphic - ${displayName}`,
        sku: uniqueId,
        brand: {
          '@type': 'Brand',
          name: 'VEXURA'
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/marketplace/${slug}`,
          priceCurrency: 'USD',
          price: '0.00',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'VEXURA'
          }
        }
      }
    },

    // Pinterest Metadata
    pinterest: {
      title: `${displayName} | Free Vector Icon`,
      description: `${displayName} - Premium vector graphic. Click to download SVG, PNG, or customize. #vectoricon #uidesign #freedownload`,
      board: categorizeToPinterestBoard(keywords),
      altText: `${displayName} vector icon - ${keywords.slice(0, 3).join(', ')}`,
      
      // Rich Pin Product data
      richPin: {
        product: {
          price: 0,
          currency: 'USD',
          availability: 'in stock'
        }
      }
    },

    // Marketplace Data
    marketplace: {
      price: 0,
      license: 'commercial',
      formats: ['svg', 'png', 'json'],
      category: vectorData.type || 'icon',
      tags: keywords,
      downloads: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Original Vector Data
    vector: vectorData,
    prompt: displayName,
    source: 'manual_upload',

    // Validation placeholder (will be populated by validator)
    validation: {
      score: 0,
      warnings: [],
      autoFixed: false
    }
  } as any;
}
