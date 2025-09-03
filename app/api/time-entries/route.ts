import { withAuth, handleError } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

const TimeEntrySchema = z.object({
  action: z.enum(["start", "stop"]),
  taskId: z.string().min(1, "Task ID is required"),
});

// GET /api/time-entries?taskId=... OR ?projectId=... - Get time summary for a task or project
export const GET = withAuth(async (req, { userId }) => {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");
    const projectId = url.searchParams.get("projectId");
    
    if (taskId) {
      const summary = await compat.listTimeSummary(userId, taskId);
      return { summary };
    } else if (projectId) {
      const summary = await compat.listProjectTimeSummary(userId, projectId);
      return { summary };
    } else {
      throw new Error("taskId or projectId is required");
    }
  } catch (error) {
    return handleError(error);
  }
}, ["projects:read"]);

// POST /api/time-entries - Start/Stop time tracking for a task
export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json();
    const { action, taskId } = TimeEntrySchema.parse(body);

    if (action === "start") {
      const entry = await compat.startTimeEntry(userId, taskId);
      return { timeEntry: entry };
    } else {
      const entry = await compat.stopTimeEntry(userId, taskId);
      return { timeEntry: entry };
    }
  } catch (error) {
    return handleError(error);
  }
}, ["projects:write"]);