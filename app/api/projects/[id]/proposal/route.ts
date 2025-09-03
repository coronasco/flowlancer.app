import { withAuth, handleError } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { listTasks } from "@/server/modules/projects/repo";
import { z } from "zod";

const GenerateProposalSchema = z.object({
  includeTimeline: z.boolean().default(true),
  includePricing: z.boolean().default(true),
  tone: z.enum(["professional", "friendly", "technical"]).default("professional"),
  brief: z.string().optional(),
  priceType: z.enum(["existing", "custom"]).default("existing"),
  customPrice: z.number().optional(),
  customPriceType: z.enum(["hourly", "fixed"]).optional(),
});

// POST /api/projects/[id]/proposal - Generate AI proposal for project
export const POST = withAuth(async (req, { userId }) => {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // Extract ID from path
    
    const body = await req.json();
    const { includeTimeline, includePricing, tone, brief, priceType, customPrice, customPriceType } = GenerateProposalSchema.parse(body);

    // Get project details
    const project = await compat.getProject(userId, projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get project tasks for context
    const tasks = await listTasks(userId, projectId);
    const todoTasks = tasks.filter(t => t.status === "Backlog");
    const inProgressTasks = tasks.filter(t => t.status === "In Progress");
    const doneTasks = tasks.filter(t => t.status === "Done");

    // Get user profile for context
    const profile = await compat.getUserProfile(userId);

    // Override project pricing if custom pricing is specified
    const effectiveProject = priceType === "custom" && customPrice && customPriceType
      ? { ...project, price: customPrice, price_type: customPriceType }
      : project;

    // Generate proposal using AI-like logic (placeholder implementation)
    const proposal = generateProposalContent({
      project: effectiveProject,
      tasks: { todo: todoTasks.map(t => ({...t, order: t.order || 0})), inProgress: inProgressTasks.map(t => ({...t, order: t.order || 0})), done: doneTasks.map(t => ({...t, order: t.order || 0})) },
      profile,
      options: { includeTimeline, includePricing, tone },
      brief
    });

    return { proposal };
  } catch (error) {
    return handleError(error);
  }
}, ["projects:read"]);

