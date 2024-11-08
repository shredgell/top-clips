<script lang="ts">
	import { toggleLike as toggleLikeUtil } from '$lib/utils/likeUtils';
	import { user } from '$lib/auth/authStore';
	import { db } from '$lib/utils/firebase';
	import { onSnapshot, doc } from 'firebase/firestore';
	import { onDestroy } from 'svelte'; // Import onDestroy
	import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';

	import type { YouTubeLink } from '$lib/types';

	export let link: YouTubeLink;
	let likedByUser = false;

	// Reactive subscription to user store
	$: currentUser = $user;

	// Define the like status listener
	let unsubscribeLikeStatus: (() => void) | null = null;

	// Watch for changes to `link.id` and `currentUser`
	$: if (currentUser && link.id) {
		// If there's an existing subscription, unsubscribe before creating a new one
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
		}

		// Create a Firestore document reference with valid parameters
		const likeDocRef = doc(db, `youtubeLinks/${link.id}/likes/${currentUser.uid}`);

		// Subscribe to Firestore changes on the like status document
		unsubscribeLikeStatus = onSnapshot(
			likeDocRef,
			(docSnapshot: DocumentSnapshot<DocumentData>) => {
				likedByUser = docSnapshot.exists();
			}
		);
	} else {
		likedByUser = false;
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
			unsubscribeLikeStatus = null;
		}
	}

	// Cleanup on destroy
	onDestroy(() => {
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
		}
	});

	// Toggle like function
	const toggleLike = async () => {
		if (!link.id || !currentUser) return;

		try {
			await toggleLikeUtil(link, currentUser, likedByUser);
		} catch (error) {
			console.error('Error updating like:', error);
		}
	};
</script>

<div class="flex flex-col justify-end px-3">
	<div class="flex">
		<button
			on:click={toggleLike}
			class={`btn btn-sm sm:btn-md ${likedByUser ? 'btn-primary' : 'btn-neutral'} ${!currentUser ? 'btn-disabled' : ''}`}
			disabled={!currentUser}
			title={!currentUser ? 'Please log in to like' : 'Like this video'}
		>
			{likedByUser ? '❤️' : '🤍'}
			{link.likeCount || 0}
		</button>
	</div>
</div>
