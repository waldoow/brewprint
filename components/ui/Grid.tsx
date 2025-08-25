import React from 'react';
import { View, ViewStyle } from 'react-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

interface GridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4;
  style?: ViewStyle;
}

export function Grid({
  children,
  columns = 2,
  gap = 'md',
  style,
}: GridProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const gapMap = {
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl,
  };

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gapMap[gap] / 2,
    marginVertical: -gapMap[gap] / 2,
  };

  return (
    <View style={[gridStyle, style]}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<GridItemProps>(child)) {
          const span = child.props.span || 1;
          const width = `${(span / columns) * 100}%`;
          
          return (
            <View
              style={[
                {
                  width,
                  paddingHorizontal: gapMap[gap] / 2,
                  paddingVertical: gapMap[gap] / 2,
                },
                child.props.style,
              ]}
            >
              {child}
            </View>
          );
        }
        return child;
      })}
    </View>
  );
}

export function GridItem({ children, span = 1, style }: GridItemProps) {
  return <>{children}</>;
}