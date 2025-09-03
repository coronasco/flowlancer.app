export class AppError extends Error {
	readonly code: string;
	readonly httpStatus: number;

	constructor(code: string, message: string, httpStatus = 400) {
		super(message);
		this.code = code;
		this.httpStatus = httpStatus;
	}
}

export function toPublicError(error: unknown): { code: string; message: string } {
	if (error instanceof AppError) {
		return { code: error.code, message: error.message };
	}
	return { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." };
}

export function handleError(error: unknown) {
	console.error("API Error:", error);
	const publicError = toPublicError(error);
	return Response.json({ ok: false, error: publicError }, { status: error instanceof AppError ? error.httpStatus : 500 });
}
