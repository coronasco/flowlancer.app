import { z } from "zod";

export const TaskStatusSchema = z.enum(["Backlog", "In Progress", "Review", "Done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const ProjectCreateSchema = z.object({
	name: z.string().min(1, "Numele este obligatoriu").max(120),
	description: z.string().max(1000).optional(),
	price_type: z.enum(["hourly", "fixed"]).default("hourly"),
	price: z.number().min(0),
	deadline: z.string().optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

export const TaskCreateSchema = z.object({
	title: z.string().min(1, "Titlul este obligatoriu").max(200),
	status: TaskStatusSchema.default("Backlog"),
	description: z.string().trim().max(1000).optional(),
	estimateHours: z.number().int().min(0).max(1000).optional(),
});
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
