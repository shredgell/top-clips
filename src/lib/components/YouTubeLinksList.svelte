<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import YouTubeLink from '$lib/components/YouTubeLink.svelte';
	import type { YouTubeLink as YouTubeLinkType } from '$lib/types';

	let links: YouTubeLinkType[] = []; // Explicitly type links as an array of YouTubeLinkType

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

	// Clean up the listener on component destroy
	onDestroy(() => unsubscribe());
</script>

<ul class="space-y-4 p-4">
	{#each links as link}
		<li class="card bg-base-200 p-4">
			<YouTubeLink {link} />
		</li>
	{/each}
</ul>
