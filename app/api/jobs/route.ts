import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Job type definition
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
  tags: string[];
  posted: string;
  url: string;
  logo?: string;
  featured?: boolean;
  remote?: boolean;
  source: string;
};

// Query parameters schema
const JobsQuerySchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  remote: z.string().optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
});

// Mock jobs data - will be replaced with real API integrations
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp Inc",
    location: "Remote",
    salary: "$80,000 - $120,000",
    type: "Full-time",
    description: "We're looking for a senior React developer to join our team and build amazing user experiences. You'll work with modern technologies including React, TypeScript, and Next.js.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind"],
    posted: "2 days ago",
    url: "https://example.com/jobs/1",
    featured: true,
    remote: true,
    source: "internal"
  },
  {
    id: "2", 
    title: "Freelance UI/UX Designer",
    company: "Design Studio",
    location: "New York, NY",
    salary: "$60-80/hour",
    type: "Contract",
    description: "Create beautiful and intuitive designs for our client projects. Remote work available. Must have experience with Figma and design systems.",
    tags: ["Figma", "UI/UX", "Prototyping", "Branding"],
    posted: "1 day ago",
    url: "https://example.com/jobs/2",
    remote: true,
    source: "internal"
  },
  {
    id: "3",
    title: "Full-Stack Developer",
    company: "StartupXYZ",
    location: "San Francisco, CA", 
    salary: "$90,000 - $130,000",
    type: "Full-time",
    description: "Join our fast-growing startup and help build the next generation of productivity tools. Experience with Node.js and React required.",
    tags: ["Node.js", "React", "PostgreSQL", "AWS"],
    posted: "3 days ago",
    url: "https://example.com/jobs/3",
    source: "internal"
  },
  {
    id: "4",
    title: "WordPress Developer",
    company: "Digital Agency",
    location: "Remote",
    salary: "$40-60/hour",
    type: "Contract",
    description: "Develop custom WordPress themes and plugins for our agency clients. Must be proficient in PHP and JavaScript.",
    tags: ["WordPress", "PHP", "MySQL", "JavaScript"],
    posted: "5 days ago",
    url: "https://example.com/jobs/4",
    remote: true,
    source: "internal"
  },
  {
    id: "5",
    title: "Mobile App Developer",
    company: "AppTech Solutions",
    location: "Austin, TX",
    salary: "$70,000 - $100,000",
    type: "Full-time",
    description: "Build cross-platform mobile applications using React Native. Experience with iOS and Android development preferred.",
    tags: ["React Native", "iOS", "Android", "Firebase"],
    posted: "1 week ago",
    url: "https://example.com/jobs/5",
    source: "internal"
  },
  {
    id: "6",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote",
    salary: "$85,000 - $115,000",
    type: "Full-time",
    description: "Manage cloud infrastructure and deployment pipelines. AWS and Docker experience required.",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    posted: "4 days ago",
    url: "https://example.com/jobs/6",
    remote: true,
    source: "internal"
  },
  {
    id: "7",
    title: "Frontend Developer",
    company: "E-commerce Plus",
    location: "Remote",
    salary: "$50-70/hour",
    type: "Contract",
    description: "Build responsive e-commerce interfaces using Vue.js. Experience with payment integrations preferred.",
    tags: ["Vue.js", "JavaScript", "CSS", "E-commerce"],
    posted: "6 days ago",
    url: "https://example.com/jobs/7",
    remote: true,
    featured: true,
    source: "internal"
  },
  {
    id: "8",
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Boston, MA",
    salary: "$95,000 - $140,000",
    type: "Full-time",
    description: "Analyze large datasets and build machine learning models. Python and SQL expertise required.",
    tags: ["Python", "SQL", "Machine Learning", "Pandas"],
    posted: "1 week ago",
    url: "https://example.com/jobs/8",
    source: "internal"
  }
];

// Future: Integrate with external APIs
// async function fetchRemoteOKJobs(): Promise<Job[]> {
//   try {
//     const response = await fetch('https://remoteok.io/api');
//     const data = await response.json();
//     return data.map(transformRemoteOKJob);
//   } catch (error) {
//     console.error('Failed to fetch RemoteOK jobs:', error);
//     return [];
//   }
// }

// async function fetchGitHubJobs(): Promise<Job[]> {
//   try {
//     const response = await fetch('https://jobs.github.com/positions.json');
//     const data = await response.json();
//     return data.map(transformGitHubJob);
//   } catch (error) {
//     console.error('Failed to fetch GitHub jobs:', error);
//     return [];
//   }
// }

function filterJobs(jobs: Job[], filters: Record<string, unknown>): Job[] {
  return jobs.filter(job => {
    const searchTerm = typeof filters.search === 'string' ? filters.search : '';
    const locationTerm = typeof filters.location === 'string' ? filters.location : '';
    const typeTerm = typeof filters.type === 'string' ? filters.type : '';
    const remoteTerm = typeof filters.remote === 'boolean' ? filters.remote : false;
    
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationTerm || 
      job.location.toLowerCase().includes(locationTerm.toLowerCase());
    
    const matchesType = !typeTerm || job.type === typeTerm;
    
    const matchesRemote = !remoteTerm || job.remote;

    return matchesSearch && matchesLocation && matchesType && matchesRemote;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = JobsQuerySchema.parse({
      search: searchParams.get('search'),
      location: searchParams.get('location'),
      type: searchParams.get('type'),
      remote: searchParams.get('remote'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // For now, use mock data
    // TODO: Integrate with external APIs
    const allJobs = [...mockJobs];

    // Future: Add external job sources
    // const remoteOKJobs = await fetchRemoteOKJobs();
    // const gitHubJobs = await fetchGitHubJobs();
    // allJobs = [...mockJobs, ...remoteOKJobs, ...gitHubJobs];

    // Apply filters
    const filteredJobs = filterJobs(allJobs, query);

    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    // Separate featured and regular jobs
    const featuredJobs = paginatedJobs.filter(job => job.featured);
    const regularJobs = paginatedJobs.filter(job => !job.featured);

    return NextResponse.json({
      ok: true,
      data: {
        jobs: [...featuredJobs, ...regularJobs], // Featured jobs first
        totalJobs: filteredJobs.length,
        featuredCount: featuredJobs.length,
        page: query.page,
        limit: query.limit,
        hasMore: endIndex < filteredJobs.length
      }
    });

  } catch (error) {
    console.error("Jobs API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: "Invalid query parameters",
            details: error.issues
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
