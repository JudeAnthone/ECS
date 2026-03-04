import { Button } from "@/shared/components/ui/Button";
import { ArrowRight, Megaphone, MapPin, Users, FolderOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
	return (
		<section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
			{/* Background Image */}
			<Image
				src="/hero-img.jpg"
				alt="EARIST Extension Services"
				fill
				className="object-cover object-center"
				priority
			/>

			{/* Layered overlays */}
			<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
			<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

			{/* Hero Content */}
			<div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* LEFT — Main Content */}
					<div>
						{/* Label pill */}
						<div className="inline-flex items-center gap-2 bg-[#BA0021]/20 border border-[#BA0021]/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
							<span className="w-2 h-2 rounded-full bg-[#BA0021] animate-pulse" />
							<span className="text-white text-xs font-bold uppercase tracking-widest">
								EARIST Extension Services
							</span>
						</div>

						{/* Headline */}
						<h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
							Empowering
							<span className="block text-[#FFD700]">Communities</span>
							<span className="block text-3xl sm:text-4xl font-bold text-white/70 mt-2 tracking-normal">
								Since 2018
							</span>
						</h1>

						{/* Divider */}
						<div className="mt-6 w-16 h-1 rounded-full bg-[#BA0021]" />

						{/* Description */}
						<p className="mt-5 text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
							Dedicated to community development through education, collaboration, and
							outreach programs that create lasting positive impact across
							communities.
						</p>

						{/* CTAs */}
						<div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
							<Button
								size="lg"
								className="bg-[#BA0021] text-white font-bold hover:bg-[#9a001a] rounded-md text-sm px-7 py-6 shadow-lg"
								asChild
							>
								<Link href="#projects">
									Browse Projects <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-2 border-white/40 text-white font-semibold hover:bg-white hover:text-[#BA0021] rounded-md text-sm px-7 py-6 bg-transparent backdrop-blur-sm"
								asChild
							>
								<Link href="#announcements">
									<Megaphone className="mr-2 h-4 w-4" />
									Announcements
								</Link>
							</Button>
						</div>

						{/* Quick stats row */}
						<div className="mt-10 flex flex-wrap gap-6">
							{[
								{ icon: FolderOpen, value: "120+", label: "Projects" },
								{ icon: Users, value: "50,000+", label: "Beneficiaries" },
								{ icon: MapPin, value: "6", label: "Program Areas" },
							].map((stat) => (
								<div key={stat.label} className="flex items-center gap-2.5">
									<div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
										<stat.icon className="h-4 w-4 text-[#FFD700]" />
									</div>
									<div>
										<p className="text-white font-extrabold text-base leading-none">
											{stat.value}
										</p>
										<p className="text-white/50 text-[11px] leading-none mt-0.5">
											{stat.label}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* RIGHT — Announcement Card (desktop only) */}
					<div className="hidden lg:flex flex-col items-end gap-4">
						{/* Latest Announcement Card */}
						<div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
							<div className="flex items-center gap-2 mb-4">
								<div className="w-7 h-7 rounded-lg bg-[#BA0021] flex items-center justify-center">
									<Megaphone className="h-3.5 w-3.5 text-white" />
								</div>
								<span className="text-[#FFD700] text-xs font-bold uppercase tracking-wider">
									Latest Announcement
								</span>
							</div>

							<div className="space-y-3">
								{/* Featured */}
								<div className="bg-white/10 rounded-xl p-4 border border-white/10">
									<span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700] bg-[#BA0021]/40 px-2 py-0.5 rounded-full">
										New · Program
									</span>
									<p className="mt-2 text-sm font-bold text-white leading-snug">
										Community Outreach Program 2025 — Registration Now Open
									</p>
									<p className="text-white/50 text-xs mt-1.5">March 1, 2026</p>
								</div>

								{/* Secondary item */}
								<div className="flex gap-3 items-start px-1">
									<div className="w-1 shrink-0 rounded-full bg-[#BA0021] self-stretch" />
									<div>
										<p className="text-xs font-semibold text-white/80 leading-snug line-clamp-2">
											Call for Extension Project Proposals — 2nd Semester 2026
										</p>
										<p className="text-white/40 text-[11px] mt-1">
											March 3, 2026
										</p>
									</div>
									<span className="shrink-0 text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
										Urgent
									</span>
								</div>
							</div>

							<Link
								href="#announcements"
								className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#FFD700] hover:text-white transition-colors"
							>
								View all announcements <ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom fade */}
			<div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
		</section>
	);
}
