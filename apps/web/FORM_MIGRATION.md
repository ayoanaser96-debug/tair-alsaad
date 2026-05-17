# Form migration (React Hook Form + Zod)

Target pattern for dashboard forms:

1. Define fields with **Zod** in the relevant `features/*/schemas.ts` (or a colocated `*-form.schema.ts`).
2. Derive the form values type with **`z.infer<typeof schema>`**.
3. Use **`useForm({ resolver: zodResolver(schema), defaultValues: ... })`** from `react-hook-form`.
4. Submit via **`handleSubmit`**; call **`features/*/api.ts`** helpers that use **`apiRequest` / `apiRequestUnchecked`** — not raw `fetch`.
5. Map server validation errors to fields with **`setError`** when the API returns field-level detail.

**Remaining:** audit pages still using local `useState` for forms (e.g. login) and migrate incrementally without changing UX.
