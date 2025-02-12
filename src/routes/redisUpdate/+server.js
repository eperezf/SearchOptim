import { createClient } from 'redis';

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
	
	const client = createClient({url:'redis://192.168.100.85:6379'});
	client.on('error', err => {
		console.log('Redis Client Error', err)
	});
	await client.connect();

	const keysResult = await client.keys('*');
	console.log(keysResult);
	
	
	

	const readable = new ReadableStream({
		async start(controller) {
			for await (const key of keysResult) {
				
				
				console.log(key);
				const slug = await client.get(key);
				controller.enqueue(`data: {"slug": "${slug}", "event": "created"}\n\n`);	
				await event.fetch('/refresh/' + slug).then(res => {
					controller.enqueue(`data: {"slug": "${slug}", "event": "refreshed"}\n\n`);
					if (res.status === 200) {
						console.log("Deleted key " + key);
						const delResult = client.del(key);
					} else {
						controller.enqueue(`data: {"slug": "${slug}", "event": "error"}\n\n`);
					}
					
				});
				
			}
		}
	});
	
    return new Response(readable, {
			headers: {
				"content-type": "text/event-stream",
				"cache-control": "no-cache",
				"connection": "keep-alive"
			}
		});
};