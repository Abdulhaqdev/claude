"use server";

import { redirect } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { loginSchema, registerSchema } from "@/lib/validations/schemas";
import { handleError } from "@/lib/errors/app-error";

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await authService.login(parsed.data.email, parsed.data.password);
  } catch (error) {
    const { message } = handleError(error);
    return { error: message };
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    organizationName: formData.get("organizationName") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await authService.register(parsed.data);
  } catch (error) {
    const { message } = handleError(error);
    return { error: message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await authService.logout();
  redirect("/login");
}
