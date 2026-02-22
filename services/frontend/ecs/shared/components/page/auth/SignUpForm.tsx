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
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    section: "",
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
        password: formData.password,
        section: formData.section || undefined,
      });

      // Check account status
      if (response.user.account_status === "pending_approval") {
        setSuccess("Account created! Please wait for admin approval before logging in.");
        // Clear form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirmPassword: "",
          section: "",
        });
      } else {
        // Account is active, redirect to dashboard based on role
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          const role = response.user.role;
          if (role === 'admin') {
            router.push('/admin/admin-dashboard');
          } else if (role === 'project_chair') {
            router.push('/project-chair/project-chair-dashboard');
          } else if (role === 'project_head') {
            router.push('/project-head/project-head-dashboard');
          } else if (role === 'staff') {
            router.push('/staff/staff-dashboard');
          } else {
            router.push('/public-user/public-user-project-list');
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
    <Card {...props} className="border-primary/10">
      <CardHeader>
        <CardTitle>Request an account</CardTitle>
        <CardDescription>
          Enter your information below to request your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <FieldLabel htmlFor="password">Password<span className="text-destructive">*</span></FieldLabel>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="***********" 
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required 
              />
              <FieldDescription>
                Must be at least 6 characters
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password<span className="text-destructive">*</span></FieldLabel>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                placeholder="***********" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required 
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="section">Department / Section</FieldLabel>
              <Input
                id="section"
                name="section"
                type="text"
                placeholder="College of Engineering (Optional)"
                value={formData.section}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="cursor-pointer w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Request Account"}
                </Button>
                <Button variant="outline" type="button" className="border-primary cursor-pointer w-full" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  By clicking continue, you agree to our <Link href="/terms-of-service">Terms of Service</Link>{" "}
                  and <Link href="/privaty-policy">Privacy Policy</Link>.
                </FieldDescription>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
