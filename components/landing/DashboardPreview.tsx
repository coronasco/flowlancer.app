"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, 
  DollarSign, 
  Clock,
  ChevronRight,
  Folder,
  Activity,
  Timer,
  Target,
  CheckCircle2
} from "lucide-react";

export function DashboardPreview() {
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
      
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-6 px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John Doe" />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Welcome back, John!
                </h1>
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

      {/* Main Dashboard Content */}
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
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card className="p-6 hover:shadow-lg transition-all duration-200">
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

              <Card className="p-6 hover:shadow-lg transition-all duration-200">
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

              <Card className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Folder className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Brand Identity</h3>
                      <p className="text-sm text-slate-600">Logo & brand guidelines</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700">Completed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">€1,200 • Fixed</span>
                    <span className="text-slate-600">Completed: Nov 28</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>12.5h tracked</span>
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
