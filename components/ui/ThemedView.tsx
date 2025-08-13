import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  noBackground?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, noBackground, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[noBackground ? {} : { backgroundColor }, style]} {...otherProps} />;
}
