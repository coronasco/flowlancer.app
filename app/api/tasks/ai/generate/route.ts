import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateTasksSchema = z.object({
	description: z.string().min(1, "Description is required")
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { description } = GenerateTasksSchema.parse(body);
		
		// Check if OpenAI API key is available
		const openaiKey = process.env.OPENAI_API_KEY;
		if (!openaiKey) {
			// Fallback to mock data if no OpenAI key
			const mockTasks = generateMockTasks(description);
			return NextResponse.json({
				ok: true,
				data: { tasks: mockTasks }
			});
		}

		// Call OpenAI API
		const prompt = `You are a project management assistant. Based on the following project description, generate 3-5 specific, actionable tasks that would help accomplish this goal.

Project Description: "${description}"

For each task, provide:
- A clear, specific title (2-8 words)
- A detailed description (1-2 sentences)
- An estimated time in hours (realistic estimate)

Respond with ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description explaining what needs to be done",
      "estimateHours": 4
    }
  ]
}`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${openaiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				temperature: 0.3,
				messages: [
					{
						role: "system",
						content: "You are a project management expert. Generate specific, actionable tasks. Respond ONLY with valid JSON."
					},
					{
						role: "user",
						content: prompt
					}
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status}`);
		}

		const data = await response.json();
		const content = data?.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error("No response from OpenAI");
		}

		try {
			const result = JSON.parse(content);
			
			// Validate the response structure
			if (!result.tasks || !Array.isArray(result.tasks)) {
				throw new Error("Invalid response format");
			}

			// Clean and validate each task
			const cleanedTasks = result.tasks
				.filter((task: { title: unknown; description: unknown; estimateHours: unknown }) => task.title && task.description && typeof task.estimateHours === 'number')
				.map((task: { title: unknown; description: unknown; estimateHours: unknown }) => ({
					title: String(task.title).trim(),
					description: String(task.description).trim(),
					estimateHours: Math.max(0.5, Math.round(Number(task.estimateHours) * 2) / 2) // Round to nearest 0.5
				}))
				.slice(0, 6); // Limit to max 6 tasks

			if (cleanedTasks.length === 0) {
				throw new Error("No valid tasks generated");
			}

			return NextResponse.json({
				ok: true,
				data: { tasks: cleanedTasks }
			});

		} catch (parseError) {
			console.error("Failed to parse OpenAI response:", parseError);
			// Fallback to mock data
			const mockTasks = generateMockTasks(description);
			return NextResponse.json({
				ok: true,
				data: { tasks: mockTasks }
			});
		}

	} catch (error) {
		console.error("Error generating tasks:", error);
		
		// Return error response
		return NextResponse.json({
			ok: false,
			error: {
				message: error instanceof Error ? error.message : "Failed to generate tasks"
			}
		}, { status: 500 });
	}
}

// Fallback mock task generation
function generateMockTasks(description: string): Array<{title: string; description: string; estimateHours: number}> {
	const keywords = description.toLowerCase();
	
	// Basic task templates based on common project types
	const templates = [
		{ title: "Research and Planning", description: "Conduct initial research and create a detailed project plan", estimateHours: 3 },
		{ title: "Design and Wireframing", description: "Create designs, wireframes, or mockups for the project", estimateHours: 4 },
		{ title: "Core Implementation", description: "Build the main functionality and core features", estimateHours: 8 },
		{ title: "Testing and QA", description: "Test the implementation thoroughly and fix any issues", estimateHours: 3 },
		{ title: "Documentation", description: "Create user documentation and technical documentation", estimateHours: 2 },
		{ title: "Deployment and Setup", description: "Deploy the solution and configure production environment", estimateHours: 2 }
	];

	// Customize based on keywords
	if (keywords.includes('website') || keywords.includes('web')) {
		templates[1] = { title: "UI/UX Design", description: "Design the user interface and user experience", estimateHours: 5 };
		templates[2] = { title: "Frontend Development", description: "Build the frontend components and pages", estimateHours: 12 };
		templates.push({ title: "Backend Integration", description: "Connect frontend with backend services and APIs", estimateHours: 6 });
	}
	
	if (keywords.includes('mobile') || keywords.includes('app')) {
		templates[1] = { title: "Mobile UI Design", description: "Design mobile-optimized user interface", estimateHours: 6 };
		templates[2] = { title: "App Development", description: "Develop the mobile application features", estimateHours: 15 };
		templates.push({ title: "App Store Submission", description: "Prepare and submit app to app stores", estimateHours: 4 });
	}

	if (keywords.includes('api') || keywords.includes('backend')) {
		templates[2] = { title: "API Development", description: "Build and implement the backend API endpoints", estimateHours: 10 };
		templates.push({ title: "Database Design", description: "Design and implement the database schema", estimateHours: 4 });
	}

	// Return 3-5 most relevant tasks
	return templates.slice(0, Math.min(5, Math.max(3, templates.length)));
}
