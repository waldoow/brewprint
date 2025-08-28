import { BeanCardWithProgress } from "@/components/beans/BeanCardWithProgress";
import { type Bean } from "@/lib/services/beans";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Carousel, Text, View } from "react-native-ui-lib";

interface BeansSectionProps {
  beans: Bean[];
  theme: any;
}

export const BeansSection: React.FC<BeansSectionProps> = ({ beans, theme }) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text.primary,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });

  // Filter beans that have remaining grams > 0
  const activeBeans = beans.filter(
    (bean) => bean.remaining_grams && bean.remaining_grams > 0
  );

  if (activeBeans.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle]}>Active Beans</Text>
        </View>
        <Text
          style={{ color: theme.colors.text.secondary, paddingHorizontal: 16 }}
        >
          No active beans found
        </Text>
      </View>
    );
  }

  const handleBeanPress = (bean: Bean) => {
    router.push(`/bean-detail/${bean.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>Active Beans</Text>
        <TouchableOpacity
          onPress={() => router.push("/beans")}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      <Carousel
        pageControlPosition="under"
        horizontal
        containerPaddingVertical={0}
        itemSpacings={20}
      >
        {activeBeans.map((bean, index) => (
          <View key={bean.id} style={{ marginVertical: 8 }}>
            <BeanCardWithProgress bean={bean} onPress={handleBeanPress} />
          </View>
        ))}
      </Carousel>
    </View>
  );
};
