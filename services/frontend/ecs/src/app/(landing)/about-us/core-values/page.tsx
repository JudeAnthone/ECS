import { Heart, Users, Lightbulb, Shield, HandHeart, Target } from "lucide-react";

const values = [
	{
		icon: Heart,
		title: "Service Excellence",
		description:
			"Delivering high-quality extension programs that address real community needs and create measurable impact.",
	},
	{
		icon: Users,
		title: "Community Partnership",
		description:
			"Building strong, respectful relationships with partner communities and stakeholders based on mutual trust.",
	},
	{
		icon: Lightbulb,
		title: "Innovation",
		description:
			"Applying creative and research-based approaches to solve community problems and improve program delivery.",
	},
	{
		icon: Shield,
		title: "Integrity",
		description:
			"Upholding ethical standards, transparency, and accountability in all extension activities and operations.",
	},
	{
		icon: HandHeart,
		title: "Social Responsibility",
		description:
			"Fostering a culture of volunteerism and civic engagement among students, faculty, and staff.",
	},
	{
		icon: Target,
		title: "Sustainability",
		description:
			"Designing programs that create long-term benefits and empower communities to sustain development independently.",
	},
];

export default function CoreValuesPage() {
	return (
		<main className="min-h-screen bg-white font-sans">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1 font-sans">
						About Us
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
						Core Values
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mb-10 font-sans">
					Our core values guide every program, partnership, and initiative we undertake.
					They reflect our commitment to ethical service and meaningful community
					engagement.
				</p>

				{/* Values Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{values.map((value) => (
						<div
							key={value.title}
							className="group p-6 rounded-lg border border-gray-200 bg-white hover:border-[#BA0021]/30 hover:shadow-md transition-all duration-200"
						>
							<div className="w-12 h-12 rounded-lg bg-[#BA0021]/10 flex items-center justify-center mb-4 group-hover:bg-[#BA0021] transition-colors duration-200">
								<value.icon className="h-6 w-6 text-[#BA0021] group-hover:text-white transition-colors duration-200" />
							</div>
							<h3 className="text-lg font-bold text-[#1a1a1a] mb-2 font-sans">
								{value.title}
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed font-sans">
								{value.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
