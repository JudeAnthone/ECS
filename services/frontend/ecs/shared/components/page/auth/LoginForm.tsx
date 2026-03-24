"use client"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/components/ui/Field"
import { Input } from "@/shared/components/ui/Input"
import { AuthService } from "@/shared/lib/auth-service"
import { useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"
import Image from "next/image"

export function LoginForm({
  className,
  onOpenSignUp,
  ...props
}: React.ComponentProps<"div"> & { onOpenSignUp?: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await AuthService.login({ email, password })
      // Store keepSignedIn flag in localStorage or sessionStorage
      if (keepSignedIn) {
        localStorage.setItem('keep_signed_in', 'true');
      } else {
        localStorage.removeItem('keep_signed_in');
      }
      // Redirect based on user role
      const role = response.user.role
      if (role === 'admin') {
        router.push('/admin/admin-dashboard')
      } else if (role === 'program_chair') {
        router.push('/program-chair/program-chair-dashboard')
      } else if (role === 'project_head') {
        router.push('/project-head/project-head-dashboard')
      } else if (role === 'staff') {
        router.push('/staff/staff-dashboard')
      } else {
        router.push('/public-user/public-user-dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-15 items-center justify-center rounded-md">
                <Image
                  src="/earist-logo.png"
                  alt="Earist"
                  width="100"
                  height="100"
                />
              </div>
              <span className="sr-only">Earist</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to <br/> Earist Extension Service</h1>
              <FieldDescription>
              First time here? <Link href="/sign-up">Sign up</Link>
            </FieldDescription>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="login_email">Email<span className="text-destructive">*</span></FieldLabel>
            <Input
              id="login_email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-primary"
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="login_password">Password<span className="text-destructive">*</span></FieldLabel>
            <Input
              id="login_password"
              type="password"
              placeholder="************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-primary"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs select-none">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={keepSignedIn}
                  onChange={e => setKeepSignedIn(e.target.checked)}
                />
                Keep me signed in
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline ml-2">
                Forgot password?
              </Link>
            </div>
          </Field>
          <Field>
            <Button type="submit" className="cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </Field>
          {/* Google Magic Link removed for now */}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/terms-of-service">Terms of Service</Link>{" "}
        and <Link href="/privaty-policy">Privacy Policy</Link>.
      </FieldDescription>
      <FieldDescription className="px-6 text-center">
        Don't have an account?{' '}
        <button type="button" className="text-primary underline font-semibold" onClick={onOpenSignUp}>
          Sign up
        </button>
      </FieldDescription>
    </div>
  )
}

