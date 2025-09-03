import { withAuth, handleError } from "@/app/api/_helpers/route";
import { getInvoice } from "@/server/modules/invoices/repo";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

const UpdateInvoiceSchema = z.object({
    status: z.enum(["pending", "paid", "overdue", "cancelled"])
});

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        return withAuth(async (_req, { userId }) => {
            const invoice = await getInvoice(userId, id);
            if (!invoice) {
                throw new Error("Invoice not found");
            }

            // Use saved task details if available, otherwise fallback to recalculation
            let taskDetails: Array<{
                id: string;
                title: string;
                description?: string;
                hoursWorked: number;
                hourlyRate: number;
                earnings: number;
            }> = [];
            
            if (invoice.task_details && Array.isArray(invoice.task_details)) {
                // Use exact task details saved at invoice creation time
                taskDetails = invoice.task_details;

            } else {
                // Fallback: Recreate task details (legacy invoices)
                const tasks = await compat.listTasks(userId, invoice.project_id);
                const billedTasks = tasks.filter(task => task.billedInInvoiceId === invoice.id);

                taskDetails = await Promise.all(
                    billedTasks.map(async (task) => {
                        const timeSummary = await compat.summarizeTaskTime(userId, task.id);
                        const hoursWorked = Math.round((timeSummary.totalSeconds / 3600) * 10000) / 10000;
                        const hourlyRate = invoice.total_hours > 0 ? (invoice.total_amount / invoice.total_hours) : 70;
                        const taskEarnings = Math.round(hoursWorked * hourlyRate * 100) / 100;
                        
                        return {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            hoursWorked,
                            hourlyRate,
                            earnings: taskEarnings
                        };
                    })
                );

            }

            return { invoice, taskDetails };
        })(req);
    } catch (e) {
        return handleError(e);
    }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        return withAuth(async (_req, { userId }) => {
            const body = await req.json();
            const { status } = UpdateInvoiceSchema.parse(body);
            
            // Update invoice status
            const updated = await compat.updateInvoiceStatus(userId, id, status);
            
            return { invoice: updated };
        })(req);
    } catch (error) {
        return handleError(error);
    }
}
