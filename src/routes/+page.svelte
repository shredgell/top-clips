<script lang="ts">
	import URLForm from '$lib/components/URLForm.svelte';
	import YouTubeLinksList from '$lib/components/youtubelink/YouTubeLinksList.svelte';
	import { user } from '$lib/auth/authStore';
</script>

{#if $user}
	<URLForm />
{/if}
<YouTubeLinksList />
