import React, { useState, useRef, useEffect } from "react";
import { LogOut, Settings, X, Bell, ChevronDown } from "lucide-react";
import LogoutModal from "@/shared/components/ui/LogoutModal";
import { AuthService } from "@/shared/lib/auth-service";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/shared/hooks/use-notifications";
import type { NotificationItem } from "@/shared/lib/notification-service";
import { resolveNotificationTarget } from "@/shared/lib/notification-routing";
import ProfileAvatar from "@/shared/components/ui/ProfileAvatar";

export function LandingUserMenu({
	user,
}: {
	user: { name: string; email: string; avatar: string; role?: string };
}) {
	const [open, setOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [showLogout, setShowLogout] = useState(false);
	const [nowTs, setNowTs] = useState(() => Date.now());
	const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications();
	const router = useRouter();
	const btnRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		const interval = window.setInterval(() => setNowTs(Date.now()), 60000);
		return () => window.clearInterval(interval);
	}, []);

	const handleLogout = () => setShowLogout(true);
	const confirmLogout = () => {
		AuthService.logout();
	};

	const handleNotificationClick = async (item: NotificationItem) => {
		if (!item.is_read) {
			await markAsRead(item.id);
		}

		const roleSlug = (user.role || "").replace(/_/g, "-");
		const target = resolveNotificationTarget(roleSlug, item);
		if (target) {
			setNotifOpen(false);
			router.push(target);
		}
	};

	const formatRelativeTime = (isoDate?: string) => {
		if (!isoDate) return "";
		const date = new Date(isoDate).getTime();
		const diffMs = nowTs - date;
		const diffMin = Math.floor(diffMs / 60000);
		if (diffMin < 1) return "just now";
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;
		const diffDay = Math.floor(diffHr / 24);
		return `${diffDay}d ago`;
	};

	return (
		<div className="relative w-full flex items-center gap-4 bg-[#CC2E28] px-4 py-2 rounded-lg shadow" style={{ color: "#fff" }}>
			<button
				className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#BA0021] focus:outline-none"
				aria-label="Notifications"
				onClick={() => {
					const next = !notifOpen;
					setNotifOpen(next);
					setOpen(false);
					if (next) refresh();
				}}
				type="button"
			>
				<Bell className="w-6 h-6 text-white" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			<div className="flex flex-col flex-1 min-w-0">
				<span className="text-white font-semibold text-base leading-tight truncate">{user.name}</span>
				<span className="text-white/90 text-xs leading-tight truncate">{user.role?.replace("_", " ").toUpperCase()}</span>
			</div>

			<div className="relative">
				<button
					ref={btnRef}
				className="flex items-center justify-center w-12 h-12 rounded-full bg-white focus:outline-none border-4 border-[#BA0021] relative overflow-visible"
				onClick={() => {
					setOpen((v) => !v);
					setNotifOpen(false);
				}}
				aria-label="Open profile menu"
				type="button"
			>
				<ProfileAvatar
					imageUrl={user.avatar}
					fullName={user.name}
					alt="Profile"
					className="h-10 w-10"
					textClassName="text-sm"
				/>
				<ChevronDown className="absolute bottom-0 right-0 w-5 h-5 bg-[#BA0021] rounded-full text-white border-2 border-white flex items-center justify-center" style={{transform: 'translate(2px, 2px)'}} />
			</button>

			{open && (
				<div
					ref={menuRef}
					className="absolute z-50 mt-2 right-0 min-w-[260px] max-w-[90vw] rounded-xl shadow-2xl border border-[#CC2E28] bg-white animate-fade-in"
					style={{ boxShadow: "0 8px 32px 0 rgba(204,46,40,0.18)" }}
				>
					<div className="flex items-center gap-3 px-4 py-3 text-left text-sm bg-[#CC2E28]/10 rounded-t-xl relative">
						<ProfileAvatar
								imageUrl={user.avatar}
								fullName={user.name}
								alt="Profile"
								className="h-9 w-9 border-2 border-[#CC2E28]"
								textClassName="text-xs"
							/>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold text-[#CC2E28]">{user.name}</span>
								<span className="truncate text-xs text-slate-500">{user.email}</span>
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

			{notifOpen && (
				<div
					className="absolute z-50 mt-2 left-0 min-w-[320px] max-w-[90vw] rounded-xl shadow-2xl border border-[#CC2E28] bg-white animate-fade-in"
					style={{ top: "60px" }}
				>
					<div className="flex items-center justify-between px-4 py-3 border-b border-[#CC2E28] rounded-t-xl">
						<span className="font-bold text-[#CC2E28] text-lg">Notifications</span>
						<div className="flex items-center gap-2">
							<button onClick={markAllAsRead} className="text-xs text-slate-600 hover:text-slate-900">Mark all read</button>
							<button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-slate-200" aria-label="Close notifications">
								<X className="w-4 h-4 text-slate-500" />
							</button>
						</div>
					</div>
					{loading ? (
						<div className="px-4 py-4 text-slate-700 text-sm">Loading notifications...</div>
					) : error ? (
						<div className="px-4 py-4 text-red-600 text-sm">{error}</div>
					) : notifications.length === 0 ? (
						<div className="px-4 py-4 text-slate-700 text-sm">No notifications yet.</div>
					) : (
						<div className="max-h-80 overflow-y-auto space-y-2 p-3">
							{notifications.map((item) => (
								<div
									key={item.id}
									role="button"
									tabIndex={0}
									onClick={() => {
										void handleNotificationClick(item);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											void handleNotificationClick(item);
										}
									}}
									className={`w-full text-left rounded-md border px-3 py-2 transition-colors cursor-pointer ${item.is_read ? "bg-white border-slate-200" : "bg-red-50 border-red-100"}`}
								>
									<div className="flex items-start justify-between gap-2">
										<p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</p>
										<div className="flex items-center gap-1">
											{!item.is_read && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													void deleteNotification(item.id);
												}}
												className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
												aria-label="Delete notification"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										</div>
									</div>
									<p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
									<p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(item.created_at)}</p>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			<LogoutModal open={showLogout} onOpenChange={setShowLogout} onConfirm={confirmLogout} />
		</div>
	);
}
