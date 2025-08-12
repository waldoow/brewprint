import React from 'react';
import { View, Alert } from 'react-native';
import { BrewHeader } from '../coffee/BrewHeader';

export function BrewHeaderExample() {
  const handleBackPress = () => {
    Alert.alert('Back pressed');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Planning/Scheduling Header Example */}
      <BrewHeader
        title="Planning"
        subtitle="Dell Inspiron 19"
        onBackPress={handleBackPress}
        progress={0.6}
        stats={[
          { label: 'Items in stock', value: '- 392' },
          { label: 'Awaiting stock', value: '... 100' },
          { label: 'Demand', value: '- 2' },
        ]}
      />
      
      {/* Coffee Recipe Header Example */}
      <BrewHeader
        title="V60 Pour Over"
        subtitle="Ethiopian Yirgacheffe"
        onBackPress={handleBackPress}
        progress={0.8}
        stats={[
          { label: 'Coffee', value: '25g' },
          { label: 'Water', value: '400ml' },
          { label: 'Time', value: '3:30' },
        ]}
      />
      
      {/* Simple Header without Stats */}
      <BrewHeader
        title="Recipe Collection"
        subtitle="12 saved recipes"
        onBackPress={handleBackPress}
      />
    </View>
  );
}