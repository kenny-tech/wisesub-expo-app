// PasswordInput.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FormInput, { FormInputProps } from './FormInput';

interface PasswordInputProps extends Omit<FormInputProps, 'secureTextEntry'> {
  showPasswordToggle?: boolean;
  showLabel?: boolean;
  showPasswordHint?: boolean;
  isConfirmPassword?: boolean;
  passwordToMatch?: string;
  wrapperStyle?: object;
}

interface PasswordRule {
  id: string;
  label: string;
  test: (v: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: v => v.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)', test: v => /[A-Z]/.test(v) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)', test: v => /[a-z]/.test(v) },
  { id: 'number', label: 'One number (0–9)', test: v => /\d/.test(v) },
  { id: 'special', label: "One special character (@$!%*?&#'\-:,)", test: v => /[@$!%*?&#'\-:,]/.test(v) },
];

export const isPasswordValid = (v: string) => PASSWORD_RULES.every(r => r.test(v));

/* ─── Rule Row ─────────────────────────────────────── */
const RuleRow: React.FC<{ rule: PasswordRule; value: string; isLast: boolean }> = ({ rule, value, isLast }) => {
  const met = rule.test(value);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (met) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [met]);

  return (
    <View style={[styles.ruleRow, isLast && styles.ruleRowLast]}>
      <Animated.View style={[styles.ruleIcon, met && styles.ruleIconMet, { transform: [{ scale }] }]}>
        <Ionicons name="checkmark" size={10} color={met ? '#fff' : 'transparent'} />
      </Animated.View>
      <Text style={[styles.ruleText, met && styles.ruleTextMet]}>{rule.label}</Text>
    </View>
  );
};

/* ─── Main Component ────────────────────────────────── */
const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  showLabel = true,
  showPasswordHint = false,
  isConfirmPassword = false,
  passwordToMatch = '',
  wrapperStyle,
  value = '',
  error,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const panelAnim = useRef(new Animated.Value(0)).current;

  const str = value as string;
  const allValid = isPasswordValid(str);

  const showHintPanel = showPasswordHint && isFocused && hasStartedTyping && !allValid && !error;

  const confirmHasValue = isConfirmPassword && str.length > 0;
  const passwordsMatch = str === passwordToMatch;

  useEffect(() => {
    if (str.length > 0 && !hasStartedTyping) setHasStartedTyping(true);
  }, [str]);

  useEffect(() => {
    Animated.timing(panelAnim, {
      toValue: showHintPanel ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showHintPanel]);

  // 5 rules × 26px + title 28px + paddingTop 12 + paddingBottom 12 = 182
  const interpolatedHeight = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 182],
  });
  const interpolatedOpacity = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleFocus = (e: any) => { setIsFocused(true); onFocus?.(e); };
  const handleBlur = (e: any) => { setIsFocused(false); onBlur?.(e); };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <View style={styles.inputRow}>
        <FormInput
          {...props}
          value={value}
          showLabel={showLabel}
          secureTextEntry={!showPassword}
          error={error}
          onFocus={handleFocus}
          onBlur={handleBlur}
          containerStyle={styles.formInputContainer}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(v => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Password strength checklist ── */}
      <Animated.View style={[styles.hintPanel, { height: interpolatedHeight, opacity: interpolatedOpacity }]}>
        <Text style={styles.hintTitle}>Password requirements</Text>
        {PASSWORD_RULES.map((rule, index) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            value={str}
            isLast={index === PASSWORD_RULES.length - 1}
          />
        ))}
      </Animated.View>

      {/* ── Confirm password match badge ── */}
      {confirmHasValue && (
        <View style={styles.matchRow}>
          <View style={[styles.matchDot, { backgroundColor: passwordsMatch ? '#10B981' : '#EF4444' }]} />
          <Text style={[styles.matchText, { color: passwordsMatch ? '#10B981' : '#EF4444' }]}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </Text>
        </View>
      )}
    </View>
  );
};

/* ─── Styles ────────────────────────────────────────── */
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputRow: {
    position: 'relative',
    width: '100%',
  },
  formInputContainer: {
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 22,
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 10,
  },

  /* Hint panel */
  hintPanel: {
    overflow: 'hidden',
    backgroundColor: '#EEF3FD',      // very light blue tint of #1F54DD
    borderWidth: 1.5,
    borderColor: '#C3D4F8',          // soft blue border
    borderRadius: 10,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  hintTitle: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',                // primary blue for the label
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ruleRowLast: {
    marginBottom: 12,
  },
  ruleIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#A8BEF0',          // muted blue border for unmet
    backgroundColor: '#FFFFFF',      // clean white circle background
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleIconMet: {
    backgroundColor: '#059669',      // matches the green met-rule text
    borderColor: '#059669',
  },
  ruleText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4B6CB7',                // medium blue — readable on light bg
  },
  ruleTextMet: {
    color: '#059669',
  },

  /* Confirm match */
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    marginLeft: 2,
  },
  matchDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  matchText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});

export default PasswordInput;