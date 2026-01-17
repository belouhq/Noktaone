import { InternalState } from './types';

const GPT_VISION_PROMPT = `
Observe cette image du visage.
Évalue uniquement le niveau d'activation physiologique global perçu.
Classe-le dans UNE SEULE de ces catégories :

- HIGH_ACTIVATION (tension visible, micro-crispations, respiration haute)
- LOW_ENERGY (fatigue visible, traits relâchés, regard bas)
- REGULATED (visage neutre, détendu, stable)

RÈGLES STRICTES :
- Réponds UNIQUEMENT par le nom de la catégorie
- Pas d'explication
- Pas de diagnostic
- Pas de justification

Réponse (un seul mot) :
`;

export async function analyzeFrame(imageBase64: string): Promise<{
  state: InternalState;
  confidence: number;
  skaneIndex: number;
}> {
  try {
    const response = await fetch('/api/skane/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Skane analysis error:', error);
    // Fallback : retourne REGULATED par défaut
    return {
      state: 'REGULATED',
      confidence: 0.5,
      skaneIndex: 30
    };
  }
}

export { GPT_VISION_PROMPT };
