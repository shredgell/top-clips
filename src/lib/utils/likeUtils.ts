// src/lib/utils/likeUtils.ts
import { db } from '$lib/utils/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { YouTubeLink } from '$lib/types';

/**
 * Toggles the like status of a YouTube link for the current user.
 * @param link - The YouTube link object.
 * @param currentUser - The currently authenticated user.
 * @param likedByUser - Boolean indicating if the user has already liked the link.
 */
export const toggleLike = async (
	link: YouTubeLink,
	currentUser: User,
	likedByUser: boolean
): Promise<void> => {
	// Validate inputs
	if (!link?.id || !currentUser?.uid) {
		throw new Error('Invalid link or user information.');
	}

	const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);
	const linkRef = doc(db, 'youtubeLinks', link.id);

	try {
		await runTransaction(db, async (transaction) => {
			const linkDoc = await transaction.get(linkRef);
			if (!linkDoc.exists()) {
				throw new Error('YouTube link does not exist.');
			}

			const currentLikeCount = linkDoc.data().likeCount || 0;

			if (!likedByUser) {
				// Like the post
				transaction.set(likeDocRef, { userId: currentUser.uid, likedAt: new Date() });
				transaction.update(linkRef, { likeCount: increment(1) });
			} else {
				// Ensure likeCount doesn't go below zero
				if (currentLikeCount > 0) {
					transaction.delete(likeDocRef);
					transaction.update(linkRef, { likeCount: increment(-1) });
				} else {
					// Optionally, handle the case where likeCount is already zero
					console.warn('Like count is already zero.');
				}
			}
		});
		console.log(`Successfully ${likedByUser ? 'unliked' : 'liked'} the video: ${link.id}`);
	} catch (error) {
		console.error('Transaction failed: ', error);
		throw error; // Re-throw to allow handling in the calling function
	}
};
