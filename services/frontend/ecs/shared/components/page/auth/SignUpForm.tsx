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

import Link from "next/link"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props} className="border-primary/10">
      <CardHeader>
        <CardTitle>Request an account</CardTitle>
        <CardDescription>
          Enter your information below to request your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sign_up_first_name">First name<span className="text-destructive">*</span></FieldLabel>
              <Input id="sign_up_first_name" type="text" placeholder="Zoro" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="sign_up_last_name">Last name<span className="text-destructive">*</span></FieldLabel>
              <Input id="sign_up_last_name" type="text" placeholder="Roronoa" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="sign_up_user_name">Username<span className="text-destructive">*</span></FieldLabel>
              <Input id="sign_up_user_name" type="text" placeholder="Zoro_67" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="sign_up_pass_hash">Password<span className="text-destructive">*</span></FieldLabel>
              <Input id="sign_up_pass_hash" type="password" placeholder="***********" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="sign_up_confirm_pass_hash">Confirm password<span className="text-destructive">*</span></FieldLabel>
              <Input id="sign_up_confirm_pass_hash" type="password" placeholder="***********" required />
            </Field>
             <Field>

              <FieldLabel htmlFor="sign_up_department">Department<span className="text-destructive">*</span></FieldLabel>
              <Input
                id="sign_up_department"
                type="text"
                placeholder="College of Engineering"
                required
              />
            </Field>
            <Field>

              <FieldLabel htmlFor="sign_up_email">Email<span className="text-destructive">*</span></FieldLabel>
              <Input
                id="sign_up_email"
                type="email"
                placeholder="email@example.com"
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="cursor-pointer">Request Account</Button>
                <Button variant="outline" type="button" className="border-primary cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
