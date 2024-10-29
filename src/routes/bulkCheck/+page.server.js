import Sitemapper from 'sitemapper';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load(params) {
	var page = params.url.searchParams.get('p');

	console.log(`Checking sitemap ${page}`);
	var sitemap = {}
	sitemap = new Sitemapper({
		url: 'https://pisapapeles.net/post-sitemap'+ page +'.xml',
	});

	let urls = await sitemap.fetch();
	//Remove the 'https://pisapapeles.net/' from the URL
	urls.sites = urls.sites.map((url) => url.replace('https://pisapapeles.net/', ''));
	// Remove the last / from the URL
	urls.sites = urls.sites.map((url) => url.replace(/\/$/, ''));
	var sitelen = urls.sites.length;
	
	const client = new MongoClient(MONGODB_URI, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		}
	});

	for await (const site of urls.sites) {
		await client.connect();
		const database = client.db('psc');
		const collection = database.collection('posts');
		let post = await collection.find({slug: site}).toArray();
		if (post.length === 0) {
			console.log(`NOT FOUND: ${site}`);
			let doc = {
				slug: site,
				amp: {},
				main: {}
			}
			await collection.insertOne(doc);
			console.log(`Inserted: ${site}`);	
			} else	{
				console.log(`FOUND: ${site}`);
			}
			sitelen--;
			console.log(`Posts left to check in sitemap: ${sitelen}`);
			await client.close();
		}
		console.log(`Finished checking sitemap ${page}`);
		
	
  return {};
};