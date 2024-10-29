<script>
    /** @type {import('./$types').PageData} */
		import { onMount } from 'svelte';
		import Chart from 'chart.js/auto';
		import annotationPlugin from 'chartjs-plugin-annotation';

		import createTrend from 'trendline';
		import dayjs from 'dayjs';
		import relativeTime from 'dayjs/plugin/relativeTime';
		import 'dayjs/locale/es';
		dayjs.locale('es');
		dayjs.extend(relativeTime);
		Chart.register(annotationPlugin);
		
    export let data;
		export let post = data.post;
		export let stats = data.statistics;
		export let modHistory = data.modHistory;
		
		/** @type {{ [key: string]: { type: string, xMin: string, xMax: string, borderColor: string, borderWidth: number } }} */
		var annotations = {};



		for (let index = 0; index < modHistory.length; index++) {
			const element = modHistory[index];
			annotations['an'+index] = {type: 'line', xMin: dayjs(element.date).format('YYYY-MM-DD'), xMax: dayjs(element.date).format('YYYY-MM-DD'), borderColor: 'blue', borderWidth: 2};
		}

		for (let i = 0; i < stats.length; i++) {
			stats[i].x = i+1;
		}

		var positionTrend30 = {slope:0}
		var positionTrend60 = {slope:0}
		var positionTrend90 = {slope:0}

		var impressionsTrend30 = {slope:0}
		var impressionsTrend60 = {slope:0}
		var impressionsTrend90 = {slope:0}

		var clicksTrend30 = {slope:0}
		var clicksTrend60 = {slope:0}
		var clicksTrend90 = {slope:0}

		onMount(() => {
			const days30 = stats.slice(-30)
			const days60 = stats.slice(-60)
			const days90 = stats.slice(-90)

			positionTrend30 = createTrend(days30, 'x','position');
			console.log(positionTrend30);
			positionTrend60 = createTrend(days60, 'x','position');
			console.log(positionTrend60);
			positionTrend90 = createTrend(days90, 'x','position');
			console.log(positionTrend90);

			impressionsTrend30 = createTrend(days30, 'x','impressions');
			console.log(impressionsTrend30);
			impressionsTrend60 = createTrend(days60, 'x','impressions');
			console.log(impressionsTrend60);
			impressionsTrend90 = createTrend(days90, 'x','impressions');
			console.log(impressionsTrend90);

			clicksTrend30 = createTrend(days30, 'x','clicks');
			console.log(clicksTrend30);
			clicksTrend60 = createTrend(days60, 'x','clicks');
			console.log(clicksTrend60);
			clicksTrend90 = createTrend(days90, 'x','clicks');
			console.log(clicksTrend90);

			const clicksCtx = document.getElementById('gscClicksChart')
	
			new Chart(clicksCtx, {
				type: 'line',
				data: {
					datasets: [{
						label: 'Clicks',
						data: stats,
					}]
				},
				options: {
					parsing: {
						xAxisKey: 'date',
						yAxisKey: 'clicks'
					},
					elements: {
						point: {
							radius: 0
						}
					},
					maintainAspectRatio: false,
					plugins: {
						annotation: {
							annotations: annotations
						}
					}
				}
			});

			const impressionsCtx = document.getElementById('gscImpressionsChart')
			new Chart(impressionsCtx, {
				type: 'line',
				data: {
					datasets: [{
						label: 'Impresiones',
						data: stats,
					}]
				},
				options: {
					parsing: {
						xAxisKey: 'date',
						yAxisKey: 'impressions'
					},
					elements: {
						point: {
							radius: 0
						}
					},
					maintainAspectRatio: false,
					plugins: {
						annotation: {
							annotations: annotations
						}
					}
				}
			});

			annotations['firstPage'] = {
				type: 'line',
				yMin: 10,
				yMax: 10,
				borderColor: 'red',
				borderWidth: 2,
			}

			const positionCtx = document.getElementById('gscPositionChart')
			new Chart(positionCtx, {
				type: 'line',
				data: {
					datasets: [{
						label: 'Posicion',
						data: stats,
					}]
				},
				options: {
					parsing: {
						xAxisKey: 'date',
						yAxisKey: 'position'
					},
					scales: {
						y: {
							min: 1,

							reverse: true
						}
					},
					elements: {
						point: {
							radius: 0
						}
					},
					maintainAspectRatio: false,
					plugins: {
						annotation: {
							annotations: annotations
						}
					}
				}
			});

		});	
