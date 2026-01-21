

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-3xl">
        <Badge
          variant="secondary"
          className="rounded-full py-1 border-border"
          asChild
        >
          <Link href="organizational-team">
             Upcoming Events<ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Badge>
        <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl md:leading-[1.2] font-semibold tracking-tighter">
          Welcome to <br/><span className="bg-primary text-amber-200 leading-15 px-3">Earist Extension Service</span>
        </h1>
        <p className="mt-6 text-sm md:text-lg text-foreground/80">
          We&apos;re dedicated to empowering communities through education, collaboration, and outreach programs. Join us in making a positive impact and expanding opportunities for growth and development!
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base shadow-none cursor-pointer border-primary"
          >
            <CirclePlay className="size-5" /> Watch Demo
          </Button>
        </div>
      </div>
    </div>
  );
}

