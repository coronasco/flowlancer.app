export function Sidebar() {
	return (
		<aside className="hidden md:block w-64 shrink-0 border-r bg-card/50">
			<nav aria-label="Sidebar" className="p-4 space-y-1 text-sm">
				<a href="/dashboard" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Home</a>
				<a href="/dashboard/profile" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Profile</a>
				<a href="/dashboard/projects" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Projects</a>
				<a href="/dashboard/invoices" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Invoices</a>
				<a href="/dashboard/feed" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Feed</a>
				<a href="/dashboard/settings" className="block rounded px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none brand-ring">Settings</a>
			</nav>
		</aside>
	);
}
