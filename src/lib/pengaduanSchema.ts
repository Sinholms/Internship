import { z } from 'zod';

export const KATEGORI_PENGADUAN = ['layanan', 'teknis', 'informasi', 'lainnya'] as const;

export const pengaduanSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, 'Nama harus diisi.')
    .max(255, 'Nama tidak boleh lebih dari 255 karakter.'),
  email: z.email('Email tidak valid.').max(255, 'Email tidak boleh lebih dari 255 karakter.'),
  subjek: z
    .string()
    .trim()
    .min(3, 'Subjek harus minimal 3 karakter.')
    .max(255, 'Subjek tidak boleh lebih dari 255 karakter.'),
  kategori: z.enum(KATEGORI_PENGADUAN, 'Kategori tidak valid.'),
  pesan: z
    .string()
    .trim()
    .min(10, 'Pesan harus minimal 10 karakter.')
    .max(5000, 'Pesan tidak boleh lebih dari 5000 karakter.'),
});

export type PengaduanValues = z.infer<typeof pengaduanSchema>;
export type PengaduanFieldErrors = Partial<Record<keyof PengaduanValues, string>>;

export function validatePengaduan(input: unknown):
  | { readonly ok: true; readonly data: PengaduanValues }
  | { readonly ok: false; readonly fieldErrors: PengaduanFieldErrors } {
  const result = pengaduanSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: PengaduanFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && field in pengaduanSchema.shape && !fieldErrors[field as keyof PengaduanValues]) {
      fieldErrors[field as keyof PengaduanValues] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
