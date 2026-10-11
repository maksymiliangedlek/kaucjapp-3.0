import { useState, useEffect, useRef } from "react";
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/src/auth/use-auth";
import { useUpdateUser, useUserDetails } from "@/src/api/hooks/use-user";
import { UpdateUserFormValues, UpdateUserSchema } from "@/src/validation/user";

export const useProfileSettingsForm = () => {
  const { user } = useAuth();
  const { data: me } = useUserDetails();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: updateUser, isPending } = useUpdateUser();
  const didSeed = useRef(false);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(UpdateUserSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      sharePhoneOnReservation: user?.sharePhoneOnReservation ?? true,
    },
  });

  const { control, setValue, reset, handleSubmit, formState } = form;
  const { isDirty, isValid } = formState;
  const isSaveDisabled = !isDirty || !isValid || isPending;

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!me || didSeed.current) return;
    didSeed.current = true;
    reset({
      firstName: me.firstName || "",
      lastName: me.lastName || "",
      sharePhoneOnReservation: me.sharePhoneOnReservation ?? true,
    });
  }, [me, reset]);

  const setSharePhoneOnReservation = (next: boolean) => {
    setValue("sharePhoneOnReservation", next, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const onSubmit = handleSubmit((data: UpdateUserFormValues) => {
    Keyboard.dismiss();

    updateUser(data, {
      onSuccess: () => {
        setIsSuccess(true);
        reset(data);
      },
    });
  });

  return {
    control,
    errors: formState.errors,
    onSubmit,
    isSaveDisabled,
    isPending,
    isSuccess,
    setSharePhoneOnReservation,
  };
};
