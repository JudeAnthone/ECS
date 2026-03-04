"use client";

import Navigation from "@/shared/components/layout/landing/Navigation";
import Footer from "@/shared/components/layout/landing/Footer";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/shared/components/ui/LoginModal"), { ssr: false });

export default function LandingLayout({ children }: { children: React.ReactNode }) {
	const [loginOpen, setLoginOpen] = useState(false);

	return (
		<>
			{/* Top Utility Bar */}
			<div className="w-full bg-[#7A0019] text-white text-xs relative z-50">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end h-9">
					<LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

					<div className="flex items-center gap-3">
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
						<Link
							href="/sign-up"
							className="text-white font-semibold hover:underline transition-all"
						>
							Sign Up
						</Link>
					</div>
				</div>
			</div>
			<Navigation />
			{children}
			<Footer />
		</>
	);
}
