import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import { ThemedCollapsible } from '@/components/ui/ThemedCollapsible';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedButton } from '@/components/ui/ThemedButton';

export function ThemedCollapsibleExample() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>ThemedCollapsible Examples</ThemedText>
        
        {/* Basic Example - New Default (No Border, No Padding, No Background) */}
        <ThemedCollapsible
          title="Default: Clean & Minimal"
          subtitle="No border, no padding, no background"
        >
          <ThemedView style={styles.section} noBackground>
            <ThemedInput
              label="Name"
              placeholder="Enter name..."
            />
            <ThemedInput
              label="Email"
              placeholder="Enter email..."
              type="email"
            />
          </ThemedView>
        </ThemedCollapsible>

        {/* Traditional Style */}
        <ThemedCollapsible
          title="Traditional Style"
          subtitle="With border, padding, and background"
          variant="outline"
          showBorder={true}
          noPadding={false}
          noBackground={false}
          defaultOpen={false}
          onToggle={(isOpen) => console.log('Advanced settings:', isOpen)}
        >
          <ThemedView style={styles.section} noBackground>
            <ThemedText>
              These are advanced settings that most users don&apos;t need to configure.
            </ThemedText>
            <ThemedInput
              label="API Key"
              placeholder="Enter API key..."
            />
            <ThemedInput
              label="Custom Domain"
              placeholder="example.com"
            />
          </ThemedView>
        </ThemedCollapsible>

        {/* Ghost Variant */}
        <ThemedCollapsible
          title="Help & Documentation"
          variant="ghost"
          size="sm"
        >
          <ThemedView style={styles.section} noBackground>
            <ThemedText style={styles.helpText}>
              • Check our FAQ section for common questions{'\n'}
              • Contact support at help@example.com{'\n'}
              • Visit our documentation portal{'\n'}
              • Join our community forum
            </ThemedText>
          </ThemedView>
        </ThemedCollapsible>

        {/* Large Size Example */}
        <ThemedCollapsible
          title="Brewing Parameters"
          subtitle="Configure your coffee brewing settings"
          size="lg"
          defaultOpen={true}
        >
          <ThemedView style={styles.section} noBackground>
            <ThemedInput
              label="Grind Size"
              placeholder="Medium-fine"
            />
            <ThemedInput
              label="Water Temperature"
              placeholder="200°F"
              type="number"
            />
            <ThemedInput
              label="Brew Time"
              placeholder="4:00"
            />
            <ThemedButton>
              Save Settings
            </ThemedButton>
          </ThemedView>
        </ThemedCollapsible>

        {/* Disabled Example */}
        <ThemedCollapsible
          title="Premium Features"
          subtitle="Upgrade to access these features"
          disabled={true}
        >
          <ThemedView style={styles.section} noBackground>
            <ThemedText>Premium content goes here...</ThemedText>
          </ThemedView>
        </ThemedCollapsible>
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});