/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);
		const targetUrl = url.searchParams.get("url");

		if (!targetUrl) {
			return new Response("URL parameter is missing", { status: 400 });
		}

		try {
			// Create a new request with a custom User-Agent header
			const modifiedRequest = new Request(decodeURIComponent(targetUrl), {
				method: request.method,
				headers: new Headers({
					"User-Agent": "Cloudflare Workers/1.0 (+https://workers.cloudflare.com/)",
				}),
				body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
				redirect: request.redirect
			});

			const targetResponse = await fetch(modifiedRequest);
			const response = new Response(targetResponse.body, targetResponse);
			response.headers.set("Access-Control-Allow-Origin", "*");
			response.headers.set("Access-Control-Allow-Headers", "*");
			return response;
		} catch (error) {
			return new Response(`Failed to fetch the requested URL: ${error}`, { status: 500 });
		}
	},
};
