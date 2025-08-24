import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBrewprint } from '@/hooks/useBrewprint';
import { useTimer } from '@/hooks/useTimer';
import type { BrewStep } from '@/lib/services/brewprints';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

export default function BrewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const { brewprint, loading, error } = useBrewprint(id);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isBrewingStarted, setIsBrewingStarted] = useState(false);
  const [isBrewingComplete, setIsBrewingComplete] = useState(false);
  const [brewingPhase, setBrewingPhase] = useState<'preparation' | 'brewing' | 'complete'>('preparation');

  const {
    time,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimer();

  const handleStartBrewing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBrewingStarted(true);
    setCurrentStepIndex(0);
    setBrewingPhase('brewing');
    startTimer();
    
    if (brewprint?.steps && brewprint.steps.length > 0) {
      const firstStep = brewprint.steps[0];
      toast.success(`Started: ${firstStep.title}`, { duration: 2000 });
    } else {
      toast.success('Brewing started', { duration: 2000 });
    }
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!brewprint?.steps) return;
    
    if (currentStepIndex < brewprint.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = brewprint.steps[nextIndex];
      toast.info(`Step ${nextIndex + 1}: ${nextStep.title}`, { duration: 1500 });
    } else {
      setIsBrewingComplete(true);
      setBrewingPhase('complete');
      pauseTimer();
      toast.success('Brewing complete! Time to taste.', { duration: 3000 });
    }
  };

  const getCurrentStep = (): BrewStep | null => {
    if (!brewprint?.steps || currentStepIndex < 0) return null;
    return brewprint.steps[currentStepIndex] || null;
  };

  const resetBrewing = () => {
    setIsBrewingStarted(false);
    setIsBrewingComplete(false);
    setCurrentStepIndex(-1);
    setBrewingPhase('preparation');
    resetTimer();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!brewprint?.parameters?.total_time) return 0;
    return Math.min((time / brewprint.parameters.total_time) * 100, 100);
  };

  const getStepProgress = () => {
    if (!brewprint?.steps || currentStepIndex < 0) return 0;
    return ((currentStepIndex + 1) / brewprint.steps.length) * 100;
  };

  const getPhaseColor = () => {
    switch (brewingPhase) {
      case 'brewing': return theme.colors.warning;
      case 'complete': return theme.colors.success;
      default: return theme.colors.gray[400];
    }
  };

  const getStatusText = () => {
    switch (brewingPhase) {
      case 'preparation': return 'Ready to brew';
      case 'brewing': return isRunning ? 'Brewing in progress' : 'Brewing paused';
      case 'complete': return 'Brewing complete';
    }
  };

  if (loading) {
    return (
      <Container>
        <Section title="Loading Brewing Session" subtitle="Preparing your recipe">
          <DataCard
            title="Loading Status"
            data={[
              { label: 'Status', value: 'Fetching recipe details...' },
            ]}
            variant="outlined"
          />
        </Section>
      </Container>
    );
  }

  if (error || !brewprint) {
    return (
      <Container>
        <Section title="Brewing Session Error" subtitle="Unable to load this recipe">
          <Card variant="outlined" style={styles.errorCard}>
            <Text variant="h4" weight="semibold" style={styles.errorTitle}>
              Recipe Not Available
            </Text>
            <Text variant="body" color="secondary" style={styles.errorMessage}>
              {error || 'This brewing recipe could not be loaded. Please check your connection and try again.'}
            </Text>
            <Button
              title="Back to Recipes"
              onPress={() => router.back()}
              variant="primary"
              fullWidth
            />
          </Card>
        </Section>
      </Container>
    );
  }

  const ratio = Math.round((brewprint.parameters.water_grams / brewprint.parameters.coffee_grams) * 10) / 10;
  const currentStep = getCurrentStep();

  return (
    <Container scrollable>
      {/* Header with Status */}
      <Section
        title={brewprint.name}
        subtitle={`${brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')} • ${getStatusText()}`}
        spacing="xl"
      >
        <View style={styles.headerActions}>
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
            style={{ flex: 1, marginRight: 8 }}
          />
          <View style={[styles.statusIndicator, { backgroundColor: getPhaseColor() }]}>
            <Text variant="caption" weight="semibold" color="inverse">
              {brewingPhase.toUpperCase()}
            </Text>
          </View>
        </View>
      </Section>

      {/* Recipe Parameters - Enhanced */}
      <Section
        title="Recipe Specifications"
        subtitle="Brewing parameters for this recipe"
        spacing="lg"
      >
        <DataCard
          title="Brewing Parameters"
          data={[
            { label: 'Coffee Dose', value: brewprint.parameters.coffee_grams, unit: 'g' },
            { label: 'Water Volume', value: brewprint.parameters.water_grams, unit: 'ml' },
            { label: 'Water Temperature', value: brewprint.parameters.water_temp, unit: '°C' },
            { label: 'Coffee Ratio', value: `1:${ratio}` },
          ]}
          layout="horizontal"
          variant="elevated"
        />
      </Section>

      {/* Timer Section - Professional */}
      <Section
        title="Extraction Timer"
        subtitle={isRunning ? `Timer active - ${Math.round(getProgress())}% complete` : 'Timer ready'}
        spacing="lg"
      >
        <View style={styles.timerContainer}>
          <View style={styles.timerMain}>
            <Text variant="h1" weight="bold" style={styles.timerDisplay}>
              {formatTime(time)}
            </Text>
            <View style={styles.timerMeta}>
              {brewprint.parameters.total_time && (
                <>
                  <Text variant="body" color="secondary">
                    Target: {formatTime(brewprint.parameters.total_time)}
                  </Text>
                  <Text variant="body" color="secondary">
                    Remaining: {formatTime(Math.max(0, brewprint.parameters.total_time - time))}
                  </Text>
                </>
              )}
            </View>
          </View>

          {brewprint.parameters.total_time && (
            <View style={styles.progressSection}>
              <View style={[styles.progressTrack, { backgroundColor: theme.colors.gray[200] }]}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      backgroundColor: isRunning ? theme.colors.warning : theme.colors.text.primary,
                      width: `${getProgress()}%`
                    }
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text variant="caption" color="tertiary">
                  Progress: {Math.round(getProgress())}%
                </Text>
                <Text variant="caption" color="tertiary">
                  Rate: {isRunning ? '1.0x' : '0.0x'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Section>

      {/* Current Step - Active Phase */}
      {isBrewingStarted && !isBrewingComplete && currentStep && (
        <Section
          title={`Step ${currentStepIndex + 1} of ${brewprint.steps.length}`}
          subtitle="Active brewing instruction"
          spacing="lg"
        >
          <Card variant="elevated" style={[styles.activeStepCard, { borderLeftColor: theme.colors.warning }]}>
            <View style={styles.stepHeader}>
              <View style={styles.stepProgress}>
                <View style={[styles.stepProgressTrack, { backgroundColor: theme.colors.gray[200] }]}>
                  <View 
                    style={[
                      styles.stepProgressBar,
                      { 
                        backgroundColor: theme.colors.warning,
                        width: `${getStepProgress()}%`
                      }
                    ]}
                  />
                </View>
                <Text variant="caption" color="secondary">
                  {Math.round(getStepProgress())}% through brewing steps
                </Text>
              </View>
            </View>

            <Text variant="h3" weight="semibold" style={styles.stepTitle}>
              {currentStep.title}
            </Text>
            
            <Text variant="body" color="secondary" style={styles.stepDescription}>
              {currentStep.description}
            </Text>

            <DataCard
              title="Step Parameters"
              data={[
                { label: 'Duration', value: currentStep.duration, unit: 's' },
                { label: 'Water Amount', value: currentStep.water_amount, unit: 'g' },
                { label: 'Technique', value: currentStep.technique.replace('-', ' ') },
              ]}
              layout="horizontal"
              variant="default"
            />
          </Card>
        </Section>
      )}

      {/* Steps Overview - Pre-brewing */}
      {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
        <Section
          title="Brewing Process Overview"
          subtitle={`${brewprint.steps.length} precise steps to perfect extraction`}
          spacing="lg"
        >
          <Card variant="elevated">
            <View style={styles.stepsHeader}>
              <Text variant="h4" weight="semibold">
                Brewing Sequence
              </Text>
              <View style={[styles.stepsBadge, { backgroundColor: theme.colors.gray[100] }]}>
                <Text variant="caption" weight="medium" color="secondary">
                  {brewprint.steps.length} steps
                </Text>
              </View>
            </View>

            {brewprint.steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepRow, index === brewprint.steps.length - 1 && styles.lastStep]}
                activeOpacity={0.7}
              >
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.gray[100] }]}>
                  <Text variant="caption" weight="bold" color="secondary">
                    {index + 1}
                  </Text>
                </View>
                
                <View style={styles.stepContent}>
                  <Text variant="body" weight="semibold">
                    {step.title}
                  </Text>
                  <Text variant="caption" color="secondary" style={styles.stepMeta}>
                    {step.duration}s • {step.water_amount}g • {step.technique.replace('-', ' ')}
                  </Text>
                  {step.description && (
                    <Text variant="caption" color="tertiary" style={styles.stepNote} numberOfLines={1}>
                      {step.description}
                    </Text>
                  )}
                </View>

                <View style={styles.stepIndicator}>
                  <Text variant="caption" color="tertiary">
                    {step.duration}s
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </Section>
      )}

      {/* Brewing Analytics - Post completion */}
      {isBrewingComplete && (
        <Section
          title="Brewing Analytics"
          subtitle="Your extraction performance metrics"
          spacing="lg"
        >
          <DataCard
            title="Session Results"
            data={[
              { 
                label: 'Total Time', 
                value: formatTime(time),
                change: brewprint.parameters.total_time ? {
                  value: Math.abs(time - brewprint.parameters.total_time),
                  direction: time > brewprint.parameters.total_time ? 'up' : time < brewprint.parameters.total_time ? 'down' : 'neutral'
                } : undefined
              },
              { label: 'Steps Completed', value: brewprint.steps.length },
              { label: 'Extraction Rate', value: Math.round((time / (brewprint.parameters.total_time || time)) * 100), unit: '%' },
              { label: 'Precision Score', value: time === brewprint.parameters.total_time ? 100 : Math.max(0, 100 - Math.abs(time - (brewprint.parameters.total_time || time))), unit: '%' },
            ]}
            layout="grid"
            variant="elevated"
          />
        </Section>
      )}

      {/* Action Controls */}
      <Section
        title="Brewing Controls"
        subtitle={brewingPhase === 'preparation' 
          ? "Ready to begin your brewing session" 
          : brewingPhase === 'brewing' 
          ? "Control your active brewing session"
          : "Session complete - review or brew again"
        }
        spacing="xl"
      >
        {!isBrewingStarted ? (
          <Button
            title={`Start Brewing ${brewprint.name}`}
            onPress={handleStartBrewing}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : isBrewingComplete ? (
          <View style={styles.actionGroup}>
            <Button
              title="View Full Results"
              onPress={() => router.push(`/brewing/${id}/results`)}
              variant="primary"
              size="lg"
              fullWidth
            />
            <Button
              title="Brew This Recipe Again"
              onPress={resetBrewing}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </View>
        ) : (
          <View style={styles.actionGroup}>
            <Button
              title={currentStepIndex < (brewprint.steps?.length || 0) - 1 ? "Continue to Next Step" : "Complete Brewing Session"}
              onPress={handleNextStep}
              variant="primary"
              size="lg"
              fullWidth
            />
            <View style={styles.timerControls}>
              <Button
                title={isRunning ? "Pause Timer" : "Resume Timer"}
                onPress={isRunning ? pauseTimer : startTimer}
                variant="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Reset Session"
                onPress={resetBrewing}
                variant="outline"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        )}
      </Section>
    </Container>
  );
}

