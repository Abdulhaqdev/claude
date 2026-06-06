import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOrganizationId() {
  const user = await requireUser();
  return user.organizationId;
}
