export function Header() {
	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
				<a href="/dashboard" className="font-semibold brand-ring focus:outline-none">
					<span className="brand-gradient">flowlancer</span>
				</a>
				<nav aria-label="Global" className="hidden sm:flex gap-4 text-sm">
					<a className="hover:underline" href="/dashboard">Dashboard</a>
					<a className="hover:underline" href="/dashboard/projects">Projects</a>
					<a className="hover:underline" href="/dashboard/invoices">Invoices</a>
					<a className="hover:underline" href="/dashboard/feed">Feed</a>
					<a className="hover:underline" href="/dashboard/settings">Settings</a>
				</nav>
			</div>
		</header>
	);
}
