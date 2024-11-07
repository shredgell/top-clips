<script lang="ts">
	import { db } from '../firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import type { YouTubeLink } from '../types';

	let links: YouTubeLink[] = [];

	onMount(() => {
		const q = query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			links = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			})) as YouTubeLink[];
		});
		return () => unsubscribe();
	});
</script>

<ul class="space-y-4 p-4">
	{#each links as link}
		<li class="rounded border p-4">
			<h3 class="text-lg font-semibold">{link.title}</h3>
			<a href={link.url} target="_blank" class="text-blue-500 underline">Watch on YouTube</a>
			<p class="text-sm text-gray-600">Posted by {link.username}</p>
		</li>
	{/each}
</ul>
