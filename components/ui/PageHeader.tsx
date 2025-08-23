import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function PageHeader({
  title,
  subtitle,
  action,
  style,
}: PageHeaderProps) {
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
        <Text variant="h2" weight="bold">
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant="body" 
            color="secondary" 
            style={{ marginTop: theme.spacing.xs }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          variant="primary"
          size="sm"
        />
      )}
    </View>
  );
}