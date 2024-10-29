<script>
	/** @type {import('./$types').PageData}*/
	let { data }  = $props();

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import 'dayjs/locale/es';
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

	var pages = []
	for (let index = 0; index < data.pageCount; index++) {
		pages.push({index: index+1, active: index+1 == data.page ? true : false});
	}
	
</script>


<div class="">Search</div>
<div class="flex">
	<div class="">
		<span>Categoria:</span>
		<span>
			<select name="" id="">
				<option value="">Todas</option>
				{#each categories as category}
				<option value="{category.id}">{category.name}</option>
				{/each}
			</select>
		</span>
	</div>
</div>

<div class="">Ordenar por: </div>
<div class="">
	<table class="table-auto text-center border-collapse border border-slate-400 w-full">
		<thead>
			<tr>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white">Nota</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white">Publicado</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white">Indexado</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white">Último crawl</th>
				<th class="border border-slate-400 bg-slate-600 p-2 text-white">Acciones</th>
			</tr>
		</thead>
		<tbody class="bg-slate-200">
			{#each data.posts as post}
			<tr>
				<td class="border border-slate-400 p-2">{post.title}</td>
				<td class="border border-slate-400 p-2">{new Date(post.published_at).toLocaleString()}</td>
				<td class="border border-slate-400 p-2">{post.main.indexed? "Sí" : "No"}</td>
				<td class="border border-slate-400 p-2">{dayjs().to(dayjs(post.main.last_crawl_time))}</td>
				<td class="border border-slate-400 p-2">
					<a href="http://pisapapeles.net/{post.slug}" target="_blank" rel="noopener noreferrer" class="p-2 bg-slate-400 rounded-md"><i class="fa-solid fa-up-right-from-square"></i> Ir</a>
					<a href="/inspect/{post.slug}" class="p-2 bg-slate-400 rounded-md"><i class="fa-solid fa-eye"></i> Inspeccionar</a>
					<button class="p-2 bg-slate-400 rounded-md"><i class="fa-solid fa-arrows-rotate"></i> Refrescar</button>
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