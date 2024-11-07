<script lang="ts">
	import { getDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
	import { user } from '../stores/auth';
	import { db } from '../firebase';
	import { get } from 'svelte/store';

	export let videoId: string;
	export let likes: number;
	export let likedByCurrentUser: boolean;

	let currentUser = get(user);

	// Toggle like function
	const toggleLike = async (videoId: string) => {
		if (!currentUser) {
			console.log('User must be logged in to like a video');
			return;
		}

		const videoRef = doc(db, 'youtubeLinks', videoId);
		const likeRef = doc(videoRef, 'likes', currentUser.uid);

		try {
			await runTransaction(db, async (transaction) => {
				const videoDoc = await transaction.get(videoRef);
				const isLiked = likedByCurrentUser;

				// Increment or decrement likes based on the user's current like status
				transaction.update(videoRef, { likes: videoDoc.data().likes + (isLiked ? -1 : 1) });

				if (isLiked) {
					// Remove like
					transaction.delete(likeRef);
				} else {
					// Add like
					transaction.set(likeRef, { userId: currentUser.uid, timestamp: serverTimestamp() });
				}
			});
		} catch (error) {
			console.error('Error updating like: ', error);
		}
	};
</script>

<div>
	<button on:click={() => toggleLike(videoId)}>
		{likedByCurrentUser ? 'Unlike' : 'Like'} ({likes})
	</button>
</div>
