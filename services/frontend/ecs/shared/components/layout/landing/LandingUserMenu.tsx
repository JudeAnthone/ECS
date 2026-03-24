import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/Avatar";
import { LogOut, Settings, ChevronsUpDown, X, Bell } from "lucide-react";
import LogoutModal from "@/shared/components/ui/LogoutModal";
import { AuthService } from "@/shared/lib/auth-service";
import { useRouter } from "next/navigation";

export function LandingUserMenu({
	user,
}: {
	user: { name: string; email: string; avatar: string; role?: string };
}) {
	const [open, setOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [showLogout, setShowLogout] = useState(false);
	const router = useRouter();
	const btnRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close on click outside
	useEffect(() => {
		if (!open && !notifOpen) return;
		const handleClick = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				btnRef.current &&
				!btnRef.current.contains(e.target as Node)
			) {
				setOpen(false);
				setNotifOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open, notifOpen]);

	const handleLogout = () => setShowLogout(true);
	const confirmLogout = () => {
		AuthService.logout();
	};

		return (
			<div className="w-full flex items-center gap-4 bg-[#CC2E28] px-4 py-2 rounded-lg shadow" style={{ color: '#fff' }}>
				{/* Notification Bell */}
				<button
					className="flex items-center justify-center w-10 h-10 rounded-full bg-[#BA0021] focus:outline-none"
					aria-label="Notifications"
					onClick={() => {
						setNotifOpen((v) => !v);
						setOpen(false);
					}}
					type="button"
				>
					<Bell className="w-6 h-6 text-white" />
				</button>
				{/* User Info */}
				<div className="flex flex-col flex-1 min-w-0">
					<span className="text-white font-semibold text-base leading-tight truncate">
						{user.name}
					</span>
					<span className="text-white/90 text-xs leading-tight truncate">
						{user.role?.replace("_", " ").toUpperCase()}
					</span>
				</div>
				{/* Avatar/Profile Button */}
				<div className="relative">
					<button
						ref={btnRef}
						className="flex items-center justify-center w-12 h-12 rounded-full bg-white focus:outline-none border-4 border-[#BA0021]"
						onClick={() => setOpen((v) => !v)}
						aria-label="Open profile menu"
						type="button"
					>
						{user.avatar ? (
							<img
								src={user.avatar}
								alt="Profile"
								className="h-10 w-10 rounded-full object-cover"
							/>
						) : (
							<div className="h-10 w-10 rounded-full bg-[#BA0021] text-white font-bold flex items-center justify-center text-lg">
								{user.name
									?.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</div>
						)}
					</button>
					{open && (
						<div
							ref={menuRef}
							className="absolute z-50 mt-2 right-0 min-w-[260px] max-w-[90vw] rounded-xl shadow-2xl border border-[#CC2E28] bg-white animate-fade-in"
							style={{ boxShadow: "0 8px 32px 0 rgba(204,46,40,0.18)" }}
						>
							<div className="flex items-center gap-3 px-4 py-3 text-left text-sm bg-[#CC2E28]/10 rounded-t-xl relative">
								{user.avatar ? (
									<img
										src={user.avatar}
										alt="Profile"
										className="h-9 w-9 rounded-full object-cover border-2 border-[#CC2E28]"
									/>
								) : (
									<div className="h-9 w-9 rounded-full bg-[#CC2E28] text-white font-bold flex items-center justify-center border-2 border-[#CC2E28]">
										{user.name
											?.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</div>
								)}
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold text-[#CC2E28]">
										{user.name}
									</span>
									<span className="truncate text-xs text-slate-500">
										{user.email}
									</span>
								</div>
								<button
									onClick={() => setOpen(false)}
									className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200"
									aria-label="Close profile dropdown"
								>
									<X className="w-4 h-4 text-slate-500" />
								</button>
							</div>
							<div className="py-1">
								<button
									onClick={() => {
										setOpen(false);
										router.push(`/${user.role}/settings`);
									}}
									className="w-full flex items-center px-4 py-2 font-medium text-left text-[#CC2E28] hover:bg-[#CC2E28]/10"
								>
									<Settings className="mr-2 text-[#CC2E28]" />
									Settings
								</button>
								<hr className="my-1 border-slate-100" />
								<button
									onClick={() => {
										setOpen(false);
										handleLogout();
									}}
									className="w-full flex items-center px-4 py-2 text-red-600 font-medium hover:bg-red-50 text-left"
								>
									<LogOut className="mr-2" />
									Log out
								</button>
							</div>
						</div>
					)}
				</div>
				{/* Notifications Dropdown */}
				{notifOpen && (
					<div
						className="absolute z-50 mt-2 left-0 min-w-[300px] max-w-[90vw] rounded-xl shadow-2xl border border-[#CC2E28] bg-white animate-fade-in"
						style={{ top: "60px" }}
					>
						<div className="flex items-center justify-between px-4 py-3 border-b border-[#CC2E28] rounded-t-xl">
							<span className="font-bold text-[#CC2E28] text-lg">Notifications</span>
							<button
								onClick={() => setNotifOpen(false)}
								className="p-1 rounded hover:bg-slate-200"
								aria-label="Close notifications"
							>
								<X className="w-4 h-4 text-slate-500" />
							</button>
						</div>
						<div className="px-4 py-4 text-slate-700 text-sm">TO BE DEVELOPED</div>
					</div>
				)}
				<LogoutModal open={showLogout} onOpenChange={setShowLogout} onConfirm={confirmLogout} />
			</div>
		);
}
