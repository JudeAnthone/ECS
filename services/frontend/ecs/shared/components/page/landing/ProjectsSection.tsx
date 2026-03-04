"use client";

import { useState } from "react";
import { Search, MapPin, Users, Filter, ChevronRight, ChevronLeft, FolderOpen } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Badge } from "@/shared/components/ui/Badge";
import Link from "next/link";

const categories = [
	"All",
	"Education & Training",
	"Research-Based Solutions",
	"Community Outreach",
	"Volunteer & Service-Learning",
	"Health, Wellness & Social Services",
	"Environmental & Sustainability",
];

const years = ["All", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

const PROJECTS_PER_PAGE = 6;

const categoryColors: Record<string, string> = {
	"Education & Training": "bg-blue-50 text-blue-700 border-blue-200",
	"Research-Based Solutions": "bg-purple-50 text-purple-700 border-purple-200",
	"Community Outreach": "bg-teal-50 text-teal-700 border-teal-200",
	"Volunteer & Service-Learning": "bg-yellow-50 text-yellow-700 border-yellow-200",
	"Health, Wellness & Social Services": "bg-green-50 text-green-700 border-green-200",
	"Environmental & Sustainability": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const categoryAccents: Record<string, string> = {
	"Education & Training": "bg-blue-500",
	"Research-Based Solutions": "bg-purple-500",
	"Community Outreach": "bg-teal-500",
	"Volunteer & Service-Learning": "bg-yellow-500",
	"Health, Wellness & Social Services": "bg-green-500",
	"Environmental & Sustainability": "bg-emerald-500",
};

const projects = [
	{
		id: 1,
		title: "Digital Literacy Training for Senior Citizens",
		year: "2024",
		category: "Education & Training",
		location: "Barangay Commonwealth, Quezon City",
		beneficiaries: 150,
		status: "Approved",
		description:
			"A comprehensive digital literacy program designed to teach senior citizens basic computer skills, internet safety, and social media usage.",
	},
	{
		id: 2,
		title: "Urban Community Garden Initiative",
		year: "2024",
		category: "Environmental & Sustainability",
		location: "Sampaloc, Manila",
		beneficiaries: 300,
		status: "Approved",
		description:
			"An environmental sustainability project promoting urban farming and food security in densely populated areas through community gardens.",
	},
	{
		id: 3,
		title: "Free Medical & Dental Mission",
		year: "2023",
		category: "Health, Wellness & Social Services",
		location: "Tondo, Manila",
		beneficiaries: 500,
		status: "Approved",
		description:
			"A health outreach program providing free medical check-ups, dental services, and health education to underserved communities.",
	},
	{
		id: 4,
		title: "Youth Leadership and Civic Engagement Workshop",
		year: "2023",
		category: "Community Outreach",
		location: "Santa Mesa, Manila",
		beneficiaries: 200,
		status: "Approved",
		description:
			"A workshop series aimed at empowering young leaders through civic education, public speaking, and community organizing training.",
	},
	{
		id: 5,
		title: "Livelihood Skills Training for Women",
		year: "2022",
		category: "Volunteer & Service-Learning",
		location: "San Miguel, Manila",
		beneficiaries: 120,
		status: "Approved",
		description:
			"A livelihood program providing women with skills in sewing, food processing, and small business management.",
	},
	{
		id: 6,
		title: "Water Quality Research in Manila Bay Area",
		year: "2022",
		category: "Research-Based Solutions",
		location: "Manila Bay Coastal Communities",
		beneficiaries: 1000,
		status: "Approved",
		description:
			"A research-driven project assessing water quality in Manila Bay coastal communities and proposing evidence-based intervention strategies.",
	},
	{
		id: 7,
		title: "Disaster Preparedness Training Program",
		year: "2021",
		category: "Community Outreach",
		location: "Various Barangays, Manila",
		beneficiaries: 800,
		status: "Approved",
		description:
			"Training community members in disaster preparedness, first aid, and evacuation procedures to build resilient communities.",
	},
	{
		id: 8,
		title: "After-School Tutoring & Mentorship Program",
		year: "2020",
		category: "Education & Training",
		location: "Quiapo, Manila",
		beneficiaries: 250,
		status: "Approved",
		description:
			"A volunteer-driven tutoring program providing academic support and mentorship to elementary and high school students in underserved areas.",
	},
	{
		id: 9,
		title: "Mental Health Awareness Campaign",
		year: "2019",
		category: "Health, Wellness & Social Services",
		location: "EARIST Main Campus & Partner Communities",
		beneficiaries: 600,
		status: "Approved",
		description:
			"A mental health awareness initiative providing free counseling sessions, stress management workshops, and mental health education.",
	},
	{
		id: 10,
		title: "Coastal Clean-Up and Marine Conservation Drive",
		year: "2024",
		category: "Environmental & Sustainability",
		location: "Manila Bay, Pasay City",
		beneficiaries: 450,
		status: "Approved",
		description:
			"A large-scale coastal clean-up operation combined with marine conservation education for local fishermen, students, and community volunteers.",
	},
	{
		id: 11,
		title: "Basic First Aid & Emergency Response Training",
		year: "2023",
		category: "Health, Wellness & Social Services",
		location: "Brgy. 649, Manila",
		beneficiaries: 180,
		status: "Approved",
		description:
			"Equipping community members and barangay health workers with essential first aid skills, CPR certification, and emergency response protocols.",
	},
	{
		id: 12,
		title: "Entrepreneurship Bootcamp for Out-of-School Youth",
		year: "2022",
		category: "Education & Training",
		location: "Sta. Cruz, Manila",
		beneficiaries: 90,
		status: "Approved",
		description:
			"An intensive entrepreneurship bootcamp teaching business planning, financial literacy, marketing, and product development to out-of-school youth.",
	},
	{
		id: 13,
		title: "AI and Data Science Awareness Seminar",
		year: "2024",
		category: "Research-Based Solutions",
		location: "EARIST Main Campus, Manila",
		beneficiaries: 350,
		status: "Approved",
		description:
			"A research-driven seminar introducing AI concepts, data science applications, and their potential impact on local industries and community development.",
	},
	{
		id: 14,
		title: "Feeding Program for Malnourished Children",
		year: "2021",
		category: "Volunteer & Service-Learning",
		location: "Brgy. 105, Tondo, Manila",
		beneficiaries: 220,
		status: "Approved",
		description:
			"A 12-week feeding program targeting malnourished children ages 2–12, providing daily nutritious meals and nutrition education for parents.",
	},
	{
		id: 15,
		title: "Barangay Governance and Public Service Workshop",
		year: "2020",
		category: "Community Outreach",
		location: "District 6, Manila",
		beneficiaries: 160,
		status: "Approved",
		description:
			"A capacity-building workshop for barangay officials and staff covering governance best practices, public service ethics, and community engagement strategies.",
	},
];

export default function ProjectsSection() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedYear, setSelectedYear] = useState("All");
	const [currentPage, setCurrentPage] = useState(1);

	const filteredProjects = projects.filter((project) => {
		const matchesSearch =
			project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
		const matchesYear = selectedYear === "All" || project.year === selectedYear;
		return matchesSearch && matchesCategory && matchesYear;
	});

	const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
	const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
	const displayedProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		setCurrentPage(1);
	};

	const handleYearChange = (year: string) => {
		setSelectedYear(year);
		setCurrentPage(1);
	};

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		setCurrentPage(1);
	};

	const scrollToSection = () => {
		document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const goToPage = (page: number) => {
		setCurrentPage(page);
		scrollToSection();
	};

	return (
		<section id="projects" className="w-full bg-[#F8F5F5] py-16 sm:py-20">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<div className="w-8 h-8 rounded-lg bg-[#BA0021]/10 flex items-center justify-center">
								<FolderOpen className="h-4 w-4 text-[#BA0021]" />
							</div>
							<span className="text-[#BA0021] text-sm font-bold uppercase tracking-wider">
								Project Archive
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
							Approved Extension Projects
						</h2>
						<p className="mt-2 text-gray-500 text-base max-w-xl">
							Browse approved extension projects from 2018 to 2024. Search by keyword,
							filter by category or year.
						</p>
					</div>
					<div className="shrink-0 text-right">
						<p className="text-3xl font-extrabold text-[#BA0021]">{projects.length}</p>
						<p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
							Total Projects
						</p>
					</div>
				</div>

				{/* Search & Filters */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-8">
					{/* Search + Year row */}
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								type="text"
								placeholder="Search by title, location, or description..."
								className="pl-10 h-11 text-sm border-gray-300 focus:border-[#BA0021] focus:ring-[#BA0021] rounded-lg"
								value={searchQuery}
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-400 hidden sm:block shrink-0" />
							<select
								value={selectedYear}
								onChange={(e) => handleYearChange(e.target.value)}
								className="h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:border-[#BA0021] focus:outline-none"
							>
								{years.map((year) => (
									<option key={year} value={year}>
										{year === "All" ? "All Years" : year}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Divider */}
					<div className="my-4 h-px bg-gray-100" />

					{/* Category Pill Filters */}
					<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => handleCategoryChange(category)}
								className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
									selectedCategory === category
										? "bg-[#BA0021] text-white border-[#BA0021] shadow-sm"
										: "bg-white text-gray-600 border-gray-200 hover:border-[#BA0021]/40 hover:text-[#BA0021]"
								}`}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{/* Results Count */}
				<div className="mb-5 flex items-center justify-between">
					<p className="text-sm text-gray-500">
						Showing{" "}
						<span className="font-bold text-[#1a1a1a]">
							{filteredProjects.length === 0 ? 0 : startIndex + 1}–
							{Math.min(startIndex + PROJECTS_PER_PAGE, filteredProjects.length)}
						</span>{" "}
						of{" "}
						<span className="font-bold text-[#1a1a1a]">{filteredProjects.length}</span>{" "}
						projects
					</p>
					{totalPages > 1 && (
						<p className="text-sm text-gray-400">
							Page {currentPage} of {totalPages}
						</p>
					)}
				</div>

				{/* Project Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{displayedProjects.map((project) => (
						<article
							key={project.id}
							className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#BA0021]/20 transition-all duration-200 group flex flex-col"
						>
							{/* Colored top accent bar per category */}
							<div
								className={`h-1 w-full ${categoryAccents[project.category] ?? "bg-[#BA0021]"}`}
							/>

							<div className="p-5 flex flex-col flex-1">
								{/* Category badge + Year */}
								<div className="flex items-center justify-between mb-3">
									<span
										className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[project.category] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
									>
										{project.category}
									</span>
									<span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
										{project.year}
									</span>
								</div>

								{/* Title */}
								<h3 className="text-base font-bold text-[#1a1a1a] leading-snug group-hover:text-[#BA0021] transition-colors line-clamp-2">
									{project.title}
								</h3>

								{/* Description */}
								<p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
									{project.description}
								</p>

								{/* Divider */}
								<div className="my-4 h-px bg-gray-100" />

								{/* Meta: Location + Beneficiaries */}
								<div className="space-y-1.5">
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
										<span className="truncate">{project.location}</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
										<span>
											<span className="font-semibold text-[#1a1a1a]">
												{project.beneficiaries.toLocaleString()}
											</span>{" "}
											beneficiaries reached
										</span>
									</div>
								</div>

								{/* Footer: Status + Link */}
								<div className="mt-4 flex items-center justify-between">
									<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
										<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
										{project.status}
									</span>
									<Link
										href="#"
										className="inline-flex items-center text-xs font-semibold text-[#BA0021] hover:underline gap-0.5"
									>
										View Details <ChevronRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</div>
						</article>
					))}
				</div>

				{/* Empty State */}
				{filteredProjects.length === 0 && (
					<div className="text-center py-20 bg-white rounded-xl border border-gray-200">
						<Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
						<h3 className="text-base font-bold text-gray-600">No projects found</h3>
						<p className="text-sm text-gray-400 mt-1">
							Try adjusting your search or filter criteria.
						</p>
						<button
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("All");
								setSelectedYear("All");
							}}
							className="mt-4 text-xs font-semibold text-[#BA0021] hover:underline"
						>
							Clear all filters
						</button>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-10 flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === 1}
							onClick={() => goToPage(currentPage - 1)}
							className="border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>

						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<button
									key={page}
									onClick={() => goToPage(page)}
									className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
										currentPage === page
											? "bg-[#BA0021] text-white shadow-sm"
											: "text-gray-500 hover:bg-gray-100"
									}`}
								>
									{page}
								</button>
							))}
						</div>

						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === totalPages}
							onClick={() => goToPage(currentPage + 1)}
							className="border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				)}
			</div>
		</section>
	);
}
