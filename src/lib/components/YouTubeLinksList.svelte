<script lang="ts">
	import { db } from '../firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import YouTubeLink from './YouTubeLink.svelte';
	import type { YouTubeLink as LinkType } from '../types';

	let links: LinkType[] = [];

	onMount(() => {
		const q = query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			links = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			})) as LinkType[];
		});
		return () => unsubscribe();
	});
</script>

<ul class="space-y-4 p-4">
	{#each links as link}
		<YouTubeLink {link} />
	{/each}
</ul>
