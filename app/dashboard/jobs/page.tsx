"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  ExternalLink,
  Filter,
  Briefcase,
  Globe,
  Calendar,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

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
};

// Mock data for demonstration - will be replaced with real API calls
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp Inc",
    location: "Remote",
    salary: "$80,000 - $120,000",
    type: "Full-time",
    description: "We're looking for a senior React developer to join our team and build amazing user experiences.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind"],
    posted: "2 days ago",
    url: "#",
    featured: true,
    remote: true
  },
  {
    id: "2", 
    title: "Freelance UI/UX Designer",
    company: "Design Studio",
    location: "New York, NY",
    salary: "$60-80/hour",
    type: "Contract",
    description: "Create beautiful and intuitive designs for our client projects. Remote work available.",
    tags: ["Figma", "UI/UX", "Prototyping", "Branding"],
    posted: "1 day ago",
    url: "#",
    remote: true
  },
  {
    id: "3",
    title: "Full-Stack Developer",
    company: "StartupXYZ",
    location: "San Francisco, CA", 
    salary: "$90,000 - $130,000",
    type: "Full-time",
    description: "Join our fast-growing startup and help build the next generation of productivity tools.",
    tags: ["Node.js", "React", "PostgreSQL", "AWS"],
    posted: "3 days ago",
    url: "#"
  },
  {
    id: "4",
    title: "WordPress Developer",
    company: "Digital Agency",
    location: "Remote",
    salary: "$40-60/hour",
    type: "Contract",
    description: "Develop custom WordPress themes and plugins for our agency clients.",
    tags: ["WordPress", "PHP", "MySQL", "JavaScript"],
    posted: "5 days ago",
    url: "#",
    remote: true
  },
  {
    id: "5",
    title: "Mobile App Developer",
    company: "AppTech Solutions",
    location: "Austin, TX",
    salary: "$70,000 - $100,000",
    type: "Full-time",
    description: "Build cross-platform mobile applications using React Native.",
    tags: ["React Native", "iOS", "Android", "Firebase"],
    posted: "1 week ago",
    url: "#"
  }
];

async function fetchJobs(): Promise<Job[]> {
  // For now, return mock data
  // TODO: Integrate with real APIs (RemoteOK, GitHub Jobs, etc.)
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockJobs), 500);
  });
}

export default function JobsPage() {
  const { user } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.uid) {
        try {
          const { getFirestore, doc, getDoc } = await import("firebase/firestore");
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "customers", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData?.isAdmin === true);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };

    checkAdminStatus();
  }, [user?.uid]);

  // Only load jobs data for admin users
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAdmin, // Only fetch if user is admin
  });


  // Filter jobs based on search criteria (only for admin)
  const filteredJobs = isAdmin ? jobs.filter((job) => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationFilter || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = !typeFilter || job.type === typeFilter;
    
    const matchesRemote = !remoteOnly || job.remote;

    return matchesSearch && matchesLocation && matchesType && matchesRemote;
  }) : [];

  const featuredJobs = filteredJobs.filter(job => job.featured);
  const regularJobs = filteredJobs.filter(job => !job.featured);

  // Show simple work in progress page for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="border-b border-slate-100 bg-white">
          <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Find Jobs</h1>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">Discover freelance opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-lg mb-6">
                <Briefcase className="h-8 w-8 text-slate-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                We&apos;re working on something great
              </h2>
              
              <p className="text-slate-600 leading-relaxed mb-8">
                Our jobs portal is currently in development. Soon you&apos;ll be able to discover 
                and apply to amazing freelance opportunities directly from your dashboard.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>In development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin view with mock data for testing
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-blue-600" />
                Jobs Portal (Admin Preview)
              </h1>
                              <p className="text-slate-600 mt-2">Testing interface with mock data - Users will see &quot;In Development&quot; page</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Badge className="bg-red-100 text-red-700 border-red-200">
                <Star className="h-3 w-3 mr-1" />
                Admin Only
              </Badge>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>{jobs.length} mock jobs</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>{featuredJobs.length} featured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote-only"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remote-only" className="text-sm text-slate-700">
                Remote only
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
            {(searchTerm || locationFilter || typeFilter || remoteOnly) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setTypeFilter("");
                  setRemoteOnly(false);
                }}
                className="text-blue-600 hover:text-blue-700 ml-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading amazing opportunities...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-slate-900">Featured Opportunities</h2>
                </div>
                <div className="space-y-4">
                  {featuredJobs.map((job) => (
                    <JobCard key={job.id} job={job} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            {regularJobs.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">All Opportunities</h2>
                <div className="space-y-4">
                  {regularJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${featured ? 'border-yellow-200 bg-yellow-50/30' : 'hover:border-slate-300'}`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4 mb-4">
            {job.logo ? (
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-slate-400" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-slate-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-slate-600 mb-2">{job.company}</p>
                </div>
                {featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                  {job.remote && <Badge variant="outline" className="ml-1 text-xs">Remote</Badge>}
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{job.posted}</span>
                </div>
              </div>
              
              <p className="text-slate-700 line-clamp-2 mb-4">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 lg:ml-4">
          <Button className="w-full lg:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          <Button variant="outline" className="w-full lg:w-auto">
            <Globe className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
