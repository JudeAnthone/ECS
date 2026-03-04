// new
import { FolderOpen, Users, Calendar, Layers } from "lucide-react";
import Image from "next/image";

const stats = [
	{
		icon: FolderOpen,
		value: "120+",
		label: "Extension Projects",
		description: "Approved & completed projects",
	},
	{
		icon: Users,
		value: "50,000+",
		label: "Beneficiaries Served",
		description: "Lives impacted across communities",
	},
	{
		icon: Calendar,
		value: "2018–2024",
		label: "Years of Records",
		description: "Documented service history",
	},
	{
		icon: Layers,
		value: "6",
		label: "Program Areas",
		description: "Core extension service categories",
	},
];

export default function StatsSection() {
	return (
		<section className="w-full relative overflow-hidden border-t-4 border-[#BA0021]">
			{/* Background Image */}
			<Image
				src="/stats-img.jpg"
				alt="EARIST Founding Anniversary"
				fill
				className="object-cover object-center"
				priority
			/>

			{/* Dark overlay */}
			<div className="absolute inset-0 bg-[#1a0005]/80" />

			{/* Subtle red vignette */}
			<div className="absolute inset-0 bg-gradient-to-r from-[#BA0021]/30 via-transparent to-[#BA0021]/30" />

			{/* Content */}
			<div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

				{/* Section Label */}
				<div className="text-center mb-12">
					<span className="inline-block text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">
						Our Impact in Numbers
					</span>
					<h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
						Serving Communities Since 2018
					</h2>
					<div className="mt-3 mx-auto w-16 h-1 rounded-full bg-[#BA0021]" />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
					{stats.map((stat, index) => (
						<div
							key={stat.label}
							className="relative flex flex-col items-center text-center group"
						>
							{/* Vertical divider — except last */}
							{index < stats.length - 1 && (
								<div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-white/10" />
							)}

							{/* Icon Circle */}
							<div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-[#BA0021]/60 transition-colors duration-300 backdrop-blur-sm">
								<stat.icon className="h-6 w-6 text-[#FFD700]" />
							</div>

							{/* Value */}
							<span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
								{stat.value}
							</span>

							{/* Label */}
							<span className="mt-2 text-sm font-bold text-[#FFD700] uppercase tracking-wide">
								{stat.label}
							</span>

							{/* Description */}
							<span className="mt-1 text-xs text-white/50 leading-relaxed">
								{stat.description}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
