<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import YouTubeLink from '$lib/components/YouTubeLink.svelte';
	import type { YouTubeLink as YouTubeLinkType } from '$lib/types';

	// Type-only imports
	import type { Query, QuerySnapshot, DocumentData } from 'firebase/firestore';

	import { onDestroy, onMount } from 'svelte'; // Correct import from 'svelte'

	// Define sorting options
	type SortOption = 'mostRecent' | 'mostPopular';

	let links: YouTubeLinkType[] = [];

	// Default sorting option
	let sortOption: SortOption = 'mostRecent';

	let unsubscribe: () => void;

	// Function to create Firestore query based on sort option
	const createQuery = (option: SortOption): Query<DocumentData, DocumentData> => {
		switch (option) {
			case 'mostRecent':
				return query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
			case 'mostPopular':
				return query(collection(db, 'youtubeLinks'), orderBy('likeCount', 'desc'));
			default:
				// Fallback to mostRecent to ensure the function always returns a Query
				return query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
		}
	};

	// Function to subscribe to Firestore based on sort option
	const subscribeToLinks = (option: SortOption) => {
		// If there's an existing subscription, unsubscribe before creating a new one
		if (unsubscribe) {
			unsubscribe();
		}

		const q = createQuery(option);
		unsubscribe = onSnapshot(
			q,
			(snapshot: QuerySnapshot<DocumentData>) => {
				links = snapshot.docs.map((doc) => {
					const data = doc.data();
					console.log(`Fetched Link ID: ${doc.id}, likeCount: ${data.likeCount}`);
					return {
						id: doc.id,
						title: data.title,
						url: data.url,
						createdAt: data.createdAt,
						userId: data.userId,
						username: data.username,
						photoURL: data.photoURL,
						likeCount: data.likeCount || 0
					};
				});
			},
			(error) => {
				console.error('Error fetching YouTube links:', error);
				// Optionally, set an error state to inform the user
			}
		);
	};

	// Initialize subscription on component mount
	onMount(() => {
		subscribeToLinks(sortOption);
	});

	// Reactive block to handle sorting option changes
	$: if (sortOption) {
		subscribeToLinks(sortOption);
	}

	// Clean up the listener on component destroy
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
			console.log('Unsubscribed from Firestore links');
		}
	});
</script>

<!-- Sorting Control UI -->
<div class="flex items-center justify-end">
	<label for="sort" class="mr-2 font-semibold">Sort By:</label>
	<select id="sort" bind:value={sortOption} class="select select-bordered">
		<option value="mostRecent">Most Recent</option>
		<option value="mostPopular">Most Popular</option>
	</select>
</div>

<!-- List of YouTube Links -->

{#each links as link}
	<YouTubeLink {link} />
{/each}
