import { Users, Handshake, MapPin, Calendar } from "lucide-react";

const activities = [
	{
		icon: Users,
		title: "Community Needs Assessment",
		description:
			"Engaging directly with community members to understand their needs, challenges, and priorities for development.",
	},
	{
		icon: Handshake,
		title: "Partnership Building",
		description:
			"Forging strong relationships with local government units, NGOs, and community organizations for collaborative action.",
	},
	{
		icon: MapPin,
		title: "On-Site Programs & Events",
		description:
			"Organizing community-based activities such as health missions, feeding programs, and cultural events.",
	},
	{
		icon: Calendar,
		title: "Regular Community Engagement",
		description:
			"Maintaining continuous presence and communication with partner communities to ensure sustained impact.",
	},
];

export default function CommunityOutreachPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
						Programs
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
						Community Outreach
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				{/* Overview */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Program Overview
					</h2>
					<p className="text-gray-600 text-base sm:text-lg leading-relaxed">
						The Community Outreach program focuses on direct engagement with partner
						communities to support sustainable development, social welfare, and quality
						of life improvements. We work collaboratively with local stakeholders to
						design and implement programs that address real community needs.
					</p>
				</div>

				{/* Activities */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
						Key Activities
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{activities.map((item) => (
							<div
								key={item.title}
								className="border border-gray-200 rounded-lg p-6 hover:border-[#BA0021]/30 hover:shadow-md transition-all duration-200"
							>
								<div className="w-12 h-12 rounded-lg bg-[#BA0021]/10 flex items-center justify-center mb-4">
									<item.icon className="h-6 w-6 text-[#BA0021]" />
								</div>
								<h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
									{item.title}
								</h3>
								<p className="text-sm text-gray-500 leading-relaxed">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Partner Communities */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Partner Communities
					</h2>
					<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed">
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Urban poor communities in Manila and surrounding areas
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Informal settlement areas requiring social services
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Local government units and barangays
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Schools and educational institutions
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Non-profit organizations and civil society groups
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