const styles = {
  errorCard: {
    alignItems: 'center' as const,
    padding: 32,
  },

  errorTitle: {
    textAlign: 'center' as const,
    marginBottom: 8,
  },

  errorMessage: {
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
  },

  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },

  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center' as const,
  },

  timerContainer: {
    alignItems: 'center' as const,
    paddingVertical: 16,
  },

  timerMain: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },

  timerDisplay: {
    fontSize: 96,
    lineHeight: 96,
    marginBottom: 12,
    fontVariant: ['tabular-nums'] as any,
  },

  timerMeta: {
    flexDirection: 'row' as const,
    gap: 24,
  },

  progressSection: {
    width: '100%' as const,
    gap: 12,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },

  progressBar: {
    height: '100%' as const,
    borderRadius: 4,
    minWidth: 4,
  },

  progressLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },

  activeStepCard: {
    borderLeftWidth: 6,
    padding: 24,
  },

  stepHeader: {
    marginBottom: 20,
  },

  stepProgress: {
    gap: 8,
  },

  stepProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },

  stepProgressBar: {
    height: '100%' as const,
    borderRadius: 2,
    minWidth: 2,
  },

  stepTitle: {
    marginBottom: 12,
  },

  stepDescription: {
    marginBottom: 20,
    lineHeight: 24,
  },

  stepsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },

  stepsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },

  lastStep: {
    borderBottomWidth: 0,
  },

  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },

  stepContent: {
    flex: 1,
    gap: 4,
  },

  stepMeta: {
    fontSize: 11,
  },

  stepNote: {
    fontSize: 10,
    marginTop: 2,
  },

  stepIndicator: {
    alignItems: 'center' as const,
    minWidth: 40,
  },

  actionGroup: {
    gap: 16,
  },

  timerControls: {
    flexDirection: 'row' as const,
    gap: 0,
  },
};