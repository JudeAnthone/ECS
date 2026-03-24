import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LoginForm } from "@/shared/components/page/auth/LoginForm";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSignUp?: () => void;
}

export default function LoginModal({ open, onOpenChange, onOpenSignUp }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton>
        <DialogTitle asChild>
          <VisuallyHidden>Login</VisuallyHidden>
        </DialogTitle>
        <LoginForm onOpenSignUp={onOpenSignUp} />
      </DialogContent>
    </Dialog>
  );
}
