"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/Sheet";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/shared/components/ui/NavigationMenu";
import { AboutUs, Programs } from "@/shared/configs/index";
import { AuthService } from "@/shared/lib/auth-service";
import { LandingUserMenu } from "@/shared/components/layout/landing/LandingUserMenu";

const Navbar = () => {
	const [user, setUser] = useState<any>(null);
	const navRef = React.useRef<HTMLElement>(null);

	useEffect(() => {
		setUser(AuthService.getUser());
		const handleUserUpdated = () => setUser(AuthService.getUser());
		window.addEventListener("ecs:user-updated", handleUserUpdated);
		const nav = navRef.current;
		if (!nav) return;

		const syncPadding = () => {
			(nav as HTMLElement).style.paddingRight = document.body.style.paddingRight || "";
		};

		const observer = new MutationObserver(syncPadding);
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["style"],
		});

		syncPadding();

		return () => {
			window.removeEventListener("ecs:user-updated", handleUserUpdated);
			observer.disconnect();
			(nav as HTMLElement).style.paddingRight = "";
		};
	}, []);

	return (
		<nav
			ref={navRef}
			className="sticky top-0 inset-x-0 w-full h-20 text-white z-50 shadow-lg border-b border-[#8B0000] bg-[#CC2E28]"
		>
			<div className="h-full relative flex items-center max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Left: Clickable Logo */}
				<Link
					href="/"
					className="absolute left-0 top-0 h-full flex items-center gap-2 min-w-[180px] pl-4 sm:pl-6 lg:pl-8 cursor-pointer hover:opacity-90 transition-opacity"
				>
					<Image
						src="/earist-logo.png"
						alt="EARIST Logo"
						width={60}
						height={60}
						priority
					/>

					<div className="flex flex-col leading-none">
						<span className="text-xl font-extrabold tracking-tight select-none">
							EARIST EXTENSION SERVICES
						</span>
						<span className="text-[10px] font-medium text-white/80 tracking-wide">
							Eulogio "Amang" Rodriguez Institute of Science and Technology
						</span>
					</div>
				</Link>

				{/* Center: Navigation Links */}
				<div className="flex-1 flex justify-center">
					<NavigationMenu>
						<NavigationMenuList className="flex gap-6">
							{/* About Us */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="text-base font-semibold text-white bg-transparent hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-200">
									About Us
								</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white rounded-lg shadow-xl mt-1 p-2 min-w-[280px] border border-gray-100">
									<div className="grid gap-1 min-w-[340px]">
										{AboutUs.map((about) => (
											<Link
												key={about.title}
												href={`/${about.href}`}
												className="block px-3 py-2.5 rounded-md transition-colors text-gray-800 hover:bg-[#BA0021] hover:text-white group"
											>
												<span className="font-semibold text-sm">
													{about.title}
												</span>
												<div className="text-xs mt-0.5 text-gray-500 group-hover:text-white/80">
													{about.description}
												</div>
											</Link>
										))}
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* Programs */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="text-base font-semibold text-white bg-transparent hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-200">
									Programs
								</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-white rounded-lg shadow-xl mt-1 p-2 min-w-[280px] border border-gray-100">
									<div className="grid gap-1 min-w-[340px]">
										{Programs.map((program) => (
											<Link
												key={program.title}
												href={`/${program.href}`}
												className="block px-3 py-2.5 rounded-md transition-colors text-gray-800 hover:bg-[#BA0021] hover:text-white group"
											>
												<span className="font-semibold text-sm">
													{program.title}
												</span>
												<div className="text-xs mt-0.5 text-gray-500 group-hover:text-white/80">
													{program.description}
												</div>
											</Link>
										))}
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* Projects */}
							<NavigationMenuItem>
								<Link
									href="#projects"
									className="text-base font-semibold text-white bg-transparent hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-200 inline-flex items-center"
								>
									Projects
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
						<NavigationMenuViewport />
					</NavigationMenu>
				</div>

				{/* Right: User Menu */}
				<div className="absolute right-0 top-0 h-full flex items-center gap-2 min-w-[180px] pr-4 sm:pr-6 lg:pr-8 justify-end">
					{user && (
						<LandingUserMenu
							user={{
								name: `${user.first_name} ${user.last_name}`,
								email: user.email,
								avatar: AuthService.resolveAvatarUrl(user.avatar_url),
								role: user.role,
							}}
						/>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
