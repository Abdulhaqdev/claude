import { Header } from "@/components/layout/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getCurrentUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Header
        title="Dashboard"
        description={`Welcome back, ${user.firstName}`}
      />
      <DashboardContent organizationId={user.organizationId} />
    </>
  );
}