</script>
<div class="grid grid-cols-4">
	<div class="col-span-4">
		<div class="text-2xl">{post.title}</div>
		<div class="text-md mt-2">https://pisapapeles.net/{post.slug}/</div>
		<div class="text-md mt-2">Categoría: {post.category_name}</div>
		<div class="text-md mt-2">Autor: {post.author}</div>
		<div class="text-md mt-2">Publicado: {dayjs().to(dayjs(post.published_at))}</div>
		<div class="text-md mt-2">Modificado: {dayjs().to(dayjs(post.modified_at))}</div>
		<div class="text-md mt-2">Última actualización de SC: {dayjs().to(dayjs(post.last_updated))}</div>
		<div class="text-md mt-2"> <form action="refresh" method="post"><input type="hidden" name="slug" id="slug" value="{post.slug}"><button formaction="" class="p-2 bg-slate-400 rounded-md">Actualizar</button></form></div>
	</div>
	<div class="border border-slate-400 rounded-md p-2 mt-2 mr-1">
		<div class="text-xl text-center">
			Página normal
			{#if post.main.verdict}
				<span class="text-green-500"><i class="fa-solid fa-circle-check"></i></span>
			{:else}
				<span class="text-red-500"><i class="fa-solid fa-circle-xmark"></i></span>
			{/if} 
		</div>
		<div class="text-md">Indexado: {post.main.indexed ? "Sí" : "No" }</div>
		<div class="text-md">Último crawl: {dayjs().to(dayjs(post.main.last_crawl_time))}</div>

	</div>
	<div class="border border-slate-400 rounded-md p-2 mt-2 mx-1">
		<div class="text-xl text-center">
			Página AMP
			{#if post.amp.verdict}
				<span class="text-green-500"><i class="fa-solid fa-circle-check"></i></span>
			{:else}
				<span class="text-red-500"><i class="fa-solid fa-circle-xmark"></i></span>
			{/if} 
		</div>
		<div class="text-md">Indexado: {post.amp.indexed ? "Sí" : "No" }</div>
		<div class="text-md">Último crawl: {dayjs().to(dayjs(post.amp.last_crawl_time))}</div>
	</div>
	<div class="border border-slate-400 mt-2 ml-1 col-span-2 p-2 rounded-md">
		<div class="text-xl text-center">Tendencias</div>
		<div class="grid grid-cols-4">
			<div class="text-center">Item</div>
			<div class="text-center">Impresiones</div>
			<div class="text-center">Clicks</div>
			<div class="text-center">Posición</div>
			<div class="text-center">30 días</div>
			
			<div class="text-center">
				{#if impressionsTrend30.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if impressionsTrend30.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{impressionsTrend30.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if clicksTrend30.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if clicksTrend30.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{clicksTrend30.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if positionTrend30.slope > 0.005}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else if positionTrend30.slope < -0.005}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{positionTrend30.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">60 días</div>
			<div class="text-center">
				{#if impressionsTrend60.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if impressionsTrend60.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{impressionsTrend60.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if clicksTrend60.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if clicksTrend60.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{clicksTrend60.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if positionTrend60.slope > 0.005}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else if positionTrend60.slope < -0.005}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{positionTrend60.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">90 días</div>
			<div class="text-center">
				{#if impressionsTrend90.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if impressionsTrend90.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{impressionsTrend90.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if clicksTrend90.slope > 0.5}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else if clicksTrend90.slope < -0.5}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{clicksTrend90.slope.toFixed(2)}</span>
			</div>
			<div class="text-center">
				{#if positionTrend90.slope > 0.005}
					<span class="text-red-500"><i class="fa-solid fa-arrow-down"></i></span>
				{:else if positionTrend90.slope < -0.005}
					<span class="text-green-500"><i class="fa-solid fa-arrow-up"></i></span>
				{:else}
				<span class="text-slate-500"><i class="fa-solid fa-arrow-right"></i></span>
				{/if}
				<span class="text-slate-500">{positionTrend90.slope.toFixed(2)}</span>
			</div>
		</div>
	</div>
	<div class="h-96 col-span-4 border border-slate-400 mt-2 rounded-md p-2">
		<canvas id="gscImpressionsChart"></canvas>
	</div>
	<div class="h-96 col-span-4 border border-slate-400 mt-2 rounded-md p-2">
		<canvas id="gscClicksChart"></canvas>
	</div>
	<div class="h-96 col-span-4 border border-slate-400 mt-2 rounded-md p-2">
		<canvas id="gscPositionChart"></canvas>
	</div>
</div>