import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const uri = MONGODB_URI;



/** @type {import('./$types').PageServerLoad} */
export async function load(params) {
	
	var page = params.url.searchParams.get('p');
	var indexed = params.url.searchParams.get('indexed');
	var category = params.url.searchParams.get('cat');
	var sortBy = params.url.searchParams.get('sortBy');
	var order = params.url.searchParams.get('order');

	if (order == 'asc') {
		order = 1;
	} else {
		order = -1;
	}

	if (category == 0){
		category = null;
	}
	
	var skip = 0;
	if (!page) {
		page = 1;
	} else {
		page = parseInt(page);
		skip = (page - 1) * 10;
	}



	let find = {};
	let sort = {};

	if (sortBy === 'pub') {
		sort['published_at'] = order;
	} else if (sortBy === 'crawl') {
		sort['main.last_crawl_time'] = order;
	} else if (sortBy === 'update') {
		sort['last_updated'] = order;
	}



	if (indexed === 'false') {
		find['main.indexed'] = false;
	}



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
		posts = await collection.find(find).sort(sort).limit(500).skip(skip).toArray();
		await client.close();
		
	} catch (error) {
		console.log(error);
		
	}
	
	const pageCount = Math.ceil(posts.length / 10);
  return {posts: structuredClone(posts), postCount: posts.length, pageCount: pageCount, page: page};
};