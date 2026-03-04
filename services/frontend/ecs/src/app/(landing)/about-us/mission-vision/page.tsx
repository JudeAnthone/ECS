export default function MissionVisionPage() {
	return (
		<main className="min-h-screen bg-white font-sans">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1 font-sans">
						About Us
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
						Mission &amp; Vision
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="max-w-3xl">
					{/* Mission */}
					<section className="mb-12">
						<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3 font-sans">
							<span className="w-1.5 h-8 bg-[#BA0021] rounded-full inline-block" />
							Our Mission
						</h2>
						<p className="text-gray-600 text-base sm:text-lg leading-relaxed font-sans">
							The EARIST Extension Services Office is committed to empowering
							communities through relevant and responsive extension programs that
							promote education, livelihood, health, environmental sustainability, and
							social development. We aim to bridge the gap between the university and
							the community by translating academic expertise into meaningful service
							for the betterment of society.
						</p>
					</section>

					{/* Vision */}
					<section className="mb-12">
						<h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-3 font-sans">
							<span className="w-1.5 h-8 bg-[#FFD700] rounded-full inline-block" />
							Our Vision
						</h2>
						<p className="text-gray-600 text-base sm:text-lg leading-relaxed font-sans">
							To be a leading institution in community extension services, recognized
							for its innovative and sustainable programs that uplift the quality of
							life in partner communities, foster social responsibility among students
							and faculty, and contribute to national development through impactful
							outreach and engagement.
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
