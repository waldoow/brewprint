import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import { Header } from '@/components/ui/Header';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';

export function HeaderSpacingExample() {
  const [showSpacing, setShowSpacing] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Header Spacing Examples</ThemedText>
        
        <ThemedView style={styles.controls} noBackground>
          <ThemedButton
            title={`Toggle Spacing: ${showSpacing ? 'ON' : 'OFF'}`}
            onPress={() => setShowSpacing(!showSpacing)}
            variant="outline"
          />
        </ThemedView>

        {/* Default Header with Spacing */}
        <ThemedView style={styles.example}>
          <Header
            title="Default Header"
            subtitle="With top spacing (default behavior)"
            showBackButton={true}
            onBackPress={() => console.log('Back pressed')}
            showTopSpacing={true}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>This header has the default spacing above the title.</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Header without Top Spacing */}
        <ThemedView style={styles.example}>
          <Header
            title="Compact Header"
            subtitle="No extra space above title"
            showBackButton={true}
            onBackPress={() => console.log('Back pressed')}
            showTopSpacing={false}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>This header has minimal spacing, perfect for tight layouts.</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Dynamic Header */}
        <ThemedView style={styles.example}>
          <Header
            title="Dynamic Header"
            subtitle="Spacing controlled by toggle above"
            showBackButton={true}
            onBackPress={() => console.log('Back pressed')}
            showTopSpacing={showSpacing}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>
              This header&apos;s spacing changes based on the toggle button above. 
              Try toggling to see the difference!
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Header without Back Button and No Spacing */}
        <ThemedView style={styles.example}>
          <Header
            title="Clean Title Only"
            subtitle="Minimal header for content focus"
            showBackButton={false}
            showTopSpacing={false}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>Perfect for content-focused screens where space is important.</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 8,
  },
  example: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exampleContent: {
    padding: 20,
  },
});