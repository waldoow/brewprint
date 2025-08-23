import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ProfessionalText } from './Text';
import { ProfessionalButton } from './Button';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function ProfessionalHeader({
  title,
  subtitle,
  action,
  style,
}: ProfessionalHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  return (
    <View style={[{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing['2xl'],
    }, style]}>
      <View style={{
        flex: 1,
        marginRight: action ? theme.spacing.lg : 0,
      }}>
        <ProfessionalText variant="h2" weight="bold">
          {title}
        </ProfessionalText>
        {subtitle && (
          <ProfessionalText 
            variant="body" 
            color="secondary" 
            style={{ marginTop: theme.spacing.xs }}
          >
            {subtitle}
          </ProfessionalText>
        )}
      </View>
      
      {action && (
        <ProfessionalButton
          title={action.title}
          onPress={action.onPress}
          variant="primary"
          size="sm"
        />
      )}
    </View>
  );
}

