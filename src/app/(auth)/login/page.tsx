import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AuthBrandPanel />
      <LoginForm />
    </div>
  );
}
