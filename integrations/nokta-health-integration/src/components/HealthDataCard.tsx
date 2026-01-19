// src/components/HealthDataCard.tsx
// Composant React Native pour afficher les données de santé Nokta

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useHealthData, useNervousSystemScore } from '../hooks/useHealthData';
import { 
  getStateEmoji, 
  getStateColor, 
  interpretScore 
} from '../utils/nervousSystemScore';

interface HealthDataCardProps {
  onScoreCalculated?: (score: number) => void;
  onRecommendationPress?: (recommendation: any) => void;
}

/**
 * Carte principale affichant le score du système nerveux
 */
export function NervousSystemCard({ 
  onScoreCalculated, 
  onRecommendationPress 
}: HealthDataCardProps) {
  const {
    nervousSystemScore,
    isLoading,
    isInitialized,
    error,
    initialize,
    refresh,
  } = useNervousSystemScore();

  // Initialiser au montage
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, []);

  // Callback quand le score change
  useEffect(() => {
    if (nervousSystemScore && onScoreCalculated) {
      onScoreCalculated(nervousSystemScore.score);
    }
  }, [nervousSystemScore?.score]);

  if (!isInitialized && !isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Système Nerveux</Text>
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={initialize}
        >
          <Text style={styles.connectButtonText}>
            Connecter {Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Accédez à vos données de santé pour une analyse personnalisée
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Analyse en cours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!nervousSystemScore) {
    return (
      <View style={styles.card}>
        <Text style={styles.noDataText}>
          Pas de données disponibles. Portez votre montre connectée pour commencer.
        </Text>
      </View>
    );
  }

  const { score, state, recommendation, confidence } = nervousSystemScore;
  const stateColor = getStateColor(state);
  const emoji = getStateEmoji(state);

  return (
    <View style={[styles.card, { borderLeftColor: stateColor }]}>
      {/* Header avec score */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.score, { color: stateColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* État */}
      <Text style={styles.stateLabel}>
        {state === 'stressed' && 'Système Sympathique Actif'}
        {state === 'balanced' && 'Équilibre Autonome'}
        {state === 'relaxed' && 'Système Parasympathique Actif'}
        {state === 'unknown' && 'État Inconnu'}
      </Text>

      {/* Interprétation */}
      <Text style={styles.interpretation}>
        {interpretScore(nervousSystemScore)}
      </Text>

      {/* Indicateur de confiance */}
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceDots}>
          <View style={[styles.dot, confidence !== 'low' && styles.dotActive]} />
          <View style={[styles.dot, confidence === 'high' && styles.dotActive]} />
          <View style={[styles.dot, confidence === 'high' && styles.dotActive]} />
        </View>
        <Text style={styles.confidenceText}>
          Confiance: {confidence === 'high' ? 'Élevée' : confidence === 'medium' ? 'Moyenne' : 'Faible'}
        </Text>
      </View>

      {/* Recommandation */}
      <TouchableOpacity
        style={[styles.recommendationCard, { backgroundColor: stateColor + '20' }]}
        onPress={() => onRecommendationPress?.(recommendation)}
      >
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationIcon}>
            {recommendation.type === 'breathing' && '🌬️'}
            {recommendation.type === 'tea' && '🍵'}
            {recommendation.type === 'movement' && '🏃'}
            {recommendation.type === 'posture' && '🧍'}
            {recommendation.type === 'grounding' && '🌿'}
          </Text>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationName}>{recommendation.name}</Text>
            <Text style={styles.recommendationDuration}>
              {Math.round(recommendation.duration / 60)} min
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>
        <Text style={styles.recommendationDescription}>
          {recommendation.description}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Carte détaillée avec toutes les métriques
 */
export function DetailedHealthCard() {
  const { healthData, isLoading, isInitialized, initialize } = useHealthData();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, []);

  if (!isInitialized || isLoading || !healthData) {
    return null;
  }

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailTitle}>Métriques Détaillées</Text>
      
      <View style={styles.metricsGrid}>
        {/* HRV */}
        {healthData.hrv && (
          <MetricItem
            icon="💓"
            label="HRV (SDNN)"
            value={`${Math.round(healthData.hrv.sdnn)} ms`}
            color="#FF6B6B"
          />
        )}

        {/* FC au repos */}
        {healthData.restingHeartRate && (
          <MetricItem
            icon="❤️"
            label="FC Repos"
            value={`${healthData.restingHeartRate} bpm`}
            color="#FF8E8E"
          />
        )}

        {/* Sommeil */}
        {healthData.sleep && (
          <MetricItem
            icon="😴"
            label="Sommeil"
            value={formatDuration(healthData.sleep.totalDuration)}
            color="#9B59B6"
          />
        )}

        {/* Pas */}
        {healthData.steps && (
          <MetricItem
            icon="👟"
            label="Pas"
            value={healthData.steps.toLocaleString()}
            color="#2ECC71"
          />
        )}

        {/* Calories */}
        {healthData.caloriesBurned && (
          <MetricItem
            icon="🔥"
            label="Calories"
            value={`${healthData.caloriesBurned} kcal`}
            color="#E74C3C"
          />
        )}

        {/* SpO2 */}
        {healthData.oxygenSaturation && (
          <MetricItem
            icon="💨"
            label="SpO2"
            value={`${healthData.oxygenSaturation}%`}
            color="#3498DB"
          />
        )}
      </View>

      {/* Dernière mise à jour */}
      <Text style={styles.lastUpdate}>
        Dernière sync: {formatTime(healthData.lastSyncDate)}
      </Text>
    </View>
  );
}

/**
 * Composant pour afficher une métrique individuelle
 */
function MetricItem({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

/**
 * Formate une durée en minutes vers "Xh Xmin"
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Formate une date pour l'affichage
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  emoji: {
    fontSize: 32,
    marginRight: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 18,
    color: '#BDC3C7',
    marginLeft: 2,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 24,
  },
  stateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  interpretation: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 4,
  },
  dotActive: {
    backgroundColor: '#4ECDC4',
  },
  confidenceText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  recommendationDuration: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  arrow: {
    fontSize: 20,
    color: '#BDC3C7',
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  connectButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    padding: 10,
  },
  retryButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NervousSystemCard;
