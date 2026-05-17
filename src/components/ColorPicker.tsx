import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export function ColorPicker({
  label,
  selectedColor,
  onSelectColor,
}: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.swatches}>
        {BAG_COLORS.map((color) => (
          <Pressable
            accessibilityLabel={`${label} ${color} bag color`}
            accessibilityRole="button"
            key={color}
            onPress={() => onSelectColor(color)}
            style={[
              styles.swatch,
              { backgroundColor: color },
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
    height: 30,
    width: 30,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
