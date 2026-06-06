import { getCurrentUser } from "@/lib/auth/jwt";
import { UnauthorizedError } from "@/lib/errors/app-error";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function getAuthContext() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return { user, organizationId: user.organizationId };
}

export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    obj[key] = String(value);
  });
  return obj;
}

export function emptyToUndefined(value: string | undefined) {
  return value === "" ? undefined : value;
}
