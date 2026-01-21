import { Button } from "@/shared/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    category: "Community Empowerment",
    title: "Building leadership and social development locally.",
    details:
      "EARIST Extension Service focuses on nurturing local leaders and promoting social change through educational programs that engage communities in active participation, fostering a sense of ownership and responsibility.",
    tutorialLink: "#",
  },
  {
    category: "Skills Development",
    title: "Enhancing practical skills through workshops and training.",
    details:
      "We provide a variety of hands-on workshops, training sessions, and seminars designed to equip individuals with valuable skills that are directly applicable to both personal and professional growth.",
    tutorialLink: "#",
  },
  {
    category: "Collaborative Projects",
    title: "Partnering with organizations for impactful initiatives.",
    details:
      "By partnering with local organizations, schools, and government agencies, we create projects that address community needs, ensuring that every initiative is impactful and sustainable.",
    tutorialLink: "#",
  },
  {
    category: "Inclusive Outreach",
    title: "Creating accessible programs for all communities.",
    details:
      "Our programs are designed to be inclusive, offering opportunities for diverse groups, including marginalized communities, ensuring that everyone has access to quality education, resources, and support.",
    tutorialLink: "#",
  },
  {
    category: "Resource Support",
    title: "Offering tools, mentorship, and networking opportunities.",
    details:
      "We provide essential resources, including educational materials, mentorship, and networking events, to help individuals and organizations grow, thrive, and reach their full potential.",
    tutorialLink: "#",
  },
];

export default function FeatureSection () {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-(--breakpoint-lg) w-full py-10 px-6">
        <h2 className="text-4xl md:text-[2.75rem] md:leading-[1.2] font-semibold tracking-[-0.03em] sm:max-w-xl text-pretty sm:mx-auto sm:text-center">
          Core Services
        </h2>
        <p className="mt-2 text-muted-foreground text-lg sm:text-xl sm:text-center">
          Empowering communities through education, skill-building, and collaborative outreach programs for a brighter, sustainable future.
        </p>
        <div className="mt-8 md:mt-16 w-full mx-auto space-y-20">
          {features.map((feature) => (
            <div
              key={feature.category}
              className="flex flex-col md:flex-row items-center gap-x-12 gap-y-6 md:even:flex-row-reverse"
            >
              <div className="w-full aspect-4/3 bg-muted rounded-xl border border-border/50 basis-1/2" />
              <div className="basis-1/2 shrink-0">
                <span className="uppercase font-medium text-sm text-muted-foreground">
                  {feature.category}
                </span>
                <h4 className="my-3 text-3xl font-semibold tracking-[-0.02em]">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.details}</p>
                <Button asChild size="lg" className="mt-6 rounded-full gap-3">
                  <Link href={feature.tutorialLink}>
                    Learn More <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
