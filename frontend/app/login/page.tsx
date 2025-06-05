import { AppBanner } from "@/components/app-banner";
import { LoginForm } from "@/components/ui/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-svh w-full">
      <AppBanner />
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
