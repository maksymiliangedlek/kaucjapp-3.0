/** National PL digits only (no country code). */
export const stripPhoneDigits = (value: string) =>
  value.replace(/\D/g, "").slice(0, 9);

/** Display as "XXX XXX XXX". */
export const formatPhoneGroups = (digits: string) => {
  const clean = stripPhoneDigits(digits);
  const parts = [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 9)].filter(
    Boolean,
  );
  return parts.join(" ");
};
