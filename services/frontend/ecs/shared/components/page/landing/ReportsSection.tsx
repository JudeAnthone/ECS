// new
import { FileText, Download, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import Image from "next/image";

const reports = [
	{
		id: 1,
		title: "Annual Extension Service Report 2024",
		description:
			"Comprehensive summary of all extension activities, projects completed, beneficiaries served, and outcomes for the year 2024.",
		year: "2024",
		fileSize: "2.4 MB",
		type: "PDF",
	},
	{
		id: 2,
		title: "Annual Extension Service Report 2023",
		description:
			"Full report of extension service operations, community engagements, and project outcomes for 2023.",
		year: "2023",
		fileSize: "3.1 MB",
		type: "PDF",
	},
	{
		id: 3,
		title: "Annual Extension Service Report 2022",
		description:
			"Detailed documentation of community outreach activities, research projects, and program evaluations for 2022.",
		year: "2022",
		fileSize: "2.8 MB",
		type: "PDF",
	},
	{
		id: 4,
		title: "Annual Extension Service Report 2021",
		description:
			"Summary report covering extension services during the pandemic period, including virtual and hybrid programs.",
		year: "2021",
		fileSize: "1.9 MB",
		type: "PDF",
	},
	{
		id: 5,
		title: "Extension Service Impact Assessment 2018–2020",
		description:
			"A comprehensive impact assessment covering the first three years of formalized extension service operations at EARIST.",
		year: "2020",
		fileSize: "4.2 MB",
		type: "PDF",
	},
];

export default function ReportsSection() {
	return (
		<section id="reports" className="w-full bg-[#F8F5F5] py-16 sm:py-20">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Two-column layout: Left = Hero Banner, Right = Reports List */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
					{/* LEFT — Hero Banner with statue background */}
					<div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[420px] lg:min-h-full shadow-lg">
						{/* Statue Background Image */}
						<Image
							src="/earist-statue.JPG"
							alt="EARIST Statue"
							fill
							className="object-cover object-top"
						/>

						{/* Dark gradient overlay — stronger at bottom */}
						<div className="absolute inset-0 bg-gradient-to-t from-[#1a0005]/95 via-[#1a0005]/50 to-[#1a0005]/20" />

						{/* Content on top of image */}
						<div className="relative z-10 h-full flex flex-col justify-end p-7 sm:p-8">
							<span className="text-[#f4a0af] text-xs font-bold uppercase tracking-widest mb-3">
								Documents & Downloads
							</span>
							<h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
								Downloadable
								<br />
								<span className="text-[#f4a0af]">Reports</span>
							</h2>
							<p className="mt-3 text-sm text-gray-300 leading-relaxed">
								Access and download official extension service reports, impact
								assessments, and annual documentation compiled by EARIST.
							</p>

							{/* Divider */}
							<div className="mt-6 h-px w-full bg-white/20" />

							{/* Stats Row */}
							<div className="mt-5 flex gap-6">
								<div>
									<p className="text-2xl font-extrabold text-white">5+</p>
									<p className="text-xs text-gray-400 mt-0.5">Annual Reports</p>
								</div>
								<div>
									<p className="text-2xl font-extrabold text-white">2018</p>
									<p className="text-xs text-gray-400 mt-0.5">Since</p>
								</div>
								<div>
									<p className="text-2xl font-extrabold text-white">100%</p>
									<p className="text-xs text-gray-400 mt-0.5">Free Access</p>
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT — Reports List */}
					<div className="lg:col-span-3 flex flex-col gap-3 justify-center">
						{reports.map((report) => (
							<div
								key={report.id}
								className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex items-center gap-4 hover:border-[#BA0021]/40 hover:shadow-md transition-all duration-200 group"
							>
								{/* Year Badge + Icon */}
								<div className="flex flex-col items-center gap-1 shrink-0">
									<div className="w-12 h-12 rounded-xl bg-[#BA0021]/10 flex items-center justify-center">
										<FileText className="h-6 w-6 text-[#BA0021]" />
									</div>
									<span className="text-[10px] font-bold text-[#BA0021] tracking-wide">
										{report.year}
									</span>
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#BA0021] transition-colors line-clamp-1">
										{report.title}
									</h3>
									<p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
										{report.description}
									</p>
									<div className="flex items-center gap-2 mt-2">
										<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
											{report.type}
										</span>
										<span className="text-[10px] text-gray-400">
											{report.fileSize}
										</span>
									</div>
								</div>

								{/* Download Button */}
								<Button
									variant="outline"
									size="sm"
									className="border-[#BA0021] text-[#BA0021] hover:bg-[#BA0021] hover:text-white font-semibold shrink-0 transition-all duration-200"
								>
									<Download className="h-4 w-4 mr-1" />
									<span className="hidden sm:inline">Download</span>
								</Button>
							</div>
						))}

						{/* View All Reports Link */}
						<div className="mt-2 flex justify-end">
							<button className="inline-flex items-center gap-1 text-sm font-semibold text-[#BA0021] hover:underline">
								View All Reports <ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
