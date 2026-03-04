import { Sprout, Recycle, CloudRain, Leaf } from "lucide-react";

const initiatives = [
	{
		icon: Sprout,
		title: "Urban Gardening & Food Security",
		description:
			"Promoting urban farming and community gardens to improve food security and nutrition in densely populated areas.",
	},
	{
		icon: Recycle,
		title: "Waste Management & Recycling",
		description:
			"Training communities in proper waste segregation, recycling, composting, and sustainable waste management practices.",
	},
	{
		icon: CloudRain,
		title: "Climate Change Awareness",
		description:
			"Education campaigns on climate change impacts, adaptation strategies, and disaster risk reduction.",
	},
	{
		icon: Leaf,
		title: "Environmental Restoration",
		description:
			"Tree planting, coastal clean-ups, waterway rehabilitation, and biodiversity conservation projects.",
	},
];

export default function EnvironmentalSustainabilityPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
						Programs
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
						Environmental &amp; Sustainability Initiatives
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
						The Environmental &amp; Sustainability Initiatives program promotes
						environmental protection, climate awareness, and sustainable practices
						through community-based projects. We empower communities to become stewards
						of the environment and adopt sustainable lifestyles that protect natural
						resources for future generations.
					</p>
				</div>

				{/* Initiatives */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
						Key Initiatives
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{initiatives.map((item) => (
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

				{/* Impact Areas */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Environmental Focus Areas
					</h2>
					<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed">
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Solid waste management and recycling
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Water quality and conservation
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Air quality improvement
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Urban greening and biodiversity
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Climate resilience and disaster preparedness
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
