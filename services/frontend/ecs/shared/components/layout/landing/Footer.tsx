import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Separator } from "@/shared/components/ui/Separator";

import Link from "next/link";

import { footerSections } from "@/shared/configs/index"

const Footer = () => {
  return (
    <div className="min-h-[30svh] flex flex-col bg-gray-100 text-gray-900">
      <footer className="border-t border-gray-300">
        <div className="max-w-(--breakpoint-xl) mx-auto">
          <div className="py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-8 gap-y-10 px-6 xl:px-0">
            <div className="col-span-full xl:col-span-2">
              
              <p className="font-bold text-lg">Earist Extension Service</p>

              <p className="mt-4 text-gray-700">
                Providing innovative extension services and solutions to empower our community through technology and education.
              </p>
            </div>
            
            {footerSections.map(({ title, links }) => (
              <div key={title}>
                <h6 className="font-medium">{title}</h6>
                <ul className="mt-6 space-y-4">
                  {links.map(({ title, href }) => (
                    <li key={title}>
                      <Link
                        href={`/${href}`}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            
            <div className="col-span-2">
              <h6 className="font-medium">Stay up to date</h6>
              <form className="mt-6 flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="grow max-w-64"
                />
                <Button>Subscribe</Button>
              </form>
            </div>
          </div>
          <Separator />
          <div className="py-8 flex items-center justify-center sm:flex-row gap-x-2 gap-y-5 px-6 xl:px-0">
            {/* Copyright */}
            <span className="text-gray-600">
              &copy; {new Date().getFullYear()}{" "}
              <Link href="/" target="_blank">
                Earist Extension Service
              </Link>
              . All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
