import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SignupForm } from "@/shared/components/page/auth/SignUpForm";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin?: () => void;
}

export default function SignUpModal({ open, onOpenChange, onOpenLogin }: SignUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl px-2 sm:px-4 py-6 sm:py-8 rounded-2xl overflow-y-auto"
        style={{ maxHeight: '95vh' }}
        showCloseButton
      >
        <DialogTitle asChild>
          <VisuallyHidden>Sign Up</VisuallyHidden>
        </DialogTitle>
        <div className="w-full">
          <SignupForm onOpenLogin={onOpenLogin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
