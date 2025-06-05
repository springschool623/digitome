"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { login } from "@/api/login";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [mobilePhone, setMobilePhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await login(mobilePhone, password);

      // Lưu token vào cookie
      document.cookie = `token=${data.token}; path=/;`;
      console.log("Token:", data.token);
      console.log("User:", data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Chuyển hướng
      router.push("/dashboard");
    } catch (err) {
      setError("Lỗi không xác định!");
      console.error("Login error:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập số điện thoại và mật khẩu để đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mobilePhone">Số điện thoại</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <span className="text-xs text-red-500">{error}</span>}
              <Button type="submit" variant="addButton" className="w-full">
                Đăng nhập
              </Button>
              {/* <Button variant="outline" className="w-full">
                Single Sign On
              </Button> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
