import { Button } from "@/shared/components/ui/Button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/shared/components/ui/NavigationMenu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/Sheet";
import Logo from "@/shared/components/ui/Logo";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CircleChevronRight, Menu } from "lucide-react";

import Link from "next/link";

import { AboutUs, Programs, } from "@/shared/configs/index";

const Navbar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 w-full h-16 bg-background border-b z-50">
      <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo title="Earist" className="cursor-default" />
        </div>

        
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button variant="ghost" asChild>
                  <Link href="/" className="text-lg">Home</Link>
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="cursor-pointer">About us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4 md:w-[500px] lg:w-[600px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {AboutUs.map((about) => (
                        <Link
                          key={about.title}
                          href={`/${about.href}`}
                          className="block text-lg select-none space-y-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <about.icon className="mb-2 size-6" />
                          <div className="text-sm font-semibold leading-none">
                            {about.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {about.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="cursor-pointer">Programs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4 md:w-[500px] lg:w-[600px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {Programs.map((program) => (
                        <Link
                          key={program.title}
                          href={`/${program.href}`}
                          className="block select-none space-y-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <program.icon className="mb-2 size-6" />
                          <div className="text-sm font-semibold leading-none">
                            {program.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {program.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

             <NavigationMenuItem>
                <Button variant="ghost" asChild>
                  <Link href="/Blog" className="text-lg">Blog</Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-3">
          <Button className="cursor-pointer" asChild>
            <Link href="/login">
            Sign in <CircleChevronRight />
            </Link>
          </Button>

          
          <div className="md:hidden">
            <NavigationSheet />
          </div>
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