import { User } from "lucide-react";

const teamMembers = [
	{
		name: "Dr. Maria Santos",
		role: "Director, Extension Services Office",
		department: "Office of the Vice President for Extension",
	},
	{
		name: "Prof. Juan Dela Cruz",
		role: "Program Chair, Education & Training",
		department: "College of Education",
	},
	{
		name: "Prof. Ana Reyes",
		role: "Program Chair, Community Outreach",
		department: "College of Arts and Sciences",
	},
	{
		name: "Prof. Carlos Garcia",
		role: "Program Chair, Research-Based Solutions",
		department: "College of Engineering",
	},
	{
		name: "Prof. Elena Bautista",
		role: "Program Chair, Health & Wellness",
		department: "College of Industrial Technology",
	},
	{
		name: "Prof. Roberto Mendoza",
		role: "Program Chair, Environmental Sustainability",
		department: "College of Business Administration",
	},
];

export default function OrganizationalTeamPage() {
	return (
		<main className="min-h-screen bg-white font-sans">
			{/* Page Header Banner */}
			<div className="w-full bg-[#BA0021] py-12">
				<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1 font-sans">
						About Us
					</p>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
						Organizational Team
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mb-10 font-sans">
					Meet the dedicated team behind EARIST Extension Services. Our team is composed
					of experienced faculty and staff committed to delivering impactful community
					programs.
				</p>

				{/* Team Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{teamMembers.map((member) => (
						<div
							key={member.name}
							className="border border-gray-200 rounded-lg p-6 hover:border-[#BA0021]/30 hover:shadow-md transition-all duration-200"
						>
							{/* Avatar Placeholder */}
							<div className="w-16 h-16 rounded-full bg-[#BA0021]/10 flex items-center justify-center mb-4">
								<User className="h-8 w-8 text-[#BA0021]" />
							</div>
							<h3 className="text-lg font-bold text-[#1a1a1a] font-sans">
								{member.name}
							</h3>
							<p className="text-sm font-medium text-[#BA0021] mt-1 font-sans">
								{member.role}
							</p>
							<p className="text-sm text-gray-500 mt-1 font-sans">
								{member.department}
							</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
