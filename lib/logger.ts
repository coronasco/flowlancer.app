import pino from "pino";

export const logger = pino({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	base: undefined,
});

export function withRequestId(id: string) {
	return logger.child({ requestId: id });
}
