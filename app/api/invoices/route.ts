// import { NextResponse } from "next/server";
import { withAuth } from "@/app/api/_helpers/route";
import { listInvoices } from "@/server/modules/invoices/repo";

export const GET = withAuth(async (_req, { userId }) => {
	const invoices = await listInvoices(userId);
	return { invoices };
}, ["invoices:read"]);


