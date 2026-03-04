import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

const offerings = [
	{
		icon: BookOpen,
		title: "Skills Development Workshops",
		description:
			"Hands-on workshops covering livelihood skills such as food processing, handicrafts, digital skills, and entrepreneurship.",
	},
	{
		icon: Users,
		title: "Capacity-Building Seminars",
		description:
			"Seminars focused on leadership, public speaking, project management, and organizational development for community leaders.",
	},
	{
		icon: Award,
		title: "Short Courses & Certifications",
		description:
			"Accredited short courses in various fields including IT, business management, health and safety, and technical skills.",
	},
	{
		icon: GraduationCap,
		title: "Literacy & Numeracy Programs",
		description:
			"Basic education programs for out-of-school youth and adults to improve literacy, numeracy, and digital competence.",
	},
];

export default function EducationTrainingPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
						Programs
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
						Education &amp; Training
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
						The Education &amp; Training program provides capacity-building workshops,
						seminars, and short courses designed to empower communities through skills
						development, literacy improvement, and professional training. We aim to
						bridge the gap between education and employment by equipping individuals
						with practical, market-ready skills.
					</p>
				</div>

				{/* What We Offer */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
						What We Offer
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{offerings.map((item) => (
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

				{/* Target Beneficiaries */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Target Beneficiaries
					</h2>
					<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed">
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Out-of-school youth and adults seeking skills development
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Community leaders and barangay officials
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Small business owners and aspiring entrepreneurs
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Senior citizens and persons with disabilities
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Women seeking livelihood and empowerment opportunities
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
