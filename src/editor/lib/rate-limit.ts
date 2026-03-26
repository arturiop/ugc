export async function checkRateLimit({ request }: { request: Request }) {
	void request;
	return { success: true, limited: false };
}
