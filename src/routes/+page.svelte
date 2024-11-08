<script lang="ts">
	import URLForm from '$lib/components/URLForm.svelte';
	import YouTubeLinksList from '$lib/components/YouTubeLinksList.svelte';
	import { user } from '$lib/stores/auth';
</script>

{#if $user}
	<URLForm />
{/if}
<YouTubeLinksList />
