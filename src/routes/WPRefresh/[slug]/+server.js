import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import { google } from 'googleapis';
import dayjs from 'dayjs';
import { json } from '@sveltejs/kit';

const auth = new google.auth.GoogleAuth({
	keyFile: 'credentials.json',
	scopes: [
		'https://www.googleapis.com/auth/cloud-platform', 
		'https://www.googleapis.com/auth/webmasters'
	]
});
const searchconsole = google.searchconsole('v1');
const uri = MONGODB_URI;

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
	const slug = event.params.slug;
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
			modified: wpPost.yoast_head_json.article_modified_time ? wpPost.yoast_head_json.article_modified_time : wpPost.yoast_head_json.article_published_time,
		}

		// Get category from Wordpress API
		console.log("getting category from Wordpress API");
		const resCat = await fetch('https://pisapapeles.net/wp-json/wp/v2/categories/' + wpData.categoryId);
		const catData = await resCat.json();
		wpData.categoryName = catData.name;
		

		// Update post in MongoDB
		console.log("updating post in MongoDB");
		const client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		await client.connect();
		const database = client.db('psc');
		
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

					last_updated: new Date(),
				}}
			);
		} catch (error) {
			console.log(error);
		}
    return json({success: true});
};