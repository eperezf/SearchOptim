import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
	console.log("initializing unknowns check");
	

	const client = new MongoClient(MONGODB_URI, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});

	let find = {};
	find['main'] = {};
	var posts = []
	var remaining = 0
	try {
		await client.connect();
		const database = client.db('psc');
		const collection = database.collection('posts');
		posts = await collection.find(find).sort({ published_at: -1 }).toArray();
	} catch (error) {
		console.log(error);
	}
	remaining = posts.length
	var updated = 0
	
	
	
	

	const readable = new ReadableStream({
		async start(controller) {
			controller.enqueue(`data: {"remaining": "${remaining}", "event": "remaining"}\n\n`);
			for await (const post of posts) {
				let slug = post.slug
				controller.enqueue(`data: {"slug": "${slug}", "event": "created"}\n\n`);	
				await event.fetch('/refresh/' + slug).then(res => {
					controller.enqueue(`data: {"slug": "${slug}", "event": "refreshed"}\n\n`);
					if (res.status === 200) {
						console.log(`Updated ${slug}`);
						remaining = remaining -1
						updated = updated + 1
						controller.enqueue(`data: {"remaining": "${remaining}", "event": "remaining"}\n\n`);
						controller.enqueue(`data: {"updated": "${updated}", "event": "updated"}\n\n`);

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