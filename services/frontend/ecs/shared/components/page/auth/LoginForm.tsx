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
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await AuthService.login({ email, password })
      
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
        router.push('/public-user/public-user-project-list')
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
          </Field>
          <Field>
            <Button type="submit" className="cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </Field>
          <FieldSeparator>OR</FieldSeparator>
          <Field className="grid gap-2 sm:grid-cols-1">
            <Button variant="outline" type="button" className="cursor-pointer border-primary/70" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/terms-of-service">Terms of Service</Link>{" "}
        and <Link href="/privaty-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}