function generateProposalContent({
  project,
  tasks,
  profile,
  options,
  brief
}: {
  project: {
    id: string;
    name: string;
    description?: string;
    price_type?: string;
    price?: number;
    deadline?: string;
    status: string;
    created_at: string;
    user_email: string;
  };
  tasks: {
    todo: Array<{
      id: string;
      projectId: string;
      title: string;
      description?: string;
      status: string;
      estimateHours?: number;
      order: number;
      billedInInvoiceId?: string;
    }>;
    inProgress: Array<{
      id: string;
      projectId: string;
      title: string;
      description?: string;
      status: string;
      estimateHours?: number;
      order: number;
      billedInInvoiceId?: string;
    }>;
    done: Array<{
      id: string;
      projectId: string;
      title: string;
      description?: string;
      status: string;
      estimateHours?: number;
      order: number;
      billedInInvoiceId?: string;
    }>;
  };
  profile: {
    name?: string;
    avatarUrl?: string;
    role?: string;
  } | null;
  options: { includeTimeline: boolean; includePricing: boolean; tone: string };
  brief?: string;
}) {
  const { name, description, price_type, price } = project;
  const { includeTimeline, includePricing, tone } = options;
  
  // Calculate project metrics
  const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const completionRate = totalTasks > 0 ? Math.round((tasks.done.length / totalTasks) * 100) : 0;
  const estimatedHours = tasks.todo.reduce((sum, task) => sum + (task.estimateHours || 2), 0) +
                         tasks.inProgress.reduce((sum, task) => sum + (task.estimateHours || 2), 0);

  // Tone-based greetings
  const greetings = {
    professional: "Dear Client,",
    friendly: "Hello!",
    technical: "Project Stakeholders,"
  };

  const closings = {
    professional: "We look forward to your feedback and the opportunity to collaborate on this project.\n\nBest regards,",
    friendly: "I'm excited about the possibility of working together on this project!\n\nBest wishes,",
    technical: "Please review the technical specifications and timeline outlined above.\n\nRegards,"
  };

  // Generate main content
  let proposalContent = `${greetings[tone as keyof typeof greetings]}\n\n`;
  
  proposalContent += `## Project Overview: ${name}\n\n`;
  
  if (brief) {
    proposalContent += `${brief}\n\n`;
  } else if (description) {
    proposalContent += `${description}\n\n`;
  }

  proposalContent += `### Current Progress\n`;
  proposalContent += `- ✅ Completed: ${tasks.done.length} tasks (${completionRate}%)\n`;
  proposalContent += `- 🔄 In Progress: ${tasks.inProgress.length} tasks\n`;
  proposalContent += `- 📋 Remaining: ${tasks.todo.length} tasks\n\n`;

  if (tasks.todo.length > 0) {
    proposalContent += `### Upcoming Deliverables\n`;
    tasks.todo.slice(0, 5).forEach((task, index) => {
      proposalContent += `${index + 1}. ${task.title}\n`;
    });
    if (tasks.todo.length > 5) {
      proposalContent += `... and ${tasks.todo.length - 5} more tasks\n`;
    }
    proposalContent += `\n`;
  }

  if (includeTimeline && estimatedHours > 0) {
    const estimatedDays = Math.ceil(estimatedHours / 8);
    const estimatedWeeks = Math.ceil(estimatedDays / 5);
    
    proposalContent += `### Timeline Estimate\n`;
    proposalContent += `- **Estimated Hours:** ${estimatedHours} hours\n`;
    proposalContent += `- **Estimated Duration:** ${estimatedWeeks} ${estimatedWeeks === 1 ? 'week' : 'weeks'} (${estimatedDays} business days)\n`;
    proposalContent += `- **Work Schedule:** Standard business hours with regular progress updates\n\n`;
  }

  if (includePricing && price && price > 0) {
    proposalContent += `### Investment\n`;
    
    if (price_type === "hourly") {
      proposalContent += `- **Hourly Rate:** $${price}/hour\n`;
      if (estimatedHours > 0) {
        const totalEstimate = price * estimatedHours;
        proposalContent += `- **Estimated Total:** $${totalEstimate.toFixed(2)} (${estimatedHours} hours)\n`;
      }
    } else {
      proposalContent += `- **Fixed Price:** $${price}\n`;
    }
    
    proposalContent += `- **Payment Terms:** Flexible payment schedule available\n`;
    proposalContent += `- **Includes:** Regular updates, revisions, and final delivery\n\n`;
  }

  proposalContent += `### Why Choose This Approach\n`;
  proposalContent += `- **Proven Process:** Systematic task breakdown and progress tracking\n`;
  proposalContent += `- **Transparency:** Real-time project visibility and regular updates\n`;
  proposalContent += `- **Quality Focus:** Thorough review process before final delivery\n`;
  
  if ((profile as Record<string, unknown>)?.experience || (profile as Record<string, unknown>)?.skills) {
    proposalContent += `- **Expertise:** Experienced in relevant technologies and methodologies\n`;
  }
  
  proposalContent += `\n### Next Steps\n`;
  proposalContent += `1. Review this proposal and provide feedback\n`;
  proposalContent += `2. Schedule a brief discussion to align on expectations\n`;
  proposalContent += `3. Finalize timeline and begin work\n\n`;

  proposalContent += closings[tone as keyof typeof closings];
  
  if (profile?.name) {
    proposalContent += `\n${profile.name}`;
  }

  return {
    content: proposalContent,
    metadata: {
      generatedAt: new Date().toISOString(),
      projectId: project.id,
      projectName: name,
      totalTasks,
      completionRate,
      estimatedHours,
      tone,
      includeTimeline,
      includePricing
    }
  };
}
