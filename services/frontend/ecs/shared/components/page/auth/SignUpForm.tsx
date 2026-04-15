"use client";

import { Button } from "@/shared/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/Field"
import { Input } from "@/shared/components/ui/Input"
import { Alert, AlertDescription } from "@/shared/components/ui/Alert"
import { AuthService } from "@/shared/lib/auth-service"

import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignupForm({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      // Check account status
      if (response.user.account_status === "pending_approval") {
        setSuccess("Account created! Please wait for admin approval before logging in.");
        // Clear form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
          department: "",
          contact_number: "",
        });
      } else {
        // Account is active, redirect to dashboard based on role
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          const role = response.user.role;
          if (role === 'admin') {
            router.push('/admin/admin-dashboard');
          } else if (role === 'program_chair') {
            router.push('/program-chair/program-chair-dashboard');
          } else if (role === 'project_head') {
            router.push('/project-head/project-head-dashboard');
          } else if (role === 'staff') {
            router.push('/staff/staff-dashboard');
          } else {
            router.push('/public-user/public-user-dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2 text-center mt-8 mb-2">
        <Link
          href="/"
          className="flex flex-col items-center gap-2 font-medium"
        >
          <div className="flex size-15 items-center justify-center rounded-md">
            <Image
              src="/earist-logo.png"
              alt="Earist"
              width={100}
              height={100}
              priority
            />
          </div>
          <span className="sr-only">Earist</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#CC2E28]">Sign up to<br/> <span className="text-black">Earist Extension Service</span></h1>
      </div>
      <div className="pb-2">
        <div className="text-lg font-semibold text-[#CC2E28]">Request an account</div>
        <div className="text-gray-600">
          Enter your information below to request your account
        </div>
      </div>
      <div className="pt-0">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="first_name">First name<span className="text-destructive">*</span></FieldLabel>
              <Input 
                id="first_name" 
                name="first_name"
                type="text" 
                placeholder="John" 
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="last_name">Last name<span className="text-destructive">*</span></FieldLabel>
              <Input 
                id="last_name" 
                name="last_name"
                type="text" 
                placeholder="Doe" 
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={isLoading}
                required 
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email<span className="text-destructive">*</span></FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username<span className="text-destructive">*</span></FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              <FieldDescription>
                Must be unique and alphanumeric (3-50 characters)
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password<span className="text-destructive">*</span></FieldLabel>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="***********" 
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldDescription>
                Must be at least 6 characters
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password<span className="text-destructive">*</span></FieldLabel>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="***********" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="cursor-pointer w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Request Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  By clicking continue, you agree to our <Link href="/terms-of-service">Terms of Service</Link>{" "}
                  and <Link href="/privaty-policy">Privacy Policy</Link>.
                </FieldDescription>
                <FieldDescription className="px-6 text-center">
                  Already have an account?{' '}
                  <button type="button" className="text-primary underline font-semibold" onClick={onOpenLogin}>
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
