export type FormState = {
  error?: string;
  sukses?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export function kumpulkanGalat(isu: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const i of isu) {
    const k = String(i.path[0] ?? "");
    if (k && !fieldErrors[k]) fieldErrors[k] = i.message;
  }
  return fieldErrors;
}

export function ambilTeks(formData: FormData, nama: string[]) {
  const hasil: Record<string, string> = {};
  for (const n of nama) hasil[n] = String(formData.get(n) ?? "");
  return hasil;
}