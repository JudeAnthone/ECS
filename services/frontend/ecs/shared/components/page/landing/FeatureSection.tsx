import {
	ArrowRight,
	GraduationCap,
	FolderSearch2,
	UserSearch,
	HandFist,
	Heart,
	Earth,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const services = [
	{
		icon: GraduationCap,
		title: "Education & Training",
		description:
			"Capacity-building workshops, seminars, and short courses designed to equip communities with practical skills and knowledge for empowerment.",
		image: "/education-training.jpg",
		href: "/programs/education-training",
	},
	{
		icon: FolderSearch2,
		title: "Research-Based Solutions",
		description:
			"Applying academic research to address real community needs, providing evidence-based strategies for local development challenges.",
		image: "/research-based.jpg",
		href: "/programs/research-based-solutions",
	},
	{
		icon: UserSearch,
		title: "Community Outreach",
		description:
			"Engagement activities aimed at supporting communities through collaborative action, building partnerships with local organizations.",
		image: "/outreach.jpg",
		href: "/programs/community-outreach",
	},
	{
		icon: HandFist,
		title: "Volunteer & Service-Learning",
		description:
			"Engaging students and faculty in community service and experiential learning to develop social responsibility and civic awareness.",
		image: "/volunteering.jpg",
		href: "/programs/volunteer-service-learning",
	},
	{
		icon: Heart,
		title: "Health, Wellness & Social Services",
		description:
			"Programs that support physical, mental, and social well-being in underserved communities through outreach and education.",
		image: "/social-services.png",
		href: "/programs/health-wellness-social-services",
	},
	{
		icon: Earth,
		title: "Environmental & Sustainability",
		description:
			"Projects that promote environmental protection, sustainability, and climate awareness through community-based initiatives.",
		image: "/environmental.jpg",
		href: "/programs/environmental-sustainability-initiatives",
	},
];

export default function FeatureSection() {
	return (
		<section className="w-full bg-white py-16 sm:py-20">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-12">
					<span className="text-[#BA0021] text-sm font-bold uppercase tracking-wider">
						What We Do
					</span>
					<h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
						Core Services & Program Areas
					</h2>
					<p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
						Empowering communities through six core program areas that address diverse
						needs — from education and health to environmental sustainability.
					</p>
				</div>

				{/* Services Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service) => (
						<Link
							key={service.title}
							href={service.href}
							className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white block"
						>
							{/* Background Image */}
							<div className="relative h-48 w-full overflow-hidden">
								<Image
									src={service.image}
									alt={service.title}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-500"
								/>
								{/* Dark gradient overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

								{/* Icon Badge on image */}
								<div className="absolute top-4 left-4 w-11 h-11 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
									<service.icon className="h-5 w-5 text-[#BA0021]" />
								</div>
							</div>

							{/* Card Content */}
							<div className="p-5">
								<h3 className="text-base font-bold text-[#1a1a1a] group-hover:text-[#BA0021] transition-colors duration-200">
									{service.title}
								</h3>
								<p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
									{service.description}
								</p>
								<div className="mt-4 inline-flex items-center text-sm font-semibold text-[#BA0021] gap-1 group-hover:gap-2 transition-all duration-200">
									Learn More <ArrowRight className="h-4 w-4" />
								</div>
							</div>

							{/* Bottom red accent bar */}
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BA0021] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
