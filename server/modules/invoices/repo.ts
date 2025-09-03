import { compat } from "@/server/compat/flowlancer";

export async function listInvoices(userId: string) {
    return compat.listInvoices(userId);
}

export async function getInvoice(userId: string, invoiceId: string) {
    return compat.getInvoice(userId, invoiceId);
}


