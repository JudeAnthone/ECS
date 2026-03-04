export default function OurMandatePage() {
	return (
		<main className="min-h-screen bg-white font-sans">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1 font-sans">
						About Us
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
						Our Mandate
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="max-w-3xl">
					<section className="mb-12">
						<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3 font-sans">
							<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
							Legal Basis
						</h2>
						<p className="text-gray-600 text-base sm:text-lg leading-relaxed font-sans mb-4">
							In accordance with Republic Act No. 8292 (Higher Education Modernization
							Act of 1997) and the Commission on Higher Education (CHED) policies on
							extension services, EARIST is mandated to conduct extension programs
							that address community needs and contribute to national development.
						</p>
					</section>

					<section className="mb-12">
						<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3 font-sans">
							<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
							Scope of Responsibilities
						</h2>
						<ul className="space-y-3 text-gray-600 text-base sm:text-lg leading-relaxed font-sans">
							<li className="flex items-start gap-3">
								<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
								Design, implement, monitor, and evaluate community extension
								programs
							</li>
							<li className="flex items-start gap-3">
								<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
								Forge partnerships with local government units, NGOs, and private
								organizations
							</li>
							<li className="flex items-start gap-3">
								<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
								Mobilize faculty, staff, and students for community service and
								outreach
							</li>
							<li className="flex items-start gap-3">
								<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
								Document and report all extension activities for institutional
								compliance
							</li>
							<li className="flex items-start gap-3">
								<span className="w-2 h-2 bg-[#BA0021] rounded-full mt-2.5 shrink-0" />
								Promote sustainable development and social responsibility through
								outreach
							</li>
						</ul>
					</section>
				</div>
			</div>
		</main>
	);
}
