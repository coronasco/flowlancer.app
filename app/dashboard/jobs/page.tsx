"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import {
  Search,
  MapPin,
  Building,
  Briefcase,
  Globe,
  Calendar,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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
        <div className="py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-blue-600" />
                Jobs Portal (Admin Preview)
              </h1>
                              <p className="text-slate-600 mt-2">Testing interface with mock data - Users will see &quot;In Development&quot; page</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Badge className="bg-red-50 text-red-700 border border-red-200 px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Admin Only
              </Badge>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-slate-600">{jobs.length} total jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600">{featuredJobs.length} featured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600">{filteredJobs.length} showing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className=" py-4 bg-white border-b border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3 text-sm">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white px-3 py-2 pr-8 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer h-9"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-32 h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1"
              />
              <span className="text-slate-700 whitespace-nowrap">Remote only</span>
            </label>

            {(searchTerm || locationFilter || typeFilter || remoteOnly) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setTypeFilter("");
                  setRemoteOnly(false);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading opportunities...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h2 className="font-medium text-slate-900">Featured Jobs</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {featuredJobs.map((job) => (
                    <JobCard key={job.id} job={job} featured />
                  ))}
                </div>
              </>
            )}

            {/* Regular Jobs */}
            {regularJobs.length > 0 && (
              <>
                {featuredJobs.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-slate-600" />
                    <h2 className="font-medium text-slate-900">All Jobs</h2>
                  </div>
                )}
                <div className="space-y-3">
                  {regularJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </>
            )}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-4">
                  <Briefcase className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Try adjusting your search criteria or check back later.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
                    setTypeFilter("");
                    setRemoteOnly(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear filters
                </Button>
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
    <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
      featured ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="h-6 w-6 text-slate-500" />
            </div>
            
            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 truncate">{job.title}</h3>
                {featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                <span className="font-medium text-slate-900">{job.company}</span>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.location}</span>
                </div>
                {job.remote && (
                  <>
                    <span className="text-slate-400">•</span>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-medium">Remote</span>
                    </div>
                  </>
                )}
                <span className="text-slate-400">•</span>
                <span className="capitalize">{job.type}</span>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {job.description}
              </p>
            </div>
          </div>
          
          {/* Salary & Actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900 mb-1">{job.salary}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>{job.posted}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs px-3 py-1.5 h-auto border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Details
              </Button>
              <Button 
                size="sm" 
                className="text-xs px-4 py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {job.tags.slice(0, 5).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
