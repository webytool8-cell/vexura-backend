import Anthropic from '@anthropic-ai/sdk';
import { enrichMetadata } from './metadata-enricher';
import { createMarketplaceListing, updatePinterestInfo } from '../database/marketplace';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function executeAutomationPipeline(prompt: string) {
  console.log('🚀 Starting pipeline for:', prompt);

  try {
    // STEP 1: Generate Vector
    const vectorData = await generateVectorWithClaude(prompt);
    console.log('✅ Vector generated');
    
    // STEP 2: Enrich Metadata
    const enriched = enrichMetadata(vectorData, prompt);
    console.log('✅ Metadata enriched');
    
    // STEP 3: Save to Database
    const listing = await createMarketplaceListing(enriched);
    console.log('✅ Saved to marketplace database');
    
    // STEP 4: Post to Pinterest (optional - can skip for now)
    // const pinterestResult = await postToPinterest(enriched);
    // await updatePinterestInfo(listing.slug, pinterestResult.pinId, pinterestResult.pinUrl);
    
    return {
      success: true,
      listing,
      urls: {
        marketplace: `${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${listing.slug}`,
        api: `${process.env.NEXT_PUBLIC_BASE_URL}/api/marketplace/${listing.slug}`
      }
    };
    
  } catch (error: any) {
    console.error('❌ Pipeline failed:', error);
    throw error;
  }
}

async function generateVectorWithClaude(prompt: string) {
  const systemPrompt = `You are a professional vector icon designer. Generate clean, geometric SVG icons.

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}`;
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }
  
  return JSON.parse(content.text);
}
