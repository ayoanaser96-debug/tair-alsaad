import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type CreateFlowProgressProps = {
  step: number;
  total?: number;
};

export function CreateFlowProgress({ step, total = 4 }: CreateFlowProgressProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm }]}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={`create-step-${index}`}
          style={[
            styles.segment,
            {
              backgroundColor: index <= step ? theme.colors.primary : theme.colors.line,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
