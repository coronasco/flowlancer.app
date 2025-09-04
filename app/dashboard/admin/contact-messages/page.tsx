"use client";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Mail, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ContactMessage = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
};

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

async function api<T>(url: string, init?: RequestInit, user?: { getIdToken: () => Promise<string> }): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init?.headers) {
    Object.assign(headers, init.headers);
  }
  
  if (user) {
    try {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get Firebase token:", error);
    }
  }
  
  const res = await fetch(url, { ...init, headers });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!("ok" in json) || json.ok === false) {
    const msg = json && "error" in json ? json.error?.message : undefined;
    throw new Error(msg || "Request failed");
  }
  return json.data;
}

export default function ContactMessagesPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch contact messages
  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["contact-messages", user?.uid],
    queryFn: () => api<{ messages: ContactMessage[] }>("/api/admin/contact-messages", undefined, user || undefined).then(d => d.messages),
    enabled: !!user,
  });

  // Update message status
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ messageId, status, notes }: { messageId: string; status: string; notes?: string }) =>
      api("/api/admin/contact-messages", {
        method: "PATCH",
        body: JSON.stringify({ messageId, status, adminNotes: notes })
      }, user || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-messages", user?.uid] });
      toast.success("Message updated successfully");
      setSelectedMessage(null);
    },
    onError: (e: unknown) => toast.error((e as Error).message || "Failed to update message"),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Mail className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      general: "General Inquiry",
      support: "Technical Support",
      billing: "Billing Question",
      feature: "Feature Request",
      partnership: "Partnership",
      other: "Other"
    };
    return labels[subject] || subject;
  };

  if (!user) {
    return <div className="p-8 text-center">Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-white">
        <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Contact Messages</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage customer inquiries and support requests</p>
            </div>
            <div className="text-xs sm:text-sm text-slate-500">
              {isLoading ? "Loading..." : `${messages.length} total messages`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-slate-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No messages yet</h3>
            <p className="text-slate-500">Contact messages will appear here when customers submit the form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-500" />
                      <span className="font-semibold text-slate-900">
                        {message.first_name} {message.last_name}
                      </span>
                    </div>
                    <Badge className={getStatusColor(message.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="capitalize">{message.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMessage(message);
                        setAdminNotes(message.admin_notes || "");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Email</div>
                    <div className="font-medium">{message.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Subject</div>
                    <div className="font-medium">{getSubjectLabel(message.subject)}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2">Message</div>
                  <div className="text-slate-700 line-clamp-3 leading-relaxed">
                    {message.message}
                  </div>
                </div>
                
                {message.admin_notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800 font-medium mb-1">Admin Notes</div>
                    <div className="text-sm text-yellow-700">{message.admin_notes}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Message from {selectedMessage.first_name} {selectedMessage.last_name}
                </h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Email</div>
                  <div className="font-medium">{selectedMessage.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Subject</div>
                  <div className="font-medium">{getSubjectLabel(selectedMessage.subject)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="capitalize">{selectedMessage.status.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Received</div>
                  <div className="font-medium">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-slate-600 mb-2">Message</div>
                <div className="bg-slate-50 rounded-lg p-4 text-slate-700 leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add internal notes about this message..."
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Update Status:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => {
                      updateStatus({
                        messageId: selectedMessage.id,
                        status: e.target.value,
                        notes: adminNotes
                      });
                    }}
                    className="px-3 py-1 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      updateStatus({
                        messageId: selectedMessage.id,
                        status: selectedMessage.status,
                        notes: adminNotes
                      });
                    }}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
