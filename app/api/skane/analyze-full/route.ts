/**
 * API ROUTE MAXIMISÉE - NOKTA ONE
 * 
 * Analyse complète du scan facial avec GPT-4 Vision
 * Enrichie par le contexte utilisateur et stockée dans Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, generateRequestId } from '@/lib/openai/client';
import { MAXIMIZED_SYSTEM_PROMPT, generateUserPrompt } from '@/lib/skane/openai-prompts';
import { getUserContext } from '@/lib/skane/context-enrichment';
import { selectMicroAction, getUserActionHistory } from '@/lib/skane/action-selector';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { FullAnalysis, SkaneResult } from '@/types/skane';
import { SKANE_INDEX_RANGES } from '@/lib/skane/constants';
import type { InternalState } from '@/lib/skane/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    const { imageBase64, userId, deviceInfo } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Normaliser le format de l'image
    let normalizedImage = imageBase64;
    if (imageBase64.startsWith('data:image')) {
      normalizedImage = imageBase64.split(',')[1] || imageBase64;
    }

    // 1. Enrichir le contexte
    const context = await getUserContext(userId || null);
    
    // 2. Appel GPT-4 Vision avec prompt maximisé
    const openai = getOpenAIClient();
    
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      temperature: 0.3, // Plus déterministe pour l'analyse
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: MAXIMIZED_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${normalizedImage}`,
                detail: 'high', // Utiliser high pour plus de détails
              },
            },
            {
              type: 'text',
              text: generateUserPrompt(context),
            },
          ],
        },
      ],
    });

    // 3. Parser la réponse
    const rawContent = visionResponse.choices[0]?.message?.content || '{}';
    let analysis: FullAnalysis;
    
    try {
      analysis = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[OpenAI] JSON parse error:', parseError, 'Content:', rawContent);
      analysis = getDefaultAnalysis();
    }

    // 4. Sélectionner la micro-action optimale
    const userHistory = await getUserActionHistory(userId || null);
    
    const actionSelection = selectMicroAction({
      state: (analysis.activation_state?.primary_state || 'REGULATED') as InternalState,
      physiologicalSignals: analysis.physiological_signals || {},
      activationLevel: analysis.activation_state?.activation_level,
      recommendations: analysis.recommendations || {},
      context: {
        timeOfDay: context.timeOfDay,
        hrv: context.hrv,
        sleepHours: context.sleepHours,
        preferredActions: context.preferredActions,
      },
      userHistory,
    });

    // 5. Calculer le Skane Index
    const skaneIndex = calculateSkaneIndex(analysis);

    // 6. Préparer la réponse enrichie
    const result: SkaneResult = {
      // État principal
      state: analysis.activation_state?.primary_state || 'REGULATED',
      confidence: analysis.activation_state?.confidence || 0.7,
      skaneIndex,
      
      // Détails de l'analyse (signaux physiologiques uniquement)
      analysis: {
        physiological: analysis.physiological_signals || {
          facial: {},
          postural: {},
          respiratory: {},
        },
        activation: analysis.activation_state || {
          primary_state: 'REGULATED',
          confidence: 0.7,
          activation_level: 50,
        },
      },
      
      // Action recommandée
      action: actionSelection,
      
      // Métadonnées
      meta: {
        analysisTime: Date.now() - startTime,
        modelUsed: 'gpt-4o',
        contextUsed: !!(context.hrv || context.sleepHours),
        imageQuality: analysis.visual_context?.image_clarity || 0.8,
      },
    };

    // 7. Sauvegarder dans Supabase (async, non-bloquant)
    // ⚠️ IMPORTANT : Ne JAMAIS stocker l'image (conformité OpenAI)
    saveAnalysisToSupabase(userId || null, result, analysis).catch(console.error);
    
    // Supprimer l'image de la mémoire immédiatement après l'analyse
    normalizedImage = null as any;

    // Logger les métadonnées
    const processingTime = Date.now() - startTime;
    console.log('[OpenAI Request]', {
      requestId,
      processingTime: `${processingTime}ms`,
      model: 'gpt-4o',
      tokensUsed: visionResponse.usage?.total_tokens,
      state: result.state,
      actionId: actionSelection.id,
    });

    return NextResponse.json({
      success: true,
      ...result,
      requestId,
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
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          requestId,
        },
        { status: 429 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        {
          error: 'OpenAI API authentication failed. Please check your API key.',
          requestId,
        },
        { status: 401 }
      );
    }

    // Fallback en cas d'erreur
    return NextResponse.json({
      success: true,
      state: 'REGULATED',
      confidence: 0.5,
      skaneIndex: 50,
      action: getDefaultAction(),
      error: 'Analysis failed, using defaults',
      requestId,
    });
  }
}

// Calcul du Skane Index basé sur l'analyse complète (signaux physiologiques uniquement)
function calculateSkaneIndex(analysis: FullAnalysis): number {
  const signals = analysis.physiological_signals || {};
  const activation = analysis.activation_state || {};
  
  // Pondération des facteurs physiologiques
  const tensionWeight = 0.3; // Tension musculaire
  const fatigueWeight = 0.2; // Fatigue oculaire
  const postureWeight = 0.2; // Posture
  const activationWeight = 0.3; // Niveau d'activation global
  
  const facial = signals.facial || {};
  const postural = signals.postural || {};
  
  // Tension musculaire (front, mâchoire, épaules)
  const tensionLevel = Math.max(
    facial.forehead_tension || 0,
    facial.jaw_tension || 0,
    postural.shoulder_tension || 0
  );
  
  // Fatigue oculaire
  const fatigueLevel = 1 - (facial.eye_openness || 0.5);
  
  // Posture (tête penchée, épaules)
  const postureLevel = Math.max(
    postural.head_forward || 0,
    postural.head_tilt || 0
  );
  
  const tensionContrib = tensionLevel * tensionWeight * 100;
  const fatigueContrib = fatigueLevel * fatigueWeight * 100;
  const postureContrib = postureLevel * postureWeight * 100;
  const activationContrib = (activation.activation_level || 50) * activationWeight;
  
  // Score inversé (haut = plus de régulation nécessaire)
  const rawScore = tensionContrib + fatigueContrib + postureContrib + activationContrib;
  
  // Normaliser entre 10 et 95
  return Math.max(10, Math.min(95, Math.round(rawScore)));
}

// Sauvegarde complète dans Supabase
// ⚠️ IMPORTANT : Ne JAMAIS stocker l'image (conformité OpenAI)
async function saveAnalysisToSupabase(
  userId: string | null,
  result: SkaneResult,
  fullAnalysis: FullAnalysis
) {
  try {
    const supabase = supabaseAdmin;
    
    const signals = fullAnalysis.physiological_signals || {};
    const activation = fullAnalysis.activation_state || {};
    
    const sessionData: any = {
      user_id: userId || null,
      
      // État détecté
      internal_state: result.state,
      confidence: result.confidence,
      skane_index_before: result.skaneIndex,
      
      // Signaux physiologiques (JSONB)
      facial_signals: signals.facial || {},
      postural_signals: signals.postural || {},
      respiratory_signals: signals.respiratory || {},
      
      // Niveau d'activation (pas d'émotions)
      activation_level: activation.activation_level || 50,
      
      // Scores physiologiques (basés sur les signaux, pas les émotions)
      tension_level: Math.round(
        Math.max(
          (signals.facial?.forehead_tension || 0) * 100,
          (signals.facial?.jaw_tension || 0) * 100,
          (signals.postural?.shoulder_tension || 0) * 100
        )
      ),
      fatigue_level: Math.round((1 - (signals.facial?.eye_openness || 0.5)) * 100),
      
      // Recommandations
      urgency: fullAnalysis.recommendations?.urgency,
      primary_need: fullAnalysis.recommendations?.primary_need,
      
      // Action sélectionnée
      selected_action_id: result.action?.id,
      
      // Contexte temporel
      time_of_day: getTimeOfDay(),
      day_of_week: new Date().getDay(),
      local_hour: new Date().getHours(),
      
      // Qualité de l'analyse
      image_quality: fullAnalysis.visual_context?.image_clarity,
      lighting_quality: fullAnalysis.visual_context?.lighting_quality,
      analysis_duration_ms: result.meta?.analysisTime,
      
      // Notes
      analysis_notes: fullAnalysis.analysis_notes,
      
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('skane_sessions')
      .insert(sessionData);

    if (error) {
      console.error('Supabase save error:', error);
    }
  } catch (error) {
    console.error('Error saving to Supabase:', error);
  }
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getDefaultAnalysis(): FullAnalysis {
  return {
    physiological_signals: {
      facial: {
        eye_openness: 0.7,
        blink_frequency: 0.5,
        eye_moisture: 0.5,
        forehead_tension: 0.5,
        brow_position: 0.5,
        jaw_tension: 0.5,
        lip_compression: 0.5,
        facial_symmetry: 0.8,
      },
      postural: {
        head_tilt: 0.3,
        head_forward: 0.3,
        shoulder_tension: 0.5,
        neck_tension: 0.5,
      },
      respiratory: {
        breathing_depth: 0.5,
        breathing_rate: 0.5,
        chest_movement: 0.5,
      },
    },
    activation_state: {
      primary_state: 'REGULATED',
      confidence: 0.5,
      activation_level: 50,
    },
    recommendations: {
      urgency: 'preventive',
      primary_need: 'maintain',
      body_area_priority: 'breathing',
    },
    visual_context: {
      lighting_quality: 0.7,
      image_clarity: 0.8,
      face_coverage: 0.8,
    },
    analysis_notes: 'Default analysis due to parsing error',
  };
}

function getDefaultAction() {
  return {
    id: 'box_breathing' as const,
    name: 'Box Breathing',
    name_fr: 'Respiration carrée',
    duration: 24,
    category: 'breathing',
    instructions: [
      { text: 'Inspire 4 secondes', duration: 4, type: 'inhale' },
      { text: 'Retiens 4 secondes', duration: 4, type: 'hold' },
      { text: 'Expire 4 secondes', duration: 4, type: 'exhale' },
      { text: 'Retiens 4 secondes', duration: 4, type: 'hold' },
    ],
    score: 50,
    reasoning: 'Default action',
  };
}
