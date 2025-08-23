import React from 'react';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          label: 'Profile',
          value: user?.user_metadata?.username || 'Not set',
          onPress: () => router.push('/settings/profile'),
        },
        {
          label: 'Email',
          value: user?.email || 'Not set',
          onPress: () => router.push('/settings/profile'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Notifications',
          value: 'Enabled',
          onPress: () => router.push('/settings/notifications'),
        },
        {
          label: 'Default Units',
          value: 'Metric',
          onPress: () => router.push('/settings/preferences'),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          label: 'Export Data',
          value: 'Download your brewing data',
          onPress: () => router.push('/settings/data'),
        },
        {
          label: 'Analytics',
          value: 'View brewing statistics',
          onPress: () => router.push('/settings/data'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'About',
          value: 'Version 1.0.0',
          onPress: () => router.push('/settings/about'),
        },
      ],
    },
  ];

  return (
    <Container scrollable>
      <Section 
        title="Account Settings"
        subtitle={`Manage your preferences, ${user?.user_metadata?.username || 'Coffee Enthusiast'}`}
        spacing="xl"
      />

      {settingsSections.map((section, sectionIndex) => (
        <Section
          key={sectionIndex}
          title={section.title}
          variant="default"
          spacing="lg"
        >
          {section.items.map((item, itemIndex) => (
            <Card
              key={itemIndex}
              variant="default"
              onPress={item.onPress}
              style={{ 
                marginBottom: itemIndex < section.items.length - 1 ? 12 : 0,
              }}
            >
              <Text variant="body" weight="medium">
                {item.label}
              </Text>
              <Text 
                variant="caption" 
                color="secondary"
                style={{ marginTop: 4 }}
              >
                {item.value}
              </Text>
            </Card>
          ))}
        </Section>
      ))}

      <Section 
        title="Account Actions"
        subtitle="Manage your account session and data"
        spacing="xl"
      >
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          size="lg"
          fullWidth
        />
      </Section>
    </Container>
  );
}