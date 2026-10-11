import { forwardRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, spacing } from "@/src/theme";
import type { SignUpValues } from "@/src/validation";

type Props = TextInputProps & {
  name: FieldPath<SignUpValues>;
  label: string;
  normalize?: (value: string) => string;
  /** Shown in the input; form value stays whatever Controller holds. */
  displayValue?: string;
  hint?: string;
  hintTone?: "success" | "error" | "muted";
  prefix?: string;
};

export const StepField = forwardRef<TextInput, Props>(function StepField(
  {
    name,
    label,
    normalize,
    displayValue,
    hint,
    hintTone = "muted",
    prefix,
    ...inputProps
  },
  ref,
) {
  const { control } = useFormContext<SignUpValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <StepFieldInput
          ref={ref}
          label={label}
          value={displayValue ?? value}
          error={error?.message}
          hint={hint}
          hintTone={hintTone}
          prefix={prefix}
          onChangeText={(text) => onChange(normalize ? normalize(text) : text)}
          onBlur={onBlur}
          {...inputProps}
        />
      )}
    />
  );
});

type InputProps = TextInputProps & {
  label: string;
  value: string;
  error?: string;
  hint?: string;
  hintTone?: "success" | "error" | "muted";
  prefix?: string;
};

const LABEL_REST = 22;
const LABEL_FLOAT = 13;

const StepFieldInput = forwardRef<TextInput, InputProps>(function StepFieldInput(
  {
    label,
    value,
    error,
    hint,
    hintTone = "muted",
    prefix,
    onChangeText,
    onBlur,
    onFocus,
    ...inputProps
  },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const focus = useSharedValue(0);
  const floated = useSharedValue(value ? 1 : 0);
  const errorOpacity = useSharedValue(0);
  const hasError = !!error;

  useEffect(() => {
    if (value) {
      floated.value = reduceMotion ? 1 : withTiming(1, { duration: 160 });
    }
  }, [floated, reduceMotion, value]);

  useEffect(() => {
    const next = hasError ? 1 : 0;
    errorOpacity.value = reduceMotion ? next : withTiming(next, { duration: 180 });
  }, [errorOpacity, hasError, reduceMotion]);

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: hasError
      ? colors.status.error
      : interpolateColor(
          focus.value,
          [0, 1],
          [colors.status.border, colors.primary.base],
        ),
  }));

  const labelStyle = useAnimatedStyle(() => {
    const t = floated.value;
    return {
      top: interpolate(t, [0, 1], [18, 0]),
      fontSize: interpolate(t, [0, 1], [LABEL_REST, LABEL_FLOAT]),
      color: interpolateColor(
        t,
        [0, 1],
        [colors.text.muted, colors.text.secondary],
      ),
    };
  });

  const messageStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const fontSize =
    value.length > 28 ? 16 : value.length > 22 ? 18 : 22;

  const hintColor =
    hintTone === "success"
      ? colors.primary.base
      : hintTone === "error"
        ? colors.status.error
        : colors.text.secondary;

  return (
    <View style={styles.wrap}>
      <View style={styles.fieldRow}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <View style={styles.inputWrap}>
          <Animated.Text pointerEvents="none" style={[styles.label, labelStyle]}>
            {label}
          </Animated.Text>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onFocus={(event) => {
              focus.value = reduceMotion ? 1 : withTiming(1, { duration: 160 });
              floated.value = reduceMotion ? 1 : withTiming(1, { duration: 160 });
              onFocus?.(event);
            }}
            onBlur={(event) => {
              focus.value = reduceMotion ? 0 : withTiming(0, { duration: 160 });
              if (!value) {
                floated.value = reduceMotion ? 0 : withTiming(0, { duration: 160 });
              }
              onBlur?.(event);
            }}
            placeholder=""
            placeholderTextColor={colors.text.muted}
            selectionColor={colors.primary.base}
            autoFocus
            style={[styles.input, { fontSize }]}
            {...inputProps}
          />
        </View>
      </View>
      <Animated.View style={[styles.line, hasError && styles.lineError, lineStyle]} />
      {hasError ? (
        <Animated.Text style={[styles.error, messageStyle]}>{error}</Animated.Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>
      ) : (
        <Text style={styles.errorSpacer}> </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  prefix: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: colors.text.primary,
    paddingBottom: spacing.sm,
    marginRight: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    paddingTop: spacing.md,
  },
  label: {
    position: "absolute",
    left: 0,
    fontWeight: "500",
  },
  input: {
    fontWeight: "600",
    letterSpacing: -0.3,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  line: {
    height: 1,
    borderRadius: 1,
  },
  lineError: {
    height: 2,
  },
  error: {
    marginTop: spacing.sm,
    minHeight: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.status.error,
  },
  hint: {
    marginTop: spacing.sm,
    minHeight: 18,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  errorSpacer: {
    marginTop: spacing.sm,
    minHeight: 18,
    fontSize: 13,
  },
});
