import { withAuth, handleError, withRateLimit } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { listTasks } from "@/server/modules/projects/repo";
import { z } from "zod";

const CreateInvoiceSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid client email is required"),
  clientAddress: z.string().optional(),
  businessName: z.string().optional(),
  businessEmail: z.string().email("Valid business email is required"),
  businessAddress: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  dueDate: z.string().optional(),
});

// POST /api/invoices/from-project - Create invoice from project's done tasks and time entries
export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json();
    const data = CreateInvoiceSchema.parse(body);
    const rateLimitedHandler = withRateLimit(`invoiceFromProject:${userId}:${data.projectId}`, async () => {
      // Get project details
      const project = await compat.getProject(userId, data.projectId);
      if (!project) {
        throw new Error(`Project not found: ${data.projectId} for user ${userId}`);
      }

      // Get done tasks that haven't been billed yet
      const tasks = await listTasks(userId, data.projectId);
      const doneTasks = tasks.filter((t) => t.status === "Done" && !t.billedInInvoiceId);



      if (doneTasks.length === 0) {
        throw new Error("No unbilled completed tasks found. All completed tasks have already been invoiced.");
      }

      // Get actual time worked for each done task
      const taskDetails = await Promise.all(
        doneTasks.map(async (task) => {
          const timeSummary = await compat.summarizeTaskTime(userId, task.id);
          // Use higher precision for small time amounts, then round to 2 decimals
          const hoursWorked = Math.round((timeSummary.totalSeconds / 3600) * 10000) / 10000;
          const taskEarnings = Math.round(hoursWorked * data.hourlyRate * 100) / 100;
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            hoursWorked,
            hourlyRate: data.hourlyRate,
            earnings: taskEarnings
          };
        })
      );

      // Calculate totals from actual task work
      const totalHours = taskDetails.reduce((sum, task) => sum + task.hoursWorked, 0);
      const totalAmount = taskDetails.reduce((sum, task) => sum + task.earnings, 0);
      



      if (totalHours === 0) {
        throw new Error("No time has been tracked for the completed tasks. Please track time before creating an invoice.");
      }

      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const invoice = await compat.createInvoice(userId, {
        project_id: data.projectId,
        invoice_number: invoiceNumber,
        client_name: data.clientName,
        client_email: data.clientEmail || "",
        client_address: data.clientAddress || "",
        business_name: data.businessName || "",
        business_email: data.businessEmail,
        business_address: data.businessAddress || "",
        total_hours: totalHours,
        total_amount: totalAmount,
        due_date: data.dueDate && data.dueDate.trim() ? data.dueDate : undefined,
        status: "pending",
        task_details: taskDetails, // Save exact task details at invoice creation time
      });

      // Mark done tasks as billed to prevent double billing
      if (doneTasks.length > 0 && invoice.id) {
        await compat.markTasksAsBilled(userId, doneTasks.map(t => t.id), invoice.id);
      }


      
      return { 
        invoice,
        taskDetails,
        summary: {
          projectName: project.name,
          doneTasks: doneTasks.length,
          totalHours: totalHours,
          hourlyRate: data.hourlyRate,
          totalAmount: totalAmount,
        }
      };
    });

    return await rateLimitedHandler();
  } catch (error) {
    return handleError(error);
  }
}, ["invoices:write"]);


