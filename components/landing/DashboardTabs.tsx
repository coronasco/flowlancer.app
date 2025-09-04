"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Home,
  User,
  FolderKanban,
  Receipt,
  MessageSquare,
  Plus, 
  DollarSign, 
  Clock,
  ChevronRight,
  Folder,
  Activity,
  Timer,
  Target,
  CheckCircle2,
  Calendar,
  Star,
  Send,
  Trash2,
  Play,
  Square,
  FileText,
  Heart,
  MessageCircle,
  Pencil
} from "lucide-react";

type TabType = 'dashboard' | 'profile' | 'projects' | 'project-detail' | 'invoices' | 'feed';

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderKanban },
    { id: 'invoices' as TabType, label: 'Invoices', icon: Receipt },
    { id: 'feed' as TabType, label: 'Feed', icon: MessageSquare }
  ];

  const handleProjectClick = () => {
    setActiveTab('project-detail');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent onProjectClick={handleProjectClick} />;
      case 'profile':
        return <ProfileContent />;
      case 'projects':
        return <ProjectsContent onProjectClick={handleProjectClick} />;
      case 'project-detail':
        return <ProjectDetailContent onBackClick={() => setActiveTab('projects')} />;
      case 'invoices':
        return <InvoicesContent />;
      case 'feed':
        return <FeedContent />;
      default:
        return <DashboardContent onProjectClick={handleProjectClick} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        <div className="ml-4 text-sm text-slate-500">flowlancer.com/dashboard</div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}

