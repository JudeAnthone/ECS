import { Microscope, TrendingUp, FileSearch, Lightbulb } from "lucide-react";

const approaches = [
	{
		icon: Microscope,
		title: "Community Needs Assessment",
		description:
			"Conducting research to identify and understand the real needs, challenges, and priorities of partner communities.",
	},
	{
		icon: FileSearch,
		title: "Evidence-Based Interventions",
		description:
			"Designing and implementing programs grounded in academic research and proven methodologies for sustainable impact.",
	},
	{
		icon: Lightbulb,
		title: "Innovation & Pilot Testing",
		description:
			"Developing and testing innovative solutions to local problems before scaling up successful interventions.",
	},
	{
		icon: TrendingUp,
		title: "Impact Evaluation & Monitoring",
		description:
			"Measuring program outcomes, tracking progress, and using data to continuously improve service delivery.",
	},
];

export default function ResearchBasedSolutionsPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
						Programs
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
						Research-Based Solutions
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
						The Research-Based Solutions program applies academic research and
						evidence-based methodologies to address real community needs. We bridge the
						gap between knowledge creation and practical application by translating
						research findings into actionable community interventions and development
						strategies.
					</p>
				</div>

				{/* Our Approach */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
						Our Approach
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{approaches.map((item) => (
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

				{/* Focus Areas */}
				<div className="max-w-3xl mb-12">
					<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3">
						<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
						Focus Areas
					</h2>
					<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed">
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Urban poverty and informal settlements
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Environmental sustainability and climate adaptation
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Public health and disease prevention
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Education access and quality improvement
						</li>
						<li className="flex items-start gap-3">
							<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
							Local economic development and entrepreneurship
						</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
