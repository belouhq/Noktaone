import { supabase } from '@/lib/supabase/client';
import { Skane, RecentSkane } from './types';

// Récupérer les skanes récents d'un utilisateur
export async function getRecentSkanes(userId: string, limit = 5): Promise<RecentSkane[]> {
  // Use the exported supabase client
  
  const { data, error } = await supabase
    .from('skanes')
    .select('id, internal_state, signal_label, skane_index, created_at, feedback')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching skanes:', error);
    return [];
  }

  return (data || []).map(skane => ({
    ...skane,
    timeLabel: formatTimeLabel(new Date(skane.created_at)),
  }));
}

// Récupérer les skanes d'aujourd'hui
export async function getTodaySkanes(userId: string): Promise<Skane[]> {
  // Use the exported supabase client
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('skanes')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching today skanes:', error);
    return [];
  }

  return data || [];
}

// Créer un nouveau skane
export async function createSkane(skaneData: Omit<Skane, 'id' | 'created_at'>): Promise<Skane | null> {
  // Use the exported supabase client
  
  const { data, error } = await supabase
    .from('skanes')
    .insert(skaneData)
    .select()
    .single();

  if (error) {
    console.error('Error creating skane:', error);
    return null;
  }

  return data;
}

// Mettre à jour le feedback d'un skane
export async function updateSkaneFeedback(
  skaneId: string, 
  feedback: 'better' | 'same' | 'worse',
  actionCompleted: boolean = true
): Promise<boolean> {
  // Use the exported supabase client
  
  const { error } = await supabase
    .from('skanes')
    .update({ 
      feedback, 
      micro_action_completed: actionCompleted 
    })
    .eq('id', skaneId);

  if (error) {
    console.error('Error updating skane feedback:', error);
    return false;
  }

  return true;
}

// Calculer le temps jusqu'au prochain reset disponible
export function getNextResetTime(lastSkaneTime: Date | null): { available: boolean; hoursRemaining: number } {
  if (!lastSkaneTime) {
    return { available: true, hoursRemaining: 0 };
  }

  const now = new Date();
  const hoursSinceLastSkane = (now.getTime() - lastSkaneTime.getTime()) / (1000 * 60 * 60);
  const cooldownHours = 2; // 2 heures entre chaque skane
  
  if (hoursSinceLastSkane >= cooldownHours) {
    return { available: true, hoursRemaining: 0 };
  }

  return { 
    available: false, 
    hoursRemaining: Math.ceil(cooldownHours - hoursSinceLastSkane) 
  };
}

// Formater le label de temps
function formatTimeLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const skaneDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Détecter la langue depuis localStorage ou navigator
  const lang = typeof window !== 'undefined' 
    ? (localStorage.getItem('language') || navigator.language || 'fr').split('-')[0]
    : 'fr';
  
  if (skaneDate.getTime() === today.getTime()) {
    const timeStr = date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return lang === 'fr' ? `Aujourd'hui - ${timeStr}` : `Today - ${timeStr}`;
  }
  
  if (skaneDate.getTime() === yesterday.getTime()) {
    return lang === 'fr' ? 'Hier' : 'Yesterday';
  }
  
  const daysAgo = Math.floor((today.getTime() - skaneDate.getTime()) / (1000 * 60 * 60 * 24));
  return lang === 'fr' 
    ? `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`
    : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
}
