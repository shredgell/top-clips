<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import URLForm from '$lib/components/URLForm.svelte';
	import YouTubeLinksList from '$lib/components/YouTubeLinksList.svelte';
	import { user } from '$lib/stores/auth';
</script>

<Header />
{#if $user}
	<URLForm />
{/if}
<YouTubeLinksList />
