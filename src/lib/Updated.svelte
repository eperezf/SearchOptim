<script>
    /** @type {import('./$types').PageData} */
		export let value = false;
		
</script>

{#if value == 'refreshed'}
<span class="p-2 bg-green-200 mx-1 rounded-md text-green-700 border border-white/20"><i class="fa-solid fa-circle-check"></i></span>
{:else}
<span class="p-2 bg-red-200 mx-1 rounded-md text-red-700 border border-white/20"><i class="fa-solid fa-circle-xmark"></i></span>
{/if}
