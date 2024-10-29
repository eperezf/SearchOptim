<script>
  import "../app.css";
	import '@fortawesome/fontawesome-free/css/all.min.css'
</script>
<div class="p-2 m-2 rounded-md shadow-md border-white/20 border bg-gray-700 text-white flex items-center gap-2">
	<div class="text-2xl">Pisapapeles Search Console</div>
	<a href="/" class="hover:bg-slate-600 transition-all p-2 rounded-md">Inicio</a>
	<a href="/inspect" class="hover:bg-slate-600 transition-all p-2 rounded-md">Inspector</a>
</div>
<div class="p-2 bg-slate-100 rounded-md m-2">
	<slot />
</div>
