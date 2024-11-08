<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
	import YouTubeLink from '$lib/components/youtubelink/YouTubeLink.svelte';
	import type { YouTubeLink as YouTubeLinkType } from '$lib/types';
	import { onDestroy } from 'svelte';

	// Define sort options
	type SortOption = 'mostRecent' | 'mostPopular' | 'oldestFirst';

	let links: YouTubeLinkType[] = [];
	let sortOption: SortOption = 'mostRecent';

	// Unsubscribe function to clear Firestore listener
	let unsubscribe: () => void;

	// Create Firestore query based on selected sort option
	const createQuery = (option: SortOption) => {
		const collectionRef = collection(db, 'youtubeLinks');
		switch (option) {
			case 'mostRecent':
				return query(collectionRef, orderBy('createdAt', 'desc'));
			case 'mostPopular':
				return query(collectionRef, orderBy('likeCount', 'desc'), orderBy('createdAt', 'desc'));
			case 'oldestFirst':
				return query(collectionRef, orderBy('createdAt', 'asc'));
			default:
				return query(collectionRef, orderBy('createdAt', 'desc'));
		}
	};

	// Function to subscribe to Firestore collection based on sort option
	const subscribeToLinks = (option: SortOption) => {
		// Unsubscribe from previous listener if it exists
		if (unsubscribe) {
			console.log('Unsubscribing from previous listener.');
			unsubscribe();
		}

		// Set up Firestore query and listener
		const q = createQuery(option);
		console.log(`Subscribing to Firestore with sort option: ${option}`);
		unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				console.log(`Received snapshot with ${snapshot.size} documents.`);
				// Update links array with new data
				links = snapshot.docs.map((doc) => {
					const data = doc.data();
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
			}
		);
	};

	// Remove the onMount subscription to prevent multiple listeners
	// onMount(() => {
	// 	subscribeToLinks(sortOption);
	// });

	// Reactive block to handle changes in the sort option
	$: if (sortOption) {
		console.log(`Sort option changed to: ${sortOption}`);
		subscribeToLinks(sortOption);
	}

	// Clean up the Firestore listener when component is destroyed
	onDestroy(() => {
		if (unsubscribe) {
			console.log('Cleaning up Firestore listener on destroy.');
			unsubscribe();
		}
	});
</script>

<!-- Sorting Control UI -->
<div class="mb-4 flex items-center justify-end">
	<label for="sort" class="mr-2 font-semibold">Sort By:</label>
	<select id="sort" bind:value={sortOption} class="select select-bordered">
		<option value="mostRecent">Most Recent</option>
		<option value="mostPopular">Most Popular</option>
		<option value="oldestFirst">Oldest First</option>
	</select>
</div>

<!-- List of YouTube Links -->
{#each links as link (link.id)}
	<YouTubeLink {link} />
{/each}
