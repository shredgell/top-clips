<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<div class="flex min-h-screen flex-col items-center p-4">
	<div class="flex w-full max-w-2xl flex-col justify-center">
		<Navbar />
		<slot />
	</div>
</div>
