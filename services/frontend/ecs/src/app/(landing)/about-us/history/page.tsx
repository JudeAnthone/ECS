const milestones = [
	{
		year: "2018",
		title: "Establishment of the Extension Services Office",
		description:
			"The EARIST Extension Services Office was formally established to centralize and coordinate all community outreach programs across the institution.",
	},
	{
		year: "2019",
		title: "First Community Partnership Programs",
		description:
			"Launched initial education and training programs in partnership with local barangays in Manila, reaching over 500 community members.",
	},
	{
		year: "2020",
		title: "Adaptation During the Pandemic",
		description:
			"Transitioned extension services to virtual and hybrid formats, ensuring continued community support during the COVID-19 pandemic.",
	},
	{
		year: "2021",
		title: "Expansion to Health & Wellness Programs",
		description:
			"Introduced health, wellness, and social services programs in response to growing community needs for mental health and medical outreach.",
	},
	{
		year: "2022",
		title: "Environmental Sustainability Initiatives",
		description:
			"Launched environmental and sustainability programs including urban gardening, waste management, and climate awareness campaigns.",
	},
	{
		year: "2023",
		title: "Research-Based Community Solutions",
		description:
			"Integrated academic research into extension services, piloting evidence-based interventions for local development challenges.",
	},
	{
		year: "2024",
		title: "Digital Transformation & System Development",
		description:
			"Began development of the Extension Services digital platform to streamline project management, reporting, and community engagement tracking.",
	},
];

export default function HistoryPage() {
	return (
		<main className="min-h-screen bg-white font-sans">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1 font-sans">
						About Us
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
						History
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mb-12 font-sans">
					A look back at the milestones and achievements that shaped EARIST Extension
					Services into what it is today — from its establishment in 2018 to the present.
				</p>

				{/* Timeline */}
				<div className="max-w-3xl">
					<div className="relative border-l-2 border-[#BA0021]/20 pl-8 space-y-10">
						{milestones.map((milestone) => (
							<div key={milestone.year} className="relative">
								{/* Timeline Dot */}
								<div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#BA0021] border-4 border-white shadow-sm" />

								{/* Year Badge */}
								<span className="inline-block bg-[#BA0021]/10 text-[#BA0021] text-sm font-bold px-3 py-1 rounded mb-2 font-sans">
									{milestone.year}
								</span>

								<h3 className="text-xl font-bold text-[#1a1a1a] mt-1 font-sans">
									{milestone.title}
								</h3>
								<p className="text-gray-600 text-base leading-relaxed mt-2 font-sans">
									{milestone.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
