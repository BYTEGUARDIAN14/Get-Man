import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const BG_COLOR = '#141210';
const TEXT_PRIMARY = '#EDE8DF';
const TEXT_MUTED = '#8A8278';
const ACCENT_DOT = '#5A7A5C';
const RULE_COLOR = '#2E2A24';

export default function SplashScreen() {
  const router = useRouter();

  // Shared values
  const dotOpacity = useSharedValue(0);
  const dotScale = useSharedValue(0.4);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(10);
  const ruleOpacity = useSharedValue(0);
  const ruleWidth = useSharedValue(0);
  const versionOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: Dot (0ms - 400ms)
    dotOpacity.value = withTiming(1, { duration: 400 });
    dotScale.value = withTiming(1, { 
      duration: 400, 
      easing: Easing.out(Easing.back(1.5)) 
    });

    // Step 2: Title (300ms - 700ms)
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    titleY.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    // Step 3: Tagline (500ms - 850ms)
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    taglineY.value = withDelay(500, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));

    // Step 4: Rule (700ms - 950ms)
    ruleOpacity.value = withDelay(700, withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }));
    ruleWidth.value = withDelay(700, withTiming(40, { duration: 250, easing: Easing.out(Easing.cubic) }));

    // Step 5: Version (950ms - 1100ms)
    versionOpacity.value = withDelay(950, withTiming(0.5, { duration: 150 }));

    // Step 6: Navigate away (2000ms)
    const timeout = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(navigateToHome)();
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const navigateToHome = () => {
    router.replace('/(tabs)');
  };

  // Animated styles
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const ruleStyle = useAnimatedStyle(() => ({
    opacity: ruleOpacity.value,
    width: ruleWidth.value,
  }));

  const versionStyle = useAnimatedStyle(() => ({
    opacity: versionOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      <View style={styles.centerContent}>
        <Animated.View style={[styles.dot, dotStyle]} />
        
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Apico</Text>
        </Animated.View>
        
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>your pocket API companion</Text>
        </Animated.View>
        
        <Animated.View style={[styles.rule, ruleStyle]} />
      </View>

      <Animated.View style={[styles.footer, versionStyle]}>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_DOT,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Lora_500Medium',
    fontSize: 48,
    color: TEXT_PRIMARY,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  rule: {
    height: 1,
    backgroundColor: RULE_COLOR,
    marginTop: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
  },
  version: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: TEXT_MUTED,
  },
});
