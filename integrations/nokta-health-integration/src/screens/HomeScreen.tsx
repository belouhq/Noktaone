// src/screens/HomeScreen.tsx
// Exemple d'écran principal utilisant les données de santé

import React, { useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  SafeAreaView,
  Text,
} from 'react-native';
import { NervousSystemCard, DetailedHealthCard } from '../components/HealthDataCard';
import { useHealthData } from '../hooks/useHealthData';

export default function HomeScreen() {
  const { refresh, isLoading } = useHealthData({ 
    refreshOnForeground: true,
    autoRefreshInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });

  const handleScoreCalculated = useCallback((score: number) => {
    console.log('Score calculé:', score);
    // Tu peux envoyer le score à ton backend ici
    // await api.trackScore(score);
  }, []);

  const handleRecommendationPress = useCallback((recommendation: any) => {
    console.log('Recommandation sélectionnée:', recommendation);
    // Navigation vers l'écran de micro-action
    // navigation.navigate('MicroAction', { recommendation });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.headerTitle}>Comment va ton corps ?</Text>
        </View>

        {/* Carte principale du score */}
        <NervousSystemCard
          onScoreCalculated={handleScoreCalculated}
          onRecommendationPress={handleRecommendationPress}
        />

        {/* Métriques détaillées */}
        <DetailedHealthCard />

        {/* Espace en bas */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
  },
  bottomSpace: {
    height: 100,
  },
});
