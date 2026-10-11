import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/src/api/api-client";
import { ApiError } from "@/src/api/api-error";

export type AvailabilityResult = {
  emailAvailable: boolean | null;
  usernameAvailable: boolean | null;
};

type AvailabilityInput = {
  email?: string;
  username?: string;
};

const RATE_LIMIT_MESSAGE = "Za dużo prób. Spróbuj za chwilę.";

export const useSignUpAvailability = () =>
  useMutation<AvailabilityResult, ApiError, AvailabilityInput>({
    mutationFn: async (input) => {
      try {
        const { data } = await apiClient.post<AvailabilityResult>(
          "/auth/availability",
          input,
        );
        return data;
      } catch (error) {
        if (error instanceof ApiError && error.httpStatus === 429) {
          throw new ApiError({
            userMessage: RATE_LIMIT_MESSAGE,
            errorCode: error.errorCode,
            httpStatus: error.httpStatus,
          });
        }
        throw error;
      }
    },
  });
