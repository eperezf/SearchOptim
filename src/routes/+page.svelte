<script>
	/** @type {import('./$types').PageData}*/
	let { data }  = $props();

	import Indexed from '$lib/Indexed.svelte';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import 'dayjs/locale/es';
	import { onMount } from 'svelte';
	dayjs.locale('es');
	dayjs.extend(relativeTime);
	

	const categories = [
		{ id: '80', name: 'Noticias' },
		{ id: '125', name: 'Aplicaciones' },
		{ id: '165', name: 'Columnas' },
		{ id: '465', name: 'Emprendimientos' },
		{ id: '1994', name: 'Guías' },
		{ id: '2095', name: 'Fijo' },
		{ id: '2795', name: 'Encuestas' },
		{ id: '3350', name: 'Ofertas' },
		{ id: '5807', name: 'Concursos' },
		{ id: '10353', name: 'Juegos' }
	];

	/**
	 * @type {any[]}
	 */
	var pages = []
	for (let index = 0; index < data.pageCount; index++) {
		pages.push({index: index+1, active: index+1 == data.page ? true : false});
	}

	/**
	 * @param {String} slug
	 * @param {any} wordpress_id
	 */
	async function refresh(slug, wordpress_id) {
		console.log(slug, wordpress_id);
		let button = document.getElementById(wordpress_id)
		button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refrescando';
		button.disabled = true;
		let response = await fetch(`/refresh/${slug}`);
		let json = await response.json();
		if (json.success) {
			button.innerHTML = '<i class="fa-solid fa-check"></i> Refrescado';
		} else {
			button.innerHTML = '<i class="fa-solid fa-times"></i> Error';
		}
	}	

	onMount(() => {
		// var n = 0;
		// console.log(data.posts);
		// let myInterval = setInterval(myTimer, 100);

		// function myTimer() {
		// 	console.log(data.posts[n]);
		// 	let button = document.getElementById(data.posts[n].wordpress_id);
		// 	button?.click();
		// 	n++;
		// 	if (n >= data.posts.length) {
		// 		window.clearInterval(myInterval);
		// 	}
		// }

	})
</script>


<div class="">Search</div>
<div class="">Filtrar:</div>
<form action="" method="get">
	<div class="grid gap-2">
		<div class="">
			<span>Categoria:</span>
			<span>
				<select name="cat" id="cat">
					<option value="0">Todas</option>
					{#each categories as category}
					<option value="{category.id}">{category.name}</option>
					{/each}
				</select>
			</span>
		</div>
		<div class="">
			<span>Ordenar por:</span>
			<span>
				<select name="sortBy" id="sortBy">
					<option value="pub">Fecha de publicación</option>
					<option value="crawl">Último crawl</option>
					<option value="update">Último update</option>
				</select>
			</span>
		</div>
		<div class="">
			<span>Modo:</span>
			<span>
				<select name="order" id="order">
					<option value="asc">Ascendente</option>
					<option value="desc">Descendente</option>
				</select>
			</span>
		</div>
	</div>
	
	<button type="submit" class="p-1 my-2 bg-slate-600 text-white border border-white/20 rounded-md">Buscar</button>
</form>



<div class="">
	<table class="table-fixed text-center border-collapse border border-slate-400 w-full">
		<thead>
			<tr>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-5/12">Nota</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-2/12">Publicado</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-2/12">Indexado</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-1/12">Último crawl</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-1/12">Último update</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white w-3/12">Acciones</th>
			</tr>
		</thead> 
		<tbody class="bg-slate-200">
			{#each data.posts as post}
			<tr>
				<td class="border border-slate-400 p-2"><p class="truncate">{post.title}</p></td>
				<td class="border border-slate-400 p-2">{new Date(post.published_at).toLocaleString()}</td>
				<td class="border border-slate-400 p-2"><Indexed type="Main" value={post.main.indexed}/><Indexed type="AMP" value={post.amp.indexed}/></td>
				<td class="border border-slate-400 p-2">{dayjs().to(dayjs(post.main.last_crawl_time))}</td>
				<td class="border border-slate-400 p-2">{dayjs().to(dayjs(post.last_updated))}</td>

				<td class="border border-slate-400 p-2">
					<a href="http://pisapapeles.net/{post.slug}" target="_blank" rel="noopener noreferrer" class="p-2 bg-slate-400 rounded-md"><i class="fa-solid fa-up-right-from-square"></i> Ir</a>
					<a href="/inspect/{post.slug}" class="p-2 bg-slate-400 rounded-md"><i class="fa-solid fa-eye"></i> Inspeccionar</a>
					<button class="p-2 bg-slate-400 rounded-md" onclick={()=>refresh(post.slug, post.wordpress_id)} id={post.wordpress_id}><i class="fa-solid fa-arrows-rotate"></i> Refrescar</button>
				</td>
			</tr>
			{/each}
		</tbody>
	</table>
</div>
<div class="flex mt-2">
	<div class="w-8 h-8 bg-slate-500 rounded-l-md text-center text-white content-center"><i class="fa-solid fa-chevron-left"></i></div>
	{#each pages as page}
		<div class="w-8 h-8 bg-slate-400 text-center text-slate-700 content-center">{page.index}</div>
	{/each}
	<div class="w-8 h-8 bg-slate-500 rounded-r-md text-center text-white content-center"><i class="fa-solid fa-chevron-right"></i></div>
</div>