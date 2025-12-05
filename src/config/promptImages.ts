// Mapping of prompts to their associated images
// When a user asks one of these prompts, the answer will include the corresponding image
export const PROMPT_IMAGES: Record<string, string> = {
  'Wat was de grootste risico die je nam tijdens de protesten en de gevolgen ervan? Hoe ben je ermee omgegaan?': '/img/protest_img.jpg',
};

// Check if a prompt should have an image
export function getImageForPrompt(prompt: string): string | undefined {
  // Exact match first
  if (PROMPT_IMAGES[prompt]) {
    return PROMPT_IMAGES[prompt];
  }
  
  // Also check for prompts mentioning protests (case-insensitive, partial match)
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('protest') || lowerPrompt.includes('protesten')) {
    return PROMPT_IMAGES['Wat was de grootste risico die je nam tijdens de protesten en de gevolgen ervan? Hoe ben je ermee omgegaan?'];
  }
  
  return undefined;
}

