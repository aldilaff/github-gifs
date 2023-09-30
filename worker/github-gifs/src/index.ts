/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
			'Access-Control-Max-Age': '86400',
		};

		const url = new URL(request.url);
		const query = url.searchParams.get('q');
		console.log('hello');
		const response = await fetch(`https://api.giphy.com/v1/gifs/search?q=${query}&rating=g&api_key=${env.GIPHY_TOKEN}`);
		console.log('response from giphy', response);
		const data = await response.json();
		return new Response(JSON.stringify(data), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				...corsHeaders,
				'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
			},
		});
	},
};
