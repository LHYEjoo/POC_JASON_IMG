// Mapping of prompts to their associated images
// When a user asks one of these prompts, the answer will include the corresponding image
export const PROMPT_IMAGES: Record<string, string> = {
  // Add image mappings for new questions here if needed
  // Example: 'China noemt Taiwan een \'binnenlandse aangelegenheid\'...': '/img/taiwan_img.jpg',
};

// Check if a prompt should have an image
export function getImageForPrompt(prompt: string): string | undefined {
  // Exact match first
  if (PROMPT_IMAGES[prompt]) {
    return PROMPT_IMAGES[prompt];
  }
  
  return undefined;
}