function DashboardContent({ onProjectClick }: { onProjectClick: () => void }) {
  return (
    <div>
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-6 px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John Doe" />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-xl">JD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Welcome back, John!</h1>
                <p className="text-slate-600 mt-1">Here&apos;s your freelance overview</p>
              </div>
            </div>
            <Button className="bg-slate-50 flex flex-col items-center justify-center border-slate-200 text-dark p-8 rounded-lg hover:bg-emerald-200 hover:text-emerald-700 transition-colors">
              <Plus className="h-8 w-8" />
              <span className="text-sm mt-1">New Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6 lg:px-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-slate-600">Total Earnings</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">€3,247</div>
            <div className="text-sm text-green-600">+12% from last month</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-slate-600">Hours Tracked</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">142.5h</div>
            <div className="text-sm text-green-600">+8h this month</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-slate-600">Active Projects</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">6</div>
            <div className="text-sm text-green-600">+2 new projects</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-slate-600">Completed</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">23</div>
            <div className="text-sm text-green-600">+3 this month</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Recent Projects</h2>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card 
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                onClick={onProjectClick}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">E-commerce Website</h3>
                      <p className="text-sm text-slate-600">React & Node.js development</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">€2,500 • Fixed</span>
                    <span className="text-slate-600">Due: Dec 15</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">02:34:15</span>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                onClick={onProjectClick}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Folder className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Mobile App Design</h3>
                      <p className="text-sm text-slate-600">UI/UX for fintech app</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Planning</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">€45/hr • 40h est.</span>
                    <span className="text-slate-600">Due: Jan 20</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Timer className="h-4 w-4" />
                    <span>Not started</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Pro Tip</h2>
            </div>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Time Tracking</h3>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                Track your time consistently to better estimate future projects and optimize your hourly rate.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Full Width */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Profile</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your professional information</p>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Profile is public
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Profile Info */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-white border border-slate-100 rounded-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John Doe" />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xl sm:text-2xl">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1">John Doe</h2>
                  <p className="text-slate-600 mb-2 sm:mb-3">Full Stack Developer</p>
                  <Button size="sm" variant="outline">Change Photo</Button>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      defaultValue="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <input 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      defaultValue="Full Stack Developer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    defaultValue="Experienced full-stack developer specializing in React, Node.js, and modern web technologies. Passionate about creating scalable web applications."
                  />
                </div>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="bg-white border border-slate-100 rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Hourly Rate</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rate (€/hour)</label>
                  <input 
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    defaultValue="45" 
                  />
                </div>
                <Button className="w-full sm:w-auto">AI Suggest Rate</Button>
              </div>
              <p className="text-sm text-slate-500 mt-3">AI can suggest optimal rates based on your skills and market data</p>
            </div>
          </div>

          {/* Right Column - Skills & Additional Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Skills */}
            <div className="bg-white border border-slate-100 rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Skills</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1">React</Badge>
                  <Badge className="bg-green-100 text-green-700 px-3 py-1">Node.js</Badge>
                  <Badge className="bg-purple-100 text-purple-700 px-3 py-1">TypeScript</Badge>
                  <Badge className="bg-orange-100 text-orange-700 px-3 py-1">Next.js</Badge>
                  <Badge className="bg-red-100 text-red-700 px-3 py-1">PostgreSQL</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </div>

            {/* Client Feedback */}
            <div className="bg-white border border-slate-100 rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Client Feedback</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 mb-2">
                    &quot;Excellent work on our e-commerce platform. Very professional and delivered on time.&quot;
                  </p>
                  <p className="text-xs text-slate-500">- TechCorp Ltd.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 mb-2">
                    &quot;Great communication and technical skills. Highly recommended!&quot;
                  </p>
                  <p className="text-xs text-slate-500">- StartupXYZ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsContent({ onProjectClick }: { onProjectClick: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Full Width */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Projects</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Organize and track your freelance work</p>
            </div>
            <div className="flex items-center gap-4">
              <Button>Generate Proposal</Button>
              <div className="text-xs sm:text-sm text-slate-500">3 total projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Add New Project Card - First */}
          <div 
            className="border-2 border-dashed border-slate-200 p-6 sm:p-8 rounded-lg bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-center min-h-[200px] sm:min-h-[240px]"
          >
            <div className="text-center">
              <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-xl mx-auto mb-3 sm:mb-4 w-fit group-hover:bg-slate-800 transition-colors">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">New Project</h3>
              <p className="text-slate-600 text-xs sm:text-sm px-2">Start a new project to organize your work</p>
            </div>
          </div>

          {/* Project Cards */}
          <div 
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 min-h-[200px] sm:min-h-[240px] flex flex-col cursor-pointer"
            onClick={onProjectClick}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor('in-progress')}`}>
                in progress
              </span>
            </div>
            
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
              E-commerce Website
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
              Complete online store with payment integration and admin dashboard
            </p>
            
            <div className="space-y-2 sm:space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">€2,500 • Fixed</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">Dec 15</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">24.5h tracked</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-xs">02:34:15</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 min-h-[200px] sm:min-h-[240px] flex flex-col cursor-pointer"
            onClick={onProjectClick}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor('planning')}`}>
                planning
              </span>
            </div>
            
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
              Mobile App Design
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
              UI/UX design for fintech mobile application with modern interface
            </p>
            
            <div className="space-y-2 sm:space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">€45/hr • 40h est.</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">Jan 20</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">0h tracked</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs">Not started</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 min-h-[200px] sm:min-h-[240px] flex flex-col">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg">
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor('completed')}`}>
                completed
              </span>
            </div>
            
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
              Brand Identity
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
              Logo design and comprehensive brand guidelines package
            </p>
            
            <div className="space-y-2 sm:space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">€1,200 • Fixed</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">Nov 28</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-slate-600">12.5h tracked</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailContent({ onBackClick }: { onBackClick: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Full Width */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <button 
            onClick={onBackClick}
            className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4 sm:mb-6"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 rotate-180" />
            Back to projects
          </button>
          
          {/* Main Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Project Title & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full">
                <div className="flex-1 mb-3 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">E-commerce Website</h1>
                  <p className="text-slate-600 text-sm sm:text-base">Complete online store with payment integration and admin dashboard</p>
                </div>
                <div className="flex items-center gap-2 sm:ml-4">
                  <button className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm">
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 shadow-sm">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Timer, Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-slate-200 w-full lg:w-auto">
              {/* Timer Section */}
              <div className="sm:pr-4 lg:pr-6 w-full sm:w-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-red-600 uppercase tracking-wider">REC</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">02:34:15</span>
                  </div>
                  <div className="text-xs text-slate-500">•</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Earned</span>
                    <span className="text-sm font-medium text-slate-900">€1,102.50</span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="sm:pl-4 lg:pl-6 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                  Share Client Portal
                </Button>
                
                <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
                
                <Button size="sm" className="text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
          {/* Backlog Column */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-900">Backlog</h3>
              <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium">1</span>
            </div>
            <div className="space-y-3">
              <div className="bg-white border border-slate-100 rounded-lg p-4 transition-all group relative cursor-move hover:shadow-md hover:border-slate-200">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 leading-5">Setup Database</h4>
                      </div>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3 rotate-180" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Configure PostgreSQL and setup initial schema
                  </p>
                  
                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                          <Play className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-40">
                          <Square className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="tabular-nums font-medium">00:00:00</span>
                        <span className="text-slate-400">•</span>
                        <span className="tabular-nums font-medium">€0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-900">In Progress</h3>
              <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium">1</span>
            </div>
            <div className="space-y-3">
              <div className="bg-white border border-slate-100 rounded-lg p-4 transition-all group relative cursor-move hover:shadow-md hover:border-slate-200">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 leading-5">Frontend Components</h4>
                      </div>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3 rotate-180" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Build React components for product catalog
                  </p>
                  
                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors opacity-40">
                          <Play className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Square className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-medium text-red-600 uppercase tracking-wider">REC</span>
                          </div>
                          <span className="tabular-nums font-medium text-slate-700">02:34:15</span>
                        </div>
                        <span className="text-slate-400">•</span>
                        <span className="tabular-nums font-medium">€115.75</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-900">Done</h3>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium">1</span>
                <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors">
                  Invoice
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white border border-slate-100 rounded-lg p-4 transition-all group relative cursor-move hover:shadow-md hover:border-slate-200">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 leading-5">Project Setup</h4>
                      </div>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3 rotate-180" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Initialize project and setup development environment
                  </p>
                  
                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors opacity-40">
                          <Play className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-40">
                          <Square className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="tabular-nums font-medium">01:30:00</span>
                        <span className="text-slate-400">•</span>
                        <span className="tabular-nums font-medium">€67.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicesContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Full Width */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Invoices</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage and track your project invoices</p>
            </div>
            <div className="text-xs sm:text-sm text-slate-500 w-full sm:w-auto text-left sm:text-right">
              3 total invoices
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* E-commerce Website Project */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">E-commerce Website</h2>
                <p className="text-slate-600 text-sm">TechCorp Ltd.</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 ml-0 sm:ml-12">
              <div className="bg-white border border-slate-100 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Invoice #FL-001</h3>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm">Generated on Nov 28, 2024</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">Paid</Badge>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-slate-600 mb-1">Amount</div>
                    <div className="font-semibold text-slate-900">€1,200.00</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Hours</div>
                    <div className="font-semibold text-slate-900">24.0h</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Due Date</div>
                    <div className="font-semibold text-slate-900">Dec 12, 2024</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Status</div>
                    <div className="font-semibold text-green-600">Paid</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 pt-4 border-t border-slate-100">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Design Project */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Folder className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Mobile App Design</h2>
                <p className="text-slate-600 text-sm">FinTech Startup</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 ml-0 sm:ml-12">
              <div className="bg-white border border-slate-100 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Invoice #FL-002</h3>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm">Generated on Dec 1, 2024</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Pending</Badge>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="text-slate-600 mb-1">Amount</div>
                    <div className="font-semibold text-slate-900">€1,800.00</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Hours</div>
                    <div className="font-semibold text-slate-900">40.0h</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Due Date</div>
                    <div className="font-semibold text-slate-900">Dec 15, 2024</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">Status</div>
                    <div className="font-semibold text-blue-600">Pending</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 pt-4 border-t border-slate-100">
                  <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    Mark as Paid
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Full Width */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Community Feed</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Connect with fellow freelancers and share your journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Post Composer */}
            <div className="bg-white border border-slate-100 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John Doe" />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm sm:text-base">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
                    rows={3} 
                    placeholder="Share an update with the community..."
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm" className="text-xs sm:text-sm">
                      <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Post Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-3 sm:space-y-4">
              <div className="border border-slate-100 p-4 sm:p-6 rounded-lg bg-white hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" alt="Sarah Wilson" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs sm:text-sm">SW</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">Sarah Wilson</h4>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4 text-sm sm:text-base leading-relaxed">
                  Just completed my biggest project this year! 🎉 A complete e-commerce platform for a local business. 
                  The client is thrilled with the results. Time tracking in Flowlancer made invoicing so much easier!
                </p>
                
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Comment
                  </button>
                  <span>12 likes</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 sm:p-6 rounded-lg bg-white hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Mike Chen" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs sm:text-sm">MC</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">Mike Chen</h4>
                      <p className="text-xs text-slate-500">5 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4 text-sm sm:text-base leading-relaxed">
                  Pro tip: Always set clear project milestones and get client approval before moving to the next phase. 
                  It saves so much time and prevents scope creep! 💡
                </p>
                
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Comment
                  </button>
                  <span>8 likes</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 sm:p-6 rounded-lg bg-white hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John Doe" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs sm:text-sm">JD</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">John Doe</h4>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4 text-sm sm:text-base leading-relaxed">
                  Working on an exciting new e-commerce project! The client portal feature in Flowlancer is amazing - 
                  my clients love being able to see real-time progress and leave feedback directly on tasks.
                </p>
                
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Comment
                  </button>
                  <span>15 likes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <div className="bg-white border border-slate-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Trending Topics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">#freelancing</span>
                  <span className="text-xs text-slate-500">24 posts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">#timetracking</span>
                  <span className="text-xs text-slate-500">18 posts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">#clientwork</span>
                  <span className="text-xs text-slate-500">15 posts</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white border border-slate-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Active Members</span>
                  <span className="text-sm font-semibold text-slate-900">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Posts Today</span>
                  <span className="text-sm font-semibold text-slate-900">32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Online Now</span>
                  <span className="text-sm font-semibold text-green-600">89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

