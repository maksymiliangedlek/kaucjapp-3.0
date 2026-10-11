import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/src/theme";
import { signUpSchema, type SignUpValues } from "@/src/validation";
import { SignUpChrome } from "@/src/components/auth/sign-up/sign-up-chrome";
import { signUpProgress } from "@/src/components/auth/sign-up/sign-up-progress";

export default function SignUpLayout() {
  const methods = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    return () => {
      signUpProgress.value = 0;
    };
  }, []);

  return (
    <FormProvider {...methods}>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
            contentStyle: { backgroundColor: colors.background.main },
          }}
        />
        <SignUpChrome />
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
});
