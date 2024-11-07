<script lang="ts">
	import { db } from '../firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import YouTubeLink from './YouTubeLink.svelte';
	import type { YouTubeLink as YouTubeLinkType } from '../types';

	let links: YouTubeLinkType[] = []; // Explicitly type links as an array of YouTubeLinkType

	onMount(() => {
		const q = query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			links = snapshot.docs.map((doc) => ({
				id: doc.id,
				title: doc.data().title,
				url: doc.data().url,
				createdAt: doc.data().createdAt,
				userId: doc.data().userId,
				username: doc.data().username,
				photoURL: doc.data().photoURL,
				likeCount: doc.data().likeCount || 0
			}));
		});
		return () => unsubscribe();
	});
</script>

<ul class="space-y-4">
	{#each links as link}
		<li class="rounded border p-4">
			<YouTubeLink {link} />
		</li>
	{/each}
</ul>
