import Anthropic from '@anthropic-ai/sdk';
import { enrichMetadata } from './metadata-enricher';
import { postToPinterest } from './pinterest-poster';
import { createMarketplaceListing } from '../database/marketplace';
import { generateOGImage } from '../generators/og-image';
import { generatePinterestImage } from '../generators/pinterest-image';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

interface PipelineOptions {
  skipPinterest?: boolean;
  customMetadata?: any;
}

export async function executeAutomationPipeline(
  prompt: string,
  options: PipelineOptions = {}
) {
  console.log('🚀 Starting automation pipeline for:', prompt);

  try {
    // STEP 1: Generate Vector with Claude
    const vectorData = await generateVectorWithClaude(prompt);
    
    // STEP 2: Enrich Metadata
    const enriched = enrichMetadata(vectorData, prompt, options.customMetadata);
    
    // STEP 3: Create Marketplace Listing (Database)
    const listing = await createMarketplaceListing(enriched);
    
    // STEP 4: Generate OG Image
    await generateOGImage(enriched, listing.id);
    
    // STEP 5: Generate Pinterest Image
    const pinterestImage = await generatePinterestImage(enriched, listing.id);
    
    // STEP 6: Post to Pinterest
    let pinterestResult = null;
    if (!options.skipPinterest) {
      pinterestResult = await postToPinterest({
        ...enriched.pinterest,
        imageUrl: pinterestImage.url,
        link: `${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${listing.slug}?utm_source=pinterest`
      });
    }
    
    console.log('✅ Pipeline complete!');
    
    return {
      success: true,
      listing,
      pinterestPin: pinterestResult,
      urls: {
        marketplace: `${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${listing.slug}`,
        pinterest: pinterestResult?.pinUrl || null
      }
    };
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    throw error;
  }
}

async function generateVectorWithClaude(prompt: string) {
  const systemPrompt = `You are a professional vector icon designer. Generate clean, geometric SVG icons following modern UI icon design standards...`; // Your existing prompt
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }
  
  return JSON.parse(content.text);
}
