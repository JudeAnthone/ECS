import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Separator } from "@/shared/components/ui/Separator";
import Image from "next/image";
import Link from "next/link";
import { footerSections } from "@/shared/configs/index";

const Footer = () => {
	return (
		<div className="flex flex-col bg-[#1a1a1a] text-white">
			<footer>
				<div className="max-w-screen-xl mx-auto">
					<div className="py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-8 gap-y-10 px-6 xl:px-0">
						{/* Brand */}
						<div className="col-span-full xl:col-span-2">
							<div className="flex items-center gap-2 mb-4">
								<Image
									src="/earist-logo.png"
									alt="EARIST Logo"
									width={36}
									height={36}
									className="rounded-full bg-white p-0.5"
								/>
								<span className="text-lg font-extrabold tracking-tight">
									EARIST
								</span>
							</div>
							<p className="text-white/70 text-sm leading-relaxed">
								Eulogio Amang Rodriguez Institute of Science and Technology —
								Extension Services Office. Empowering communities through education,
								collaboration, and outreach.
							</p>
						</div>

						{/* Footer Sections */}
						{footerSections.map(({ title, links }) => (
							<div key={title}>
								<h6 className="font-semibold text-white text-sm uppercase tracking-wider">
									{title}
								</h6>
								<ul className="mt-4 space-y-3">
									{links.map(({ title, href }) => (
										<li key={title}>
											<Link
												href={href}
												className="text-white/60 hover:text-white text-sm transition-colors"
											>
												{title}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}

						{/* Newsletter */}
						<div className="col-span-2">
							<h6 className="font-semibold text-white text-sm uppercase tracking-wider">
								Stay up to date
							</h6>
							<p className="mt-2 text-white/60 text-sm">
								Get the latest news and updates from EARIST Extension Services.
							</p>
							<form className="mt-4 flex items-center gap-2">
								<Input
									type="email"
									placeholder="Enter your email"
									className="grow max-w-64 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#BA0021]"
								/>
								<Button className="bg-[#BA0021] hover:bg-[#8B0000] text-white font-semibold">
									Subscribe
								</Button>
							</form>
						</div>
					</div>

					<Separator className="bg-white/10" />

					<div className="py-8 flex items-center justify-center gap-x-2 gap-y-5 px-6 xl:px-0">
						<span className="text-white/50 text-sm">
							&copy; {new Date().getFullYear()}{" "}
							<Link href="/" className="hover:text-white transition-colors">
								EARIST Extension Services
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
