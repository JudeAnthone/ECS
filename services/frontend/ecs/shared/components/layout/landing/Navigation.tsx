"use client";
import { Button } from "@/shared/components/ui/Button";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const LoginModal = dynamic(() => import("@/shared/components/ui/LoginModal"), { ssr: false });
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/Sheet";
import Logo from "@/shared/components/ui/Logo";
import Image from "next/image";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CircleChevronRight, Menu } from "lucide-react";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/shared/components/ui/NavigationMenu";

import { AboutUs, Programs, } from "@/shared/configs/index";

import { AuthService } from "@/shared/lib/auth-service";
import { LandingUserMenu } from "@/shared/components/layout/landing/LandingUserMenu";

const Navbar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navRef = React.useRef<HTMLElement>(null);
  useEffect(() => {
    setUser(AuthService.getUser());
    const nav = navRef.current;
    if (!nav) return;
    const syncPadding = () => {
      (nav as HTMLElement).style.paddingRight = document.body.style.paddingRight || '';
    };
    const observer = new MutationObserver(syncPadding);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    syncPadding();
    return () => {
      observer.disconnect();
      (nav as HTMLElement).style.paddingRight = '';
    };
  }, []);
  return (
    <nav
      ref={navRef}
      className="fixed top-0 inset-x-0 w-full h-16 text-white z-50 shadow-lg border-b border-[#e5e7eb] bg-[#BA0021]/95 backdrop-blur-md transition-all duration-300"
      style={{ backgroundColor: 'rgba(186,0,33,0.95)' }}
    >
      <div className="h-full relative flex items-center max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left: Logo and Title */}
        <div className="absolute left-0 top-0 h-full flex items-center gap-2 min-w-[180px] pl-2">
          <Image
            src="/earist-logo.png"
            alt="EARIST Logo"
            width={36}
            height={36}
            className="rounded-full bg-white p-1 shadow-md border border-white"
            priority
          />
          <span className="text-2xl font-extrabold tracking-tight select-none drop-shadow-sm">EARIST</span>
        </div>

        <div className="flex-1 flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-8">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-lg font-semibold text-white bg-transparent hover:underline hover:underline-offset-8 focus:underline focus:underline-offset-8 rounded transition-all duration-200">About Us</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white text-[#BA0021] rounded shadow-lg mt-2 p-4 min-w-[250px]">
                  <div className="grid gap-2 min-w-[340px]">
                    {AboutUs.map((about) => (
                      <Link
                        key={about.title}
                        href={`/${about.href}`}
                        className="block px-2 py-1 rounded transition-colors font-semibold text-[#BA0021] hover:bg-[#BA0021] hover:text-white focus:bg-[#BA0021] focus:text-white group"
                      >
                        <span className="font-semibold group-hover:text-white group-focus:text-white">{about.title}</span>
                        <div className="text-xs opacity-80 text-[#BA0021] group-hover:text-white group-focus:text-white">
                          {about.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-lg font-semibold text-white bg-transparent hover:underline hover:underline-offset-8 focus:underline focus:underline-offset-8 rounded transition-all duration-200">Programs</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white text-[#BA0021] rounded shadow-lg mt-2 p-4 min-w-[250px]">
                  <div className="grid gap-2 min-w-[340px]">
                    {Programs.map((program) => (
                      <Link
                        key={program.title}
                        href={`/${program.href}`}
                        className="block px-2 py-1 rounded transition-colors font-semibold text-[#BA0021] hover:bg-[#BA0021] hover:text-white focus:bg-[#BA0021] focus:text-white group"
                      >
                        <span className="font-semibold group-hover:text-white group-focus:text-white">{program.title}</span>
                        <div className="text-xs opacity-80 text-[#BA0021] group-hover:text-white group-focus:text-white">
                          {program.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </div>

        <div className="absolute right-0 top-0 h-full flex items-center gap-2 min-w-[180px] pr-2 justify-end">
          {user ? (
            <LandingUserMenu user={{
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              avatar: user.avatar_url || "",
              role: user.role
            }} />
          ) : (
            <>
              <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
              <Button
                className="bg-white text-[#BA0021] font-semibold hover:bg-gray-100"
                onClick={() => setLoginOpen(true)}
              >
                Login
              </Button>
              <Button className="bg-[#BA0021] border border-white font-semibold hover:bg-white hover:text-[#BA0021]" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

export const NavigationSheet = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-6 py-3 overflow-auto">
        <Logo title="Earist" />

        <div className="mt-8 text-base space-y-4 scroll-smooth">
          <Link href="/" className="inline-block">
            Home
          </Link>

          <div>
            <div className="font-bold">About</div>
            <ul className="mt-2 space-y-3 ml-1 pl-4 border-l">
              {AboutUs.map((about) => (
                <li key={about.title}>
                  <Link href={`/${about.href}`} className="flex items-center gap-2">
                    <about.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                    {about.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold">Programs</div>
            <ul className="mt-2 space-y-3 ml-1 pl-4 border-l">
              {Programs.map((program) => (
                <li key={program.title}>
                  <Link href={`/${program.href}`} className="flex items-center gap-2">
                    <program.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                    {program.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/Blog" className="inline-block">
            Blog
          </Link>
          
        </div>
      </SheetContent>
    </Sheet>
  );
};