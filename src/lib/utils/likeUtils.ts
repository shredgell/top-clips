// src/lib/utils/likeUtils.ts
import { db } from '$lib/utils/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { YouTubeLink } from '$lib/types';

export const toggleLike = async (link: YouTubeLink, currentUser: User, likedByUser: boolean) => {
	const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);
	const linkRef = doc(db, 'youtubeLinks', link.id);

	await runTransaction(db, async (transaction) => {
		if (!likedByUser) {
			// Like the post
			transaction.set(likeDocRef, { userId: currentUser.uid });
			transaction.update(linkRef, { likeCount: increment(1) });
		} else {
			// Unlike the post
			transaction.delete(likeDocRef);
			transaction.update(linkRef, { likeCount: increment(-1) });
		}
	});
};
