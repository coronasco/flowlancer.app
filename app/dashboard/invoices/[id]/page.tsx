"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

type Invoice = { 
  id: string; 
  project_id: string; 
  user_email: string; 
  invoice_number: string; 
  client_name: string; 
  client_email?: string; 
  client_address?: string; 
  business_name: string; 
  business_email: string; 
  business_address: string; 
  total_hours: number; 
  total_amount: number; 
  due_date?: string; 
  status: "pending" | "paid" | "overdue" | "cancelled"; 
  generated_at: string; 
};

async function api<T>(url: string, init?: RequestInit, user?: { getIdToken: () => Promise<string> }): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (init?.headers) {
		Object.assign(headers, init.headers);
	}
	
	// Add Firebase auth token if user is available
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

type TaskDetail = {
	id: string;
	title: string;
	description?: string;
	hoursWorked: number;
	hourlyRate: number;
	earnings: number;
};

export default function InvoicePage() {
	const { id } = useParams<{ id: string }>();
	const { user } = useSession();
	const queryClient = useQueryClient();
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const { data: response, isLoading } = useQuery<{ invoice: Invoice | null; taskDetails: TaskDetail[] }>({
		queryKey: ["invoice", id, user?.uid],
		queryFn: () => api<{ invoice: Invoice | null; taskDetails: TaskDetail[] }>(`/api/invoices/${id}`, undefined, user || undefined),
		enabled: !!id && !!user,
	});

	const invoice = response?.invoice;
	const taskDetails = response?.taskDetails || [];

	const updateInvoiceStatus = async (newStatus: "pending" | "paid" | "overdue" | "cancelled") => {
		if (!user || !id) return;
		
		try {
			setUpdatingStatus(true);
			const headers: Record<string, string> = { "Content-Type": "application/json" };
			const token = await user.getIdToken();
			headers["Authorization"] = `Bearer ${token}`;

			const res = await fetch(`/api/invoices/${id}`, {
				method: "PATCH",
				headers,
				body: JSON.stringify({ status: newStatus })
			});

			const json = await res.json();
			if (!json.ok) throw new Error(json.error?.message || "Failed to update invoice");

			toast.success(`Invoice marked as ${newStatus}!`);
			
			// Refetch invoice data and dashboard
			queryClient.invalidateQueries({ queryKey: ["invoice", id] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update invoice");
		} finally {
			setUpdatingStatus(false);
		}
	};

	return (
		<div className="min-h-screen bg-white">
			<style>{`
				@media print { 
					.no-print { display: none !important; } 
					.print-full { 
						margin: 0 !important; 
						padding: 2rem !important; 
						box-shadow: none !important; 
						border: none !important; 
						background: white !important; 
						max-width: none !important;
					}
					body { margin: 0; padding: 0; }
					.print-content { 
						padding-top: 0 !important; 
						margin-top: 0 !important;
					}
				}
			`}</style>
			
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white no-print">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-semibold text-slate-900">Invoice Details</h1>
							<p className="text-slate-600 mt-1">
								{invoice ? `Invoice #${invoice.invoice_number}` : 'Loading invoice...'}
							</p>
						</div>
						{invoice && (
							<div className="flex items-center gap-4">
								<span className={`px-3 py-1 rounded-md text-sm font-medium ${
									invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
									invoice.status === 'pending' ? 'bg-blue-100 text-blue-700' :
									invoice.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
									'bg-red-100 text-red-700'
								}`}>
									{invoice.status.toUpperCase()}
								</span>
								
								{invoice.status === 'pending' && (
									<button 
										onClick={() => updateInvoiceStatus('paid')}
										disabled={updatingStatus}
										className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
									>
										<CheckCircle className="h-4 w-4" />
										{updatingStatus ? 'Updating...' : 'Mark as Paid'}
									</button>
								)}
								
								<button 
									onClick={() => window.print()}
									className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
								>
									Export PDF
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Invoice Content */}
			<div className="py-8 print-full print-content">
				<div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-lg shadow-sm print-full">
					{isLoading ? (
						<div className="p-8">
							<div className="text-center text-slate-500">Loading invoice...</div>
						</div>
					) : invoice ? (
						<div className="p-8 space-y-8">
							{/* Invoice Header */}
							<div className="flex items-start justify-between">
								<div>
									<h2 className="text-2xl font-bold text-slate-900 mb-2">INVOICE</h2>
									<div className="text-sm text-slate-500">
										#{invoice.invoice_number}
									</div>
									<div className="text-sm text-slate-500">
										Date: {new Date(invoice.generated_at).toLocaleDateString()}
									</div>
									{invoice.due_date && (
										<div className="text-sm text-slate-500">
											Due: {new Date(invoice.due_date).toLocaleDateString()}
										</div>
									)}
								</div>
								<div className="text-right">
									<div className="text-3xl font-bold text-slate-900">
										${invoice.total_amount.toFixed(2)}
									</div>
									<div className="text-sm text-slate-500 mt-1">Total Amount</div>
									<div className="text-xs text-slate-400 mt-1">
										{invoice.total_hours.toFixed(1)} hours
									</div>
								</div>
							</div>

							{/* Bill To / From Section */}
							<div className="grid sm:grid-cols-2 gap-8">
								<div>
									<h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Bill To</h3>
									<div className="bg-slate-50 p-4 rounded-lg">
										<div className="font-medium text-slate-900">{invoice.client_name}</div>
										{invoice.client_email && (
											<div className="text-sm text-slate-600 mt-1">{invoice.client_email}</div>
										)}
										{invoice.client_address && (
											<div className="text-sm text-slate-600 mt-1 whitespace-pre-line">{invoice.client_address}</div>
										)}
									</div>
								</div>
								<div>
									<h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">From</h3>
									<div className="bg-slate-50 p-4 rounded-lg">
										<div className="font-medium text-slate-900">{invoice.business_name}</div>
										<div className="text-sm text-slate-600 mt-1">{invoice.business_email}</div>
										<div className="text-sm text-slate-600 mt-1 whitespace-pre-line">{invoice.business_address}</div>
									</div>
								</div>
							</div>
							{/* Invoice Summary */}
							<div>
								<h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Invoice Summary</h3>
								<div className="border border-slate-200 rounded-lg overflow-hidden">
									<div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
										<div className="grid grid-cols-12 text-xs font-semibold text-slate-700 uppercase tracking-wide">
											<div className="col-span-8">Description</div>
											<div className="col-span-2 text-right">Hours</div>
											<div className="col-span-2 text-right">Amount</div>
										</div>
									</div>
									<div className="divide-y divide-slate-100">
										{taskDetails.length > 0 ? (
											taskDetails.map((task) => (
												<div key={task.id} className="px-6 py-4">
													<div className="grid grid-cols-12 text-sm">
														<div className="col-span-8">
															<div className="font-medium text-slate-900">{task.title}</div>
															{task.description && (
																<div className="text-xs text-slate-500 mt-1">{task.description}</div>
															)}
														</div>
														<div className="col-span-2 text-right text-slate-600">
															{task.hoursWorked.toFixed(2)}
														</div>
														<div className="col-span-2 text-right font-semibold text-slate-900">
															${task.earnings.toFixed(2)}
														</div>
													</div>
												</div>
											))
										) : (
											<div className="px-6 py-4">
												<div className="grid grid-cols-12 text-sm">
													<div className="col-span-8 font-medium text-slate-900">Project Work - {invoice.client_name}</div>
													<div className="col-span-2 text-right text-slate-600">{invoice.total_hours.toFixed(2)}</div>
													<div className="col-span-2 text-right font-semibold text-slate-900">${invoice.total_amount.toFixed(2)}</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Total Section */}
							<div className="border-t border-slate-200 pt-6">
								<div className="flex justify-end">
									<div className="w-64 space-y-2">
										<div className="flex justify-between items-center text-sm">
											<span className="text-slate-600">Total Hours:</span>
											<span className="font-medium text-slate-900">{invoice.total_hours.toFixed(1)} hrs</span>
										</div>
										<div className="flex justify-between items-center border-t border-slate-200 pt-2">
											<span className="text-lg font-semibold text-slate-900">Total Amount:</span>
											<span className="text-2xl font-bold text-slate-900">${invoice.total_amount.toFixed(2)}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="p-8 text-center">
							<div className="text-slate-400 mb-4">
								<div className="h-12 w-12 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">📄</span>
								</div>
							</div>
							<h3 className="text-lg font-medium text-slate-900 mb-2">Invoice not found</h3>
							<p className="text-slate-500 text-sm">The invoice you&apos;re looking for doesn&apos;t exist or has been removed.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}



