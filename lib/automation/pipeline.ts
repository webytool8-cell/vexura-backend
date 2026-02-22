import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface PipelineResult {
  success: boolean;
  vectorData: any;
  prompt: string;
}

export async function executeAutomationPipeline(
  prompt: string
): Promise<PipelineResult> {
  console.log('🚀 Starting pipeline for:', prompt);

  try {
    // STEP 1: Generate Vector with Claude
    const vectorData = await generateVectorWithClaude(prompt);
    
    console.log('✅ Vector generated successfully');
    
    return {
      success: true,
      vectorData,
      prompt
    };
    
  } catch (error: any) {
    console.error('❌ Pipeline failed:', error);
    throw new Error(`Pipeline failed: ${error.message}`);
  }
}

async function generateVectorWithClaude(prompt: string) {
  const systemPrompt = `You are a professional vector icon designer. Generate clean, geometric SVG icons.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanations.
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
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  
  // Parse the JSON response
  try {
    return JSON.parse(content.text);
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content.text);
    throw new Error('Invalid JSON response from Claude');
  }
}
