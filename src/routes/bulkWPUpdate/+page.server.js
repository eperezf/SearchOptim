import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import dayjs from 'dayjs';

const uri = MONGODB_URI;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	console.log('Bulk WP Update');
	const client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		let find = {};
		find['main'] = {};
		var posts = []
		try {
			await client.connect();
			const database = client.db('psc');
			const collection = database.collection('posts');
			posts = await collection.find(find).sort({ published_at: -1 }).toArray();
		} catch (error) {
			console.log(error);
		}

		for (const post of posts) {
			const slug = post.slug;
			const url = 'https://pisapapeles.net/' + slug + '/';
			console.log("updating post: " + slug);

			// Get data from Wordpress API
			console.log("getting data from Wordpress API");
			const res = await fetch('https://pisapapeles.net/wp-json/wp/v2/posts?slug=' + slug);
			const data = await res.json();
			const wpPost = data[0]
			const wpData = {
				id: wpPost.id,
				title: wpPost.yoast_head_json.title,
				author: wpPost.yoast_head_json.author,
				categoryId: wpPost.categories[0],
				categoryName: "",
				tags: wpPost.tags,
				created: wpPost.yoast_head_json.article_published_time,
				modified: wpPost.yoast_head_json.article_modified_time,
			}

			// Get category from Wordpress API
			console.log("getting category from Wordpress API");
			const resCat = await fetch('https://pisapapeles.net/wp-json/wp/v2/categories/' + wpData.categoryId);
			const catData = await resCat.json();
			wpData.categoryName = catData.name;

			const database = client.db('psc');

			console.log("updating post in MongoDB");
		try {
			const collection = database.collection('posts');
			await collection.updateOne(
				{slug: slug}, 
				{$set: {
					wordpress_id: wpData.id,
					category_id: wpData.categoryId,
					category_name: wpData.categoryName,
					title: wpData.title,
					author: wpData.author,
					tags: wpData.tags,
					published_at: new Date(wpData.created),
					modified_at: new Date(wpData.modified),
					main: {
					},
					amp: {
					},
					last_updated: new Date('2025-01-01T00:00:00Z'),
				}}
			);
			
		} catch (error) {
			console.log(error);
		}
		}
	
    return {};
};