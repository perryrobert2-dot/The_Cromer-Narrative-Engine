/**
 * Cleans prose of common AI meta-commentary and "slop".
 */
export function cleanProse(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Strip "The Render Layer has completed..." and similar blocks
  const metaPatterns = [
    /The Render Layer has completed[\s\S]*/i,
    /Narrative block complete[\s\S]*/i,
    /Word count:[\s\S]*/i,
    /Prose density:[\s\S]*/i,
    /Primary voice:[\s\S]*/i,
    /Style guide has been followed[\s\S]*/i,
    /Semantic directives have been followed[\s\S]*/i,
    /Factual constraints have been followed[\s\S]*/i,
    /Trailing edge for context matching[\s\S]*/i,
    /\*\*\*[\s\S]*The Render Layer[\s\S]*/i
  ];

  metaPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 2. Strip common AI "intro" slop
  const introPatterns = [
    /^Here is the next segment:?/i,
    /^Continuing the narrative:?/i,
    /^Based on the state:?/i
  ];

  introPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned.trim();
}
