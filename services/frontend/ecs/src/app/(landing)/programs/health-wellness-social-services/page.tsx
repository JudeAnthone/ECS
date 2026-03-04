import { Heart, Stethoscope, Brain, Users } from "lucide-react";

const services = [
	{
		icon: Stethoscope,
		title: "Medical & Dental Missions",
		description:
			"Free medical check-ups, consultations, laboratory tests, and dental services for underserved communities.",
	},
	{
		icon: Brain,
		title: "Mental Health & Counseling",
		description:
			"Mental health awareness campaigns, free counseling sessions, and stress management workshops.",
	},
	{
		icon: Heart,
		title: "Health Education & Awareness",
		description:
			"Community seminars on nutrition, disease prevention, maternal health, and healthy lifestyle practices.",
	},
	{
		icon: Users,
		title: "Social Welfare Programs",
		description:
			"Support services for vulnerable populations including senior citizens, PWDs, and families in crisis.",
	},
];

export default function HealthWellnessSocialServicesPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
						Programs
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
						Health, Wellness &amp; Social Services
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
						The Health, Wellness &amp; Social Services program promotes physical,
						mental, and social well-being in underserved communities through medical
						outreach, mental health support, health education, and social welfare
						initiatives. We partner with healthcare professionals and social workers to
						provide accessible, quality care to those in need.
					</p>
				</div>

				{/* Services */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
						Services We Provide
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{services.map((item) => (
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

				{/* Priority Areas */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Priority Health Areas
					</h2>
					<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed">
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Maternal and child health
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Mental health awareness and support
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Nutrition and malnutrition prevention
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Communicable disease prevention
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Senior citizen care and support
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
