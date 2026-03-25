
"use client";

import React, { useState } from "react";
import Navigation from "@/shared/components/layout/landing/Navigation";
import Footer from "@/shared/components/layout/landing/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/shared/components/ui/LoginModal"), { ssr: false });
const SignUpModal = dynamic(() => import("@/shared/components/ui/SignUpModal"), { ssr: false });

export default function LandingLayout({ children }: { children: React.ReactNode }) {
	const [loginOpen, setLoginOpen] = useState(false);
	const [signUpOpen, setSignUpOpen] = React.useState(false);

	// Handlers to switch between dialogs
	const handleOpenLogin = () => {
		setSignUpOpen(false);
		setTimeout(() => setLoginOpen(true), 100);
	};
	const handleOpenSignUp = () => {
		setLoginOpen(false);
		setTimeout(() => setSignUpOpen(true), 100);
	};

		// Use dynamic import to avoid SSR issues with localStorage
		const [user, setUser] = useState<any>(null);
		React.useEffect(() => {
			if (typeof window !== 'undefined') {
				const AuthService = require("@/shared/lib/auth-service").AuthService;
				setUser(AuthService.getUser());
			}
		}, []);

		return (
			<>
				{/* Top Utility Bar */}
				<div className="w-full bg-[#7A0019] text-white text-xs relative z-50">
					<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end h-9">
						<LoginModal open={loginOpen} onOpenChange={setLoginOpen} onOpenSignUp={handleOpenSignUp} />
						<SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} onOpenLogin={handleOpenLogin} />
						<div className="flex items-center gap-3">
							{user ? (
								(() => {
									const roleSlug = String(user.role || '').replace(/_/g, '-')
									return (
								<Link
										href={`/${roleSlug}/${roleSlug}-dashboard`}
									className="text-white font-semibold hover:underline transition-all"
								>
									Go back to Dashboard
								</Link>
									)
								})()
							) : (
								<>
									{/* Login */}
									<button
										onClick={() => setLoginOpen(true)}
										className="text-white font-semibold hover:underline transition-all"
									>
										Login
									</button>
									{/* Divider */}
									<span className="text-white/40">|</span>
									{/* Sign Up */}
								<button
									onClick={() => setSignUpOpen(true)}
									className="text-white font-semibold hover:underline transition-all"
								>
									Sign Up
								</button>
								</>
							)}
						</div>
					</div>
				</div>
				<Navigation />
				{children}
				<Footer />
			</>
		);
}
