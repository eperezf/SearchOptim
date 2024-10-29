import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const uri = MONGODB_URI;



/** @type {import('./$types').PageServerLoad} */
export async function load(params) {
	
	var page = params.url.searchParams.get('p');
	var indexed = params.url.searchParams.get('indexed');
	var category = params.url.searchParams.get('cat');

	console.log(category);
	
	var skip = 0;
	if (!page) {
		page = 1;
	} else {
		page = parseInt(page);
		skip = (page - 1) * 10;
	}

	let find = {};
	if (indexed === 'false') {
		find['main.indexed'] = false;
	}

	find['main'] = {};

	if (category) {
		find['category_id'] = parseInt(category);
	}

	var posts = []
	const client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		}
	});

	try {
		await client.connect();
		const database = client.db('psc');
		const collection = database.collection('posts');
		posts = await collection.find(find).sort({ published_at: -1 }).limit(10).skip(skip).toArray();
		await client.close();
		
	} catch (error) {
		console.log(error);
		
	}
	
	const pageCount = Math.ceil(posts.length / 10);
  return {posts: structuredClone(posts), postCount: posts.length, pageCount: pageCount, page: page};
};