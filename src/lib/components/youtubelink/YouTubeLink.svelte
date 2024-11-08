<script lang="ts">
	import VideoEmbed from './VideoEmbed.svelte';
	import VideoInfo from './VideoInfo.svelte';
	import LikeButton from './LikeButton.svelte';

	import DeleteButton from './DeleteButton.svelte';

	import { user } from '$lib/auth/authStore';
	import type { YouTubeLink } from '$lib/types';

	export let link: YouTubeLink;
</script>

<div class="bg-base-200 mb-2 mt-4">
	<VideoEmbed url={link.url} title={link.title} />

	<div class="space-y-2 p-4">
		<div class="flex w-full justify-between">
			<VideoInfo {link} />
			<LikeButton {link} />
		</div>
		{#if $user && $user.uid === link.userId}
			<DeleteButton {link} />
		{/if}
	</div>
</div>
