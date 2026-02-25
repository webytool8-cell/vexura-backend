import Anthropic from '@anthropic-ai/sdk';
import { enrichMetadata } from './metadata-enricher';
import { createMarketplaceListing, updatePinterestInfo } from '../database/marketplace';
import { validateAndFixIcon, calculateQualityScore } from '../validators/icon-validator'; // ADD THIS
import { buildSystemPrompt } from '../../prompts/system-prompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

function shouldEnforceMonochrome(prompt: string): boolean {
  return /\b(monochrome|monotone|black\s*(and|&)\s*white|grayscale|single\s*color)\b/i.test(prompt);
}

export async function executeAutomationPipeline(prompt: string) {
  console.log('🚀 Starting pipeline for:', prompt);

  try {
    // STEP 1: Generate Vector
    const vectorData = await generateVectorWithClaude(prompt);
    console.log('✅ Vector generated');
    
    // STEP 2: VALIDATE AND FIX (NEW!)
    const validation = validateAndFixIcon(vectorData, { iconTypeHint: "icon", prompt, enforceMonochrome: shouldEnforceMonochrome(prompt) });
    const score = calculateQualityScore(validation);
    
    console.log(`📊 Quality Score: ${score}/100`);
    
    if (validation.errors.length > 0) {
      console.error('❌ Validation errors:', validation.errors);
      throw new Error(`Icon validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Warnings:', validation.warnings);
    }
    
    // Use the fixed version
    const fixedVector = validation.fixed;
    
    // STEP 3: Enrich Metadata
    const enriched = enrichMetadata(fixedVector, prompt);
    console.log('✅ Metadata enriched');
    
    // Add validation metadata
    enriched.validation = {
      score,
      warnings: validation.warnings,
      autoFixed: validation.warnings.length > 0
    };
    
    // STEP 4: Save to Database
    const listing = await createMarketplaceListing(enriched);
    console.log('✅ Saved to marketplace database');
    
    return {
      success: true,
      listing,
      validation: {
        score,
        warnings: validation.warnings,
        errors: validation.errors
      },
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
  const systemPrompt = buildSystemPrompt(prompt);

  console.log('🧠 System prompt built with pattern guidance');
  
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
