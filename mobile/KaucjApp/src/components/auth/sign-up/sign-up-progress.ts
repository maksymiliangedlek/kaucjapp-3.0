import { makeMutable } from "react-native-reanimated";

// Shared across step screens so a fast tap or swipe-back springs from the
// value currently on screen, not from zero.
export const signUpProgress = makeMutable(0);
