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
		const url = 'https://pisapapeles.net/' + slug + '/';
		console.log("updating post: " + slug);

		// Inspect URL with Google Search Console API
		console.log("inspecting in GSC");
		const resinspect = await searchconsole.urlInspection.index.inspect({
			auth: auth,
			requestBody: {
				inspectionUrl: url,
				siteUrl: 'https://pisapapeles.net/'
			}
		});
		const gscRes = resinspect.data.inspectionResult;
		
		var result = {
			main: {
				verdict: gscRes.indexStatusResult.verdict === 'PASS' ? true : false,
				indexed: gscRes.indexStatusResult.coverageState === 'Submitted and indexed' ? true : false,
				lastCrawlTime: gscRes.indexStatusResult.lastCrawlTime,
			},
		}

		if (gscRes.ampResult !== undefined) {
			result.amp = {
				verdict: gscRes.ampResult.verdict === 'PASS' ? true : false,
				indexed: gscRes.ampResult.ampIndexStatusVerdict === 'PASS' ? true : false,
				lastCrawlTime: gscRes.ampResult.lastCrawlTime,
			}
		} else {
			result.amp = {
				verdict: false,
				indexed: false,
				lastCrawlTime: null,
			}
		}

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
		

		// Get the latest stats
		console.log("getting stats from GSC");
		const startDate = dayjs(wpData.created).format('YYYY-MM-DD');
		const today = dayjs().format('YYYY-MM-DD');
		const urlStats = await searchconsole.searchanalytics.query({
			auth: auth,
			siteUrl: 'https://pisapapeles.net/',
			requestBody: {
				startDate: startDate,
				endDate: today,
				dimensions: ['date'],
				dimensionFilterGroups: [
					{
						filters: [
							{
								dimension: 'page',
								operator: 'contains',
								expression: slug
							}
						],
						groupType: 'and',
					}
				],
				type: 'web',
				rowLimit: 2000,
				aggregationType: 'byPage',
				
			}
		});
		const stats = []

		if (urlStats.data.rows !== undefined) {
			urlStats.data.rows.forEach(row => {
				stats.push({
					date: row.keys[0],
					clicks: row.clicks,
					impressions: row.impressions,
					position: row.position,
					ctr: row.ctr
				});
			});
		}

		// Get the latest stat day from MongoDB
		console.log("getting latest stat from MongoDB");
		const client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		await client.connect();
		const database = client.db('psc');
		const gscCollection = database.collection('gsc');
		const latestStat = await gscCollection
			.find({'slug': slug})
			.sort({ date: -1 })
			.limit(1)
			.toArray();

		const missingDays = []
		if (latestStat.length === 0) {
			// If there are no stats, the missing days are the days between the post creation and today
			const startDate = dayjs(wpData.created);
			const today = dayjs();
			const diff = today.diff(startDate, 'days');
			for (let i = 0; i < diff; i++) {
				missingDays.push(startDate.add(i, 'day').format('YYYY-MM-DD'));
			}
		} else {
			// If there are stats, the missing days are the days between the latest stat and today
			const latestDate = latestStat[0].date;
			const latestDay = dayjs(latestDate);
			const todayDay = dayjs();
			const diff = todayDay.diff(latestDay, 'days');
			console.log(diff);
			if (diff > 1) {
				for (let i = 1; i < diff; i++) {
					missingDays.push(latestDay.add(i, 'day').format('YYYY-MM-DD'));
				}
			}
		}

		// get the latest modification date from MongoDB
		console.log("getting latest modification date from MongoDB");
		const modHistoryCollection = database.collection('mod_history');
		const modHistory = await modHistoryCollection
			.find({'slug': slug})
			.sort({ date: -1 })
			.limit(1)
			.toArray();

		if (!modHistory.length) {
			console.log("No mod history found");
			console.log("Inserting new mod history in MongoDB");
			try {
				await modHistoryCollection.insertOne({
					slug: slug,
					date: new Date(wpData.modified)
				});
			} catch (error) {
				console.log(error);
			}
		} else {
			if (modHistory[0].date.toISOString() !== new Date(wpData.modified).toISOString()) {
				console.log("Mod history found but different date");
				console.log("Inserting new mod history in MongoDB");
				try {
					await modHistoryCollection.insertOne({
						slug: slug,
						date: new Date(wpData.modified)
					});
				} catch (error) {
					console.log(error);
				}
			} else {
				console.log("Mod history found and same date");
			}
		}
		

		// Update post in MongoDB
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
						verdict: result.main.verdict,
						indexed: result.main.indexed,
						last_crawl_time: new Date(result.main.lastCrawlTime),
					},
					amp: {
						verdict: result.amp.verdict,
						indexed: result.amp.indexed,
						last_crawl_time: new Date(result.amp.lastCrawlTime)
					},
					last_updated: new Date(),
				}}
			);
			
		} catch (error) {
			console.log(error);
		}

		// Insert missing days in the stats
		const listToInsert = []
		console.log("Inserting missing days in MongoDB");
		for await (const day of missingDays) {
			const dayStat = stats.find(stat => stat.date === day);
			if (dayStat !== undefined) {
				listToInsert.push({
					slug: slug,
					date: day,
					clicks: dayStat.clicks,
					impressions: dayStat.impressions,
					position: dayStat.position,
					ctr: dayStat.ctr
				});
			}
		}
		if (listToInsert.length === 0) {
			console.log("No missing days to insert");
			
		} else {
			try {
				const gscCollection = database.collection('gsc');
				await gscCollection.insertMany(listToInsert);
			} catch (error) {
				console.log(error);
			}
		}
		await client.close();
    return json({success: true});
};