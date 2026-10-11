import * as z from "zod";

export const signUpSchema = z.object({
  firstName: z.string().trim().min(2, "Podaj swoje imię."),
  lastName: z.string().trim().min(2, "Podaj swoje nazwisko."),
  userName: z
    .string()
    .trim()
    .min(6, "Nazwa użytkownika musi mieć co najmniej 6 znaków.")
    .max(100, "Nazwa użytkownika jest za długa.")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Nazwa użytkownika może zawierać tylko litery i cyfry.",
    ),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Podaj 9-cyfrowy numer telefonu."),
  email: z.string().trim().email("Wprowadź poprawny adres email."),
  password: z
    .string()
    .trim()
    .min(6, "Hasło musi mieć co najmniej 6 znaków.")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę.")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę.")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Hasło musi zawierać co najmniej jeden znak specjalny.",
    ),
});

export type SignUpField = keyof SignUpValues;

export const SIGN_UP_STEPS: {
  route: "/sign-up" | "/sign-up/email" | "/sign-up/username" | "/sign-up/phone" | "/sign-up/password" | "/sign-up/summary";
  fields: SignUpField[];
}[] = [
  { route: "/sign-up", fields: ["firstName", "lastName"] },
  { route: "/sign-up/email", fields: ["email"] },
  { route: "/sign-up/username", fields: ["userName"] },
  { route: "/sign-up/phone", fields: ["phoneNumber"] },
  { route: "/sign-up/password", fields: ["password"] },
  { route: "/sign-up/summary", fields: [] },
];
export const signInSchema = z.object({
  email: z.string().trim().email("Wprowadź poprawny adres email."),
  password: z.string().trim().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Podaj poprawny adres e-mail"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
