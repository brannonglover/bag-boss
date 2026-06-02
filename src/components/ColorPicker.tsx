import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

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

const DIVIDER_WIDTH = 2;
const CENTER_GUTTER = 12;
const PREFERRED_COLS_PER_ROW = 4;
const TARGET_SWATCH_MIN = 26;
const TARGET_SWATCH_MAX = 32;
const FALLBACK_SWATCH_MIN = 24;

type TeamSide = 'left' | 'right';

type ColorPickerProps = {
  controlsHorizontalPadding?: number;
  leftColor: string;
  rightColor: string;
  onSelectLeftColor: (color: string) => void;
  onSelectRightColor: (color: string) => void;
};

function getSwatchLayout(screenWidth: number, controlsHorizontalPadding: number) {
  const gap = screenWidth < 390 ? 8 : 10;
  const halfWidth = (screenWidth - controlsHorizontalPadding - DIVIDER_WIDTH - CENTER_GUTTER) / 2;

  let colsPerRow = PREFERRED_COLS_PER_ROW;
  let swatchSize = Math.floor((halfWidth - (colsPerRow - 1) * gap) / colsPerRow);

  while (swatchSize < TARGET_SWATCH_MIN && colsPerRow > 2) {
    colsPerRow -= 1;
    swatchSize = Math.floor((halfWidth - (colsPerRow - 1) * gap) / colsPerRow);
  }

  swatchSize = Math.min(TARGET_SWATCH_MAX, Math.max(FALLBACK_SWATCH_MIN, swatchSize));

  const rowWidth = colsPerRow * swatchSize + (colsPerRow - 1) * gap;
  if (rowWidth > halfWidth) {
    swatchSize = Math.floor((halfWidth - (colsPerRow - 1) * gap) / colsPerRow);
    swatchSize = Math.max(FALLBACK_SWATCH_MIN, Math.min(TARGET_SWATCH_MAX, swatchSize));
  }

  return { gap, halfWidth, swatchSize };
}

function ColorSwatches({
  align,
  gap,
  halfWidth,
  onSelectColor,
  selectedColor,
  side,
  swatchSize,
}: {
  align: 'left' | 'right';
  gap: number;
  halfWidth: number;
  onSelectColor: (color: string) => void;
  selectedColor: string;
  side: TeamSide;
  swatchSize: number;
}) {
  const sideLabel = side === 'left' ? 'Left bags' : 'Right bags';

  return (
    <View
      style={[
        styles.swatches,
        align === 'right' ? styles.swatchesRight : styles.swatchesLeft,
        { gap, width: halfWidth },
      ]}
    >
      {BAG_COLORS.map((color) => (
        <Pressable
          accessibilityLabel={`${sideLabel} ${color} bag color`}
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
  );
}

export function ColorPicker({
  controlsHorizontalPadding = 36,
  leftColor,
  onSelectLeftColor,
  onSelectRightColor,
  rightColor,
}: ColorPickerProps) {
  const { width } = useWindowDimensions();
  const { gap, halfWidth, swatchSize } = getSwatchLayout(width, controlsHorizontalPadding);

  return (
    <View style={styles.splitRow}>
      <View style={[styles.side, { width: halfWidth }]}>
        <ColorSwatches
          align="left"
          gap={gap}
          halfWidth={halfWidth}
          onSelectColor={onSelectLeftColor}
          selectedColor={leftColor}
          side="left"
          swatchSize={swatchSize}
        />
      </View>
      <View style={styles.divider} />
      <View style={[styles.side, styles.sideRight, { width: halfWidth }]}>
        <ColorSwatches
          align="right"
          gap={gap}
          halfWidth={halfWidth}
          onSelectColor={onSelectRightColor}
          selectedColor={rightColor}
          side="right"
          swatchSize={swatchSize}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
    marginHorizontal: CENTER_GUTTER / 2,
    width: DIVIDER_WIDTH,
  },
  lightSwatch: {
    borderColor: '#CBD5E1',
  },
  selectedSwatch: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  side: {
    flexShrink: 0,
    minWidth: 0,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  splitRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  swatch: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatchesLeft: {
    justifyContent: 'flex-start',
  },
  swatchesRight: {
    justifyContent: 'flex-end',
  },
});
