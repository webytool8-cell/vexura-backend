import Anthropic from '@anthropic-ai/sdk';
import { enrichMetadata } from './metadata-enricher';
import { createMarketplaceListing, updatePinterestInfo } from '../database/marketplace';
import { postToPinterest } from './pinterest-poster';
import { validateAndFixIcon, calculateQualityScore } from '../validators/icon-validator';
import { buildSystemPrompt } from '../../prompts/system-prompt';

type AssetType = 'icon' | 'illustration';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

function shouldEnforceMonochrome(prompt: string, type: AssetType): boolean {
  if (type !== 'icon') return false;
  return /\b(monochrome|monotone|black\s*(and|&)\s*white|grayscale|single\s*color)\b/i.test(prompt);
}

function inferAssetType(prompt: string, explicitType?: string): AssetType {
  const normalized = (explicitType || '').toLowerCase();
  if (normalized === 'illustration') return 'illustration';
  if (normalized === 'icon') return 'icon';

  return /\b(illustration|scene|mascot|character|poster|hero|story)\b/i.test(prompt)
    ? 'illustration'
    : 'icon';
}

function buildOrganicSystemPrompt(prompt: string): string {
  return `
You are a professional vector illustrator creating organic, flowing designs.

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "name": "Asset Name",
  "type": "illustration",
  "width": 400,
  "height": 400,
  "elements": [...]
}

ORGANIC ILLUSTRATION RULES:
- Prefer flowing curves, layered compositions, and richer scene-like structure.
- Use multiple elements for depth and visual storytelling.
- Keep artwork inside safe zone with balanced composition.
- No transforms, no gradients/filters, and no class/data-id attributes.

USER PROMPT: "${prompt}"
`;
}

export async function executeAutomationPipeline(
  prompt: string,
  options?: { price?: number; type?: AssetType | string }
) {
  console.log('🚀 Starting pipeline for:', prompt);

  try {
    const assetType = inferAssetType(prompt, options?.type);

    // STEP 1: Generate Vector
    const vectorData = await generateVectorWithClaude(prompt, assetType);
    vectorData.type = assetType;
    console.log(`✅ ${assetType} generated`);

    // STEP 2: Validate and fix
    const validation = validateAndFixIcon(vectorData, {
      iconTypeHint: assetType,
      prompt,
      enforceMonochrome: shouldEnforceMonochrome(prompt, assetType)
    });
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
    const fixedVector = {
      ...validation.fixed,
      type: assetType
    };

    // STEP 3: Enrich Metadata
    const enriched = enrichMetadata(fixedVector, prompt);

    if (typeof options?.price === 'number' && Number.isFinite(options.price) && options.price >= 0) {
      enriched.marketplace.price = options.price;
      enriched.seo.structuredData.offers.price = options.price.toFixed(2);
      enriched.pinterest.richPin.product.price = options.price;
      const isFree = options.price === 0;
      const label = assetType === 'illustration' ? 'Vector Illustration' : 'Vector Icon';
      enriched.pinterest.title = `${fixedVector.name} | ${isFree ? 'Free' : 'Premium'} ${label}`;
    }

    if (assetType === 'illustration') {
      enriched.marketplace.category = 'illustrations';
    }

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

    // STEP 5 (optional): Post to Pinterest
    const shouldPostToPinterest = process.env.PINTEREST_AUTO_POST === 'true';

    if (shouldPostToPinterest) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.vexura.io';

      try {
        const pinResult = await postToPinterest({
          title: enriched.pinterest.title,
          description: enriched.pinterest.description,
          board: enriched.pinterest.board,
          imageUrl: `${baseUrl}/api/pinterest/image/${listing.slug}`,
          link: `${baseUrl}/marketplace/${listing.slug}`,
          altText: enriched.pinterest.altText
        });

        await updatePinterestInfo(listing.slug, pinResult.pinId, pinResult.pinUrl);
        listing.pinterest.pinId = pinResult.pinId;
        listing.pinterest.pinUrl = pinResult.pinUrl;
        console.log('✅ Posted to Pinterest:', pinResult.pinId);
      } catch (error) {
        // Do not fail the core pipeline if Pinterest posting fails.
        console.warn('⚠️ Pinterest auto-post failed:', error);
      }
    }

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

async function generateVectorWithClaude(prompt: string, type: AssetType) {
  const systemPrompt = type === 'illustration' ? buildOrganicSystemPrompt(prompt) : buildSystemPrompt(prompt);

  console.log(`🧠 System prompt built for ${type}`);

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
