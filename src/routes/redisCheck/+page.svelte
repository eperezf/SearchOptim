
<script>

	import Updated from '$lib/Updated.svelte';
	import { browser } from '$app/environment';
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

	var posts = $state([]);

	if (browser) {
		const evtSource = new EventSource("/redisUpdate");
		evtSource.onmessage = (event) => {
			let eventJson = JSON.parse(event.data);
			if (eventJson.event == "created") {
				posts.push(eventJson);
			}
			else {
				let objIndex = posts.findIndex(obj => obj.slug == eventJson.slug);
				posts[objIndex] = eventJson;
			}
		};
	}

	
</script>

<h1>Redis Check</h1>
<div>
	<table class="table-fixed text-center border-collapse border border-slate-400 w-full">
		<thead>
			<tr>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-10/12">Slug</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-2/12">Status</th>
			</tr>
		</thead>
		<tbody>
			{#each posts as post}
				<tr>
					<td class="border border-slate-400 p-2">{post.slug}</td>
					<td class="border border-slate-400 p-2"><Updated value={post.event}/></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>