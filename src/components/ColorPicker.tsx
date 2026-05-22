import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const BAG_COLORS = [
  '#F97316',
  '#E11D48',
  '#2563EB',
  '#16A34A',
  '#FACC15',
  '#7C3AED',
  '#111827',
  '#F8FAFC',
] as const;

type ColorPickerProps = {
  label: string;
  selectedColor: string;
  onSelectColor: (color: string) => void;
};

const CONTROLS_HORIZONTAL_PADDING = 36;

function getSwatchLayout(screenWidth: number) {
  const gap = screenWidth < 390 ? 7 : 10;
  const availableWidth = screenWidth - CONTROLS_HORIZONTAL_PADDING;
  const swatchSize = Math.min(
    30,
    Math.floor((availableWidth - (BAG_COLORS.length - 1) * gap) / BAG_COLORS.length),
  );

  return { gap, swatchSize: Math.max(24, swatchSize) };
}

export function ColorPicker({
  label,
  selectedColor,
  onSelectColor,
}: ColorPickerProps) {
  const { width } = useWindowDimensions();
  const { gap, swatchSize } = getSwatchLayout(width);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.swatches, { gap }]}>
        {BAG_COLORS.map((color) => (
          <Pressable
            accessibilityLabel={`${label} ${color} bag color`}
            accessibilityRole="button"
            key={color}
            onPress={() => onSelectColor(color)}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                height: swatchSize,
                width: swatchSize,
              },
              selectedColor === color && styles.selectedSwatch,
              color === '#F8FAFC' && styles.lightSwatch,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: '#F6C453',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lightSwatch: {
    borderColor: '#CBD5E1',
  },
  selectedSwatch: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  swatch: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});
