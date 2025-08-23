import React from 'react';
import { router } from 'expo-router';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
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
    <ProfessionalContainer scrollable>
      <ProfessionalHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {settingsSections.map((section, sectionIndex) => (
        <ProfessionalCard key={sectionIndex} variant="default">
          <ProfessionalText 
            variant="h4" 
            weight="semibold" 
            style={{ marginBottom: 16 }}
          >
            {section.title}
          </ProfessionalText>

          {section.items.map((item, itemIndex) => (
            <ProfessionalCard
              key={itemIndex}
              variant="outlined"
              padding="sm"
              onPress={item.onPress}
              style={{ 
                marginBottom: itemIndex < section.items.length - 1 ? 8 : 0,
                backgroundColor: 'transparent',
              }}
            >
              <ProfessionalText variant="body" weight="medium">
                {item.label}
              </ProfessionalText>
              <ProfessionalText 
                variant="caption" 
                color="secondary"
                style={{ marginTop: 2 }}
              >
                {item.value}
              </ProfessionalText>
            </ProfessionalCard>
          ))}
        </ProfessionalCard>
      ))}

      {/* Sign Out */}
      <ProfessionalCard variant="outlined">
        <ProfessionalText 
          variant="h4" 
          weight="semibold" 
          style={{ marginBottom: 12 }}
        >
          Account Actions
        </ProfessionalText>
        <ProfessionalText 
          variant="body" 
          color="secondary" 
          style={{ marginBottom: 20 }}
        >
          Manage your account session
        </ProfessionalText>
        
        <ProfessionalButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="destructive"
          fullWidth
        />
      </ProfessionalCard>
    </ProfessionalContainer>
  );
}