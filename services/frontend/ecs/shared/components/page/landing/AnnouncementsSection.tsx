// new
import { Megaphone, ArrowRight, Calendar, Tag, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const announcements = [
	{
		id: 1,
		title: "Community Outreach Program 2025 — Registration Now Open",
		date: "March 1, 2026",
		summary:
			"EARIST Extension Services invites all interested participants to register for the upcoming community outreach program focused on education and livelihood training.",
		category: "Program",
		badge: "New",
		featured: true,
	},
	{
		id: 2,
		title: "Annual Extension Service Report 2024 Published",
		date: "February 15, 2026",
		summary:
			"The comprehensive annual report summarizing all extension activities, beneficiaries reached, and project outcomes for 2024 is now available for download.",
		category: "Report",
		badge: null,
		featured: false,
	},
	{
		id: 3,
		title: "Health & Wellness Outreach in Barangay San Roque",
		date: "January 28, 2026",
		summary:
			"A health and wellness program was successfully conducted in partnership with the local government unit, serving over 300 community members.",
		category: "Event",
		badge: null,
		featured: false,
	},
	{
		id: 4,
		title: "Call for Extension Project Proposals — 2nd Semester 2026",
		date: "March 3, 2026",
		summary:
			"Faculty and staff are encouraged to submit extension project proposals for the 2nd semester of AY 2025–2026. Deadline for submission is March 31, 2026.",
		category: "Memo",
		badge: "Urgent",
		featured: false,
	},
	{
		id: 5,
		title: "Partnership Agreement Signed with Barangay 649, Manila",
		date: "February 5, 2026",
		summary:
			"EARIST Extension Services has officially signed a Memorandum of Agreement with Barangay 649, Manila for a series of community development activities.",
		category: "Partnership",
		badge: null,
		featured: false,
	},
];

const categoryColors: Record<string, string> = {
	Program: "bg-blue-50 text-blue-700 border-blue-200",
	Report: "bg-purple-50 text-purple-700 border-purple-200",
	Event: "bg-green-50 text-green-700 border-green-200",
	Memo: "bg-orange-50 text-orange-700 border-orange-200",
	Partnership: "bg-teal-50 text-teal-700 border-teal-200",
};

const badgeColors: Record<string, string> = {
	New: "bg-[#BA0021] text-white",
	Urgent: "bg-orange-500 text-white",
};

export default function AnnouncementsSection() {
	const featured = announcements.find((a) => a.featured);
	const rest = announcements.filter((a) => !a.featured);

	return (
		<section id="announcements" className="w-full bg-white py-16 sm:py-20">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<div className="w-8 h-8 rounded-lg bg-[#BA0021]/10 flex items-center justify-center">
								<Megaphone className="h-4 w-4 text-[#BA0021]" />
							</div>
							<span className="text-[#BA0021] text-sm font-bold uppercase tracking-wider">
								Announcements
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
							Latest News & Updates
						</h2>
						<p className="mt-2 text-gray-500 text-base max-w-xl">
							Stay informed about upcoming programs, activities, and important
							announcements from the EARIST Extension Services office.
						</p>
					</div>
					<Link
						href="/announcements"
						className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#BA0021] hover:underline shrink-0"
					>
						View All <ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				{/* Layout: Featured left + sidebar right */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					{/* LEFT — Featured Announcement */}
					{featured && (
						<article className="lg:col-span-3 group relative bg-gradient-to-br from-[#1a0005] to-[#3a0010] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-end min-h-[340px]">
							{/* Memo Background Image */}
							<Image
								src="/memo-sample.png"
								alt="Memo Background"
								fill
								className="object-cover object-top opacity-70 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
							/>

							{/* Dark overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-[#1a0005]/95 via-[#1a0005]/60 to-[#1a0005]/30" />

							{/* Top badges */}
							<div className="absolute top-5 left-5 flex items-center gap-2">
								<span
									className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[featured.category]}`}
								>
									{featured.category}
								</span>
								{featured.badge && (
									<span
										className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColors[featured.badge]}`}
									>
										{featured.badge}
									</span>
								)}
							</div>

							{/* Bell icon top right */}
							<div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
								<Bell className="h-4 w-4 text-white/60" />
							</div>

							{/* Content */}
							<div className="relative z-10 p-7 sm:p-8">
								<div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
									<Calendar className="h-3.5 w-3.5" />
									<span>{featured.date}</span>
								</div>
								<h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug group-hover:text-[#f4a0af] transition-colors">
									{featured.title}
								</h3>
								<p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
									{featured.summary}
								</p>
								<Link
									href="#"
									className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#f4a0af] hover:text-white transition-colors"
								>
									Read More <ArrowRight className="h-4 w-4" />
								</Link>
							</div>
						</article>
					)}

					{/* RIGHT — Sidebar Announcements */}
					<div className="lg:col-span-2 flex flex-col gap-4">
						{rest.map((item) => (
							<article
								key={item.id}
								className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-[#BA0021]/30 hover:shadow-md transition-all duration-200 flex gap-4"
							>
								{/* Left accent bar */}
								<div className="shrink-0 w-1 rounded-full bg-gray-200 group-hover:bg-[#BA0021] transition-colors duration-200" />

								<div className="flex-1 min-w-0">
									{/* Category + Badge + Date */}
									<div className="flex items-center flex-wrap gap-2 mb-2">
										<span
											className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
										>
											{item.category}
										</span>
										{item.badge && (
											<span
												className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColors[item.badge]}`}
											>
												{item.badge}
											</span>
										)}
										<span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
											<Calendar className="h-3 w-3" />
											{item.date}
										</span>
									</div>

									{/* Title */}
									<h3 className="text-sm font-bold text-[#1a1a1a] leading-snug group-hover:text-[#BA0021] transition-colors line-clamp-2">
										{item.title}
									</h3>

									{/* Summary */}
									<p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
										{item.summary}
									</p>

									{/* Read More */}
									<Link
										href="#"
										className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#BA0021] hover:underline"
									>
										Read More <ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
