<script lang="ts">
	import type { YouTubeLink } from '$lib/types';

	export let link: YouTubeLink;
</script>

<div class="space-y-2">
	<h3 class="break-words text-2xl font-bold sm:text-3xl">{link.title}</h3>
	<div class="flex justify-between">
		<div class="flex">
			<img src={link.photoURL} alt="User Avatar" class="mr-3 h-10 w-10 rounded-full" />
			<div>
				<p class="font-bold">{link.username}</p>
				<p class="text-sm text-gray-500">
					{link.createdAt
						? link.createdAt.toDate().toLocaleString(undefined, {
								dateStyle: 'medium',
								timeStyle: 'short'
							})
						: 'Unknown date'}
				</p>
			</div>
		</div>
	</div>
</div>
