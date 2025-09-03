import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface-1)] shadow-[var(--shadow-sm)]",
				className
			)}
			{...props}
		/>
	);
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
