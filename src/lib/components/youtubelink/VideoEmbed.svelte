<script lang="ts">
	import { extractYouTubeVideoID } from '$lib/utils/youtubeUtils';

	export let url: string;
	export let title: string;

	let isIframeLoading = true;
	const videoID = extractYouTubeVideoID(url);
	const embedURL = videoID ? `https://www.youtube.com/embed/${videoID}` : null;

	const handleIframeLoad = () => {
		isIframeLoading = false;
	};
</script>

{#if embedURL}
	<div class="relative aspect-[16/9] w-full overflow-hidden rounded">
		{#if isIframeLoading}
			<div class="bg-base-200 absolute inset-0 flex items-center justify-center">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{/if}
		<iframe
			src={embedURL}
			title={`YouTube video: ${title}`}
			frameborder="0"
			loading="lazy"
			allow="autoplay; encrypted-media; picture-in-picture"
			sandbox="allow-scripts allow-same-origin"
			allowfullscreen
			class="h-full w-full"
			on:load={handleIframeLoad}
		></iframe>
	</div>
{:else}
	<div class="rounded bg-red-100 p-4 text-red-700">
		<p>Invalid YouTube URL provided.</p>
	</div>
{/if}
