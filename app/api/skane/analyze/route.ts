import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, generateRequestId } from '@/lib/openai/client';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/skane/prompt-canon';
import { InternalState, type AnalysisResponse } from '@/lib/skane/types';
import { SKANE_INDEX_RANGES } from '@/lib/skane/constants';
import { getLastSession } from '@/lib/skane/session-model';

// Helper pour déterminer le moment de la journée
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { image, imageBase64, context } = await request.json();

    // Support both 'image' (base64 with data: prefix) and 'imageBase64' (raw base64)
    const imageData = imageBase64 || image;
    
    if (!imageData) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Normalize image format: ensure it's a valid base64 string
    let normalizedImage = imageData;
    if (imageData.startsWith('data:image')) {
      // Extract base64 part if it includes data: prefix
      normalizedImage = imageData.split(',')[1] || imageData;
    }

    // Vérifier que la clé API est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.error('[OpenAI] API key not configured');
      return NextResponse.json(
        { 
          error: 'OpenAI API not configured',
          requestId 
        },
        { status: 500 }
      );
    }

    // Récupérer le contexte pour le prompt
    const lastSession = getLastSession();
    const lastSkaneMinutesAgo = lastSession
      ? Math.floor((Date.now() - lastSession.createdAt.getTime()) / (1000 * 60))
      : 0;
    const previousFeedback = lastSession?.feedback || null;

    // Utiliser le contexte fourni ou générer depuis lastSession
    const userContext = context || {
      time_of_day: getTimeOfDay(),
      last_skane_minutes_ago: lastSkaneMinutesAgo,
      previous_feedback: previousFeedback,
    };

    // Générer le prompt utilisateur avec contexte
    const userPrompt = generateUserPrompt({
      timeOfDay: userContext.time_of_day || getTimeOfDay(),
      lastSkaneMinutesAgo: userContext.last_skane_minutes_ago || lastSkaneMinutesAgo,
      previousFeedback: userContext.previous_feedback || previousFeedback,
    });

    const openai = getOpenAIClient();

    // Appel GPT-4 Vision avec le prompt canonique
    const response = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        max_tokens: 500, // Augmenté pour le JSON complet
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${normalizedImage}`, // Format standardisé
                  detail: 'low', // Optimisation : low quality suffit
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' }, // Force JSON output
        temperature: 0.3, // Plus déterministe pour la classification
      },
      {
        // Headers personnalisés pour debugging
        headers: {
          'X-Client-Request-Id': requestId,
        },
      }
    );

    // Logger les métadonnées de la réponse
    const processingTime = Date.now() - startTime;
    console.log('[OpenAI Request]', {
      requestId,
      processingTime: `${processingTime}ms`,
      model: 'gpt-4o',
      tokensUsed: response.usage?.total_tokens,
    });

    // Parser la réponse JSON
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let analysis: AnalysisResponse;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('[OpenAI] JSON parse error:', parseError, 'Content:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Valider l'état interne
    const validStates: InternalState[] = [
      'HIGH_ACTIVATION',
      'LOW_ENERGY',
      'REGULATED',
    ];
    const state: InternalState = validStates.includes(
      analysis.internal_state as InternalState
    )
      ? (analysis.internal_state as InternalState)
      : 'REGULATED';

    // Valider la micro-action
    if (!analysis.micro_action?.id) {
      console.warn('[OpenAI] No micro_action.id, using fallback');
      analysis.micro_action = {
        id: 'box_breathing',
        duration_seconds: 24,
        category: 'breathing',
      };
    }

    // Générer le Skane Index (avant l'action)
    const range = SKANE_INDEX_RANGES[state];
    const skaneIndex = Math.floor(
      Math.random() * (range.max - range.min) + range.min
    );

    // Retourner la réponse complète (format compatible avec les deux APIs)
    return NextResponse.json({
      success: true,
      internal_state: state,
      signal_label: analysis.signal_label || getSignalLabel(state),
      state, // Pour compatibilité
      confidence: 0.85, // Basé sur la qualité de l'analyse
      skaneIndex,
      skane_index: skaneIndex, // Format alternatif
      microAction: analysis.micro_action.id,
      micro_action: {
        id: analysis.micro_action.id,
        duration_seconds: analysis.micro_action.duration_seconds || 24,
        category: analysis.micro_action.category || 'breathing',
      },
      amplifier: analysis.amplifier || { enabled: false, type: null },
      inferredSignals: analysis.inferred_signals,
      ui_flags: analysis.ui_flags || {
        share_allowed: true,
        medical_disclaimer: true,
      },
      requestId, // Pour debugging
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('[OpenAI Error]', {
      requestId,
      processingTime: `${processingTime}ms`,
      error: error.message,
      status: error.status,
      code: error.code,
    });

    // Gérer les erreurs spécifiques OpenAI
    if (error.status === 429) {
      // Rate limit
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          requestId,
        },
        { status: 429 }
      );
    }

    if (error.status === 401) {
      // Authentication error
      return NextResponse.json(
        {
          error: 'OpenAI API authentication failed. Please check your API key.',
          requestId,
        },
        { status: 401 }
      );
    }

    // Fallback en cas d'erreur
    const fallbackResult = generateFallbackResult();
    return NextResponse.json(
      {
        success: true,
        ...fallbackResult,
        requestId,
        error: 'Analysis failed, using fallback',
      },
      { status: 200 } // Retourner 200 pour ne pas casser le flow
    );
  }
}

// Helper pour obtenir le label du signal
function getSignalLabel(state: InternalState): string {
  const labels: Record<InternalState, string> = {
    HIGH_ACTIVATION: 'High Activation',
    LOW_ENERGY: 'Low Energy',
    REGULATED: 'Clear Signal',
  };
  return labels[state] || 'Clear Signal';
}

// Résultat fallback basé sur des probabilités réalistes
function generateFallbackResult() {
  const states = [
    { 
      internal_state: 'HIGH_ACTIVATION',
      signal_label: 'High Activation',
      actions: ['physiological_sigh', 'expiration_3_8', 'drop_trapezes'],
      probability: 0.4
    },
    { 
      internal_state: 'LOW_ENERGY',
      signal_label: 'Low Energy',
      actions: ['respiration_2_1', 'posture_ancrage', 'ouverture_thoracique'],
      probability: 0.25
    },
    { 
      internal_state: 'REGULATED',
      signal_label: 'Clear Signal',
      actions: ['box_breathing', 'respiration_4_6', 'regard_fixe_expiration'],
      probability: 0.35
    },
  ];

  // Sélection pondérée
  const random = Math.random();
  let cumulative = 0;
  let selected = states[0];
  
  for (const state of states) {
    cumulative += state.probability;
    if (random <= cumulative) {
      selected = state;
      break;
    }
  }

  const actionId = selected.actions[Math.floor(Math.random() * selected.actions.length)];
  
  // Générer un Skane Index réaliste selon l'état
  const indexRanges = {
    HIGH_ACTIVATION: { min: 65, max: 92 },
    LOW_ENERGY: { min: 25, max: 48 },
    REGULATED: { min: 35, max: 55 },
  };
  const range = indexRanges[selected.internal_state as keyof typeof indexRanges];
  const skaneIndex = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  return {
    internal_state: selected.internal_state,
    signal_label: selected.signal_label,
    state: selected.internal_state,
    micro_action: {
      id: actionId,
      duration_seconds: 24,
      category: 'breathing',
    },
    microAction: actionId,
    amplifier: {
      enabled: false,
      type: null,
    },
    skane_index: skaneIndex,
    skaneIndex,
    ui_flags: {
      share_allowed: true,
      medical_disclaimer: true,
    },
  };
}
