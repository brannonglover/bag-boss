import {
  Animated,
  Easing,
  InteractionManager,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

function runAfterScorePaint(task: () => void) {
  return InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(task);
    });
  });
}

const FIREWORK_COLORS = ['#F8FAFC', '#FACC15', '#FB7185', '#60A5FA', '#A78BFA', '#34D399'];
const PARTICLES_PER_BURST = 20;

type FireworksOverlayProps = {
  trigger: number;
};

type Particle = {
  angle: number;
  color: string;
  distance: number;
  delay: number;
  size: number;
};

type Burst = {
  delay: number;
  id: string;
  particles: Particle[];
  x: number;
  y: number;
};

function createParticle(index: number): Particle {
  const angle = (Math.PI * 2 * index) / PARTICLES_PER_BURST + (Math.random() - 0.5) * 0.4;

  return {
    angle,
    color: FIREWORK_COLORS[index % FIREWORK_COLORS.length],
    delay: Math.random() * 0.12,
    distance: 78 + Math.random() * 122,
    size: 4 + Math.random() * 4,
  };
}

function createBursts(width: number, height: number, trigger: number): Burst[] {
  const usableHeight = Math.max(height * 0.68, 260);

  return Array.from({ length: 7 }, (_, index) => ({
    delay: index * 0.1 + Math.random() * 0.08,
    id: `${trigger}-${index}`,
    particles: Array.from({ length: PARTICLES_PER_BURST }, (_particle, particleIndex) =>
      createParticle(particleIndex),
    ),
    x: width * (0.1 + Math.random() * 0.8),
    y: usableHeight * (0.08 + Math.random() * 0.58),
  }));
}

export function FireworksOverlay({ trigger }: FireworksOverlayProps) {
  const { height, width } = useWindowDimensions();
  const [activeTrigger, setActiveTrigger] = useState(trigger);
  const [isVisible, setIsVisible] = useState(false);
  const progress = useRef(new Animated.Value(1)).current;

  const bursts = useMemo(
    () => createBursts(width, height, activeTrigger),
    [activeTrigger, height, width],
  );

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    let cancelled = false;
    let animation: Animated.CompositeAnimation | null = null;
    const interactionHandle = runAfterScorePaint(() => {
      if (cancelled) {
        return;
      }

      setActiveTrigger(trigger);
      setIsVisible(true);
      progress.setValue(0);

      animation = Animated.timing(progress, {
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => {
        if (finished) {
          setIsVisible(false);
        }
      });
    });

    return () => {
      cancelled = true;
      interactionHandle.cancel();
      animation?.stop();
    };
  }, [progress, trigger]);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {bursts.map((burst, burstIndex) => (
        <View key={burst.id} style={[styles.burst, { left: burst.x, top: burst.y }]}>
          <Animated.View
            style={[
              styles.flash,
              {
                opacity: Animated.subtract(progress, burst.delay).interpolate({
                  inputRange: [0, 0.08, 0.2],
                  outputRange: [0, 0.9, 0],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    scale: Animated.subtract(progress, burst.delay).interpolate({
                      inputRange: [0, 0.16],
                      outputRange: [0.2, 2.8],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          />
          {burst.particles.map((particle, particleIndex) => {
            const delayedProgress = Animated.subtract(progress, burst.delay + particle.delay).interpolate({
              inputRange: [0, 0.72],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });
            const translateX = delayedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(particle.angle) * particle.distance],
            });
            const translateY = delayedProgress.interpolate({
              inputRange: [0, 0.68, 1],
              outputRange: [
                0,
                Math.sin(particle.angle) * particle.distance,
                Math.sin(particle.angle) * particle.distance + 48,
              ],
            });
            const opacity = delayedProgress.interpolate({
              inputRange: [0, 0.12, 0.72, 1],
              outputRange: [0, 1, 0.85, 0],
            });

            return (
              <Animated.View
                key={`${burst.id}-${particleIndex}`}
                style={[
                  styles.particle,
                  {
                    opacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.spark,
                    {
                      backgroundColor: particle.color,
                      height: particle.size,
                      shadowColor: particle.color,
                      width: particle.size,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.trail,
                    {
                      backgroundColor: particle.color,
                      transform: [{ rotate: `${(particle.angle * 180) / Math.PI + 90}deg` }],
                    },
                  ]}
                />
              </Animated.View>
            );
          })}
          <Animated.Text
            style={[
              styles.twinkle,
              {
                opacity: Animated.subtract(progress, burst.delay).interpolate({
                  inputRange: [0, 0.08, 0.28, 0.48],
                  outputRange: [0, 0.85, 0.35, 0],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    translateY: Animated.subtract(progress, burst.delay).interpolate({
                      inputRange: [0, 0.72],
                      outputRange: [0, -26 - burstIndex * 4],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            *
          </Animated.Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
  },
  flash: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 999,
    height: 34,
    left: -17,
    position: 'absolute',
    top: -17,
    width: 34,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 8,
  },
  particle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  spark: {
    borderRadius: 999,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  trail: {
    borderRadius: 999,
    height: 20,
    opacity: 0.36,
    position: 'absolute',
    top: 4,
    width: 2,
  },
  twinkle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    left: -7,
    position: 'absolute',
    textShadowColor: '#FACC15',
    textShadowRadius: 10,
    top: -12,
  },
});
