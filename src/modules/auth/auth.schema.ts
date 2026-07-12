import { z } from "zod";

// Frontend collects first + last name; we accept either a single `name` or the
// pair and concatenate. Password min 8 mirrors the frontend validation.
export const signupSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    department: z.string().trim().optional(),
  })
  .refine((v) => v.name || (v.firstName && v.lastName), {
    message: "Provide either `name` or both `firstName` and `lastName`",
    path: ["name"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;
