import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
	title,
	value,
	variant = "lime",
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & { title: string; value: string | number; variant?: "lime" | "teal" | "rose" }) {
	const bg =
		variant === "lime"
			? "bg-[oklch(0.9_0.2_120)]"
			: variant === "teal"
			? "bg-[oklch(0.9_0.12_190)]"
			: "bg-[oklch(0.92_0.12_22)]";
	return (
		<div className={cn("rounded-xl p-4 shadow-[var(--shadow-sm)]", bg, className)} {...props}>
			<div className="text-xs font-medium opacity-80">{title}</div>
			<div className="mt-1 text-2xl font-semibold">{value}</div>
		</div>
	);
}
