<script lang="ts">
	import { db } from '../firebase';
	import {
		doc,
		getDoc,
		setDoc,
		deleteDoc,
		updateDoc,
		increment,
		runTransaction
	} from 'firebase/firestore';
	import { user } from '../stores/auth';
	import { get } from 'svelte/store';
	import type { YouTubeLink } from '../types';
	import { writable } from 'svelte/store';

	export let link: YouTubeLink;

	const currentUser = get(user);
	let isEditing = writable(false);
	let editTitle = link.title;
	let editUrl = link.url;
	let likeCount = link.likeCount || 0;
	let likedByUser = false;

	// Fetch the initial like status
	const checkUserLikeStatus = async () => {
		if (currentUser && link.id) {
			const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);
			const docSnapshot = await getDoc(likeDocRef);
			likedByUser = docSnapshot.exists();
		}
	};

	checkUserLikeStatus();

	// Toggle like status with optimistic UI
	const toggleLike = async () => {
		if (!link.id || !currentUser) return;

		// Optimistic UI updates
		const originalLikeCount = likeCount;
		const originalLikedByUser = likedByUser;

		likedByUser = !likedByUser;
		likeCount = likedByUser ? likeCount + 1 : likeCount - 1;

		try {
			const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);
			await runTransaction(db, async (transaction) => {
				const linkRef = doc(db, 'youtubeLinks', link.id);
				if (likedByUser) {
					// Like the post
					transaction.set(likeDocRef, { userId: currentUser.uid });
					transaction.update(linkRef, { likeCount: increment(1) });
				} else {
					// Unlike the post
					transaction.delete(likeDocRef);
					transaction.update(linkRef, { likeCount: increment(-1) });
				}
			});
		} catch (error) {
			console.error('Error updating like:', error);
			likedByUser = originalLikedByUser;
			likeCount = originalLikeCount;
		}
	};

	// Delete the post if current user is the author
	const handleDelete = async () => {
		if (currentUser && currentUser.uid === link.userId) {
			await deleteDoc(doc(db, 'youtubeLinks', link.id));
		}
	};

	// Update post title and URL if current user is the author
	const handleEdit = async () => {
		if (currentUser && currentUser.uid === link.userId && editUrl && editTitle) {
			await updateDoc(doc(db, 'youtubeLinks', link.id), {
				title: editTitle,
				url: editUrl
			});
			isEditing.set(false);
		}
	};
</script>

<!-- Component Template -->
<div class="rounded bg-white p-4 shadow">
	<div class="flex items-center">
		<img src={link.photoURL} alt="User Avatar" class="mr-3 h-10 w-10 rounded-full" />
		<div>
			<p class="font-bold">{link.username}</p>
			<p class="text-sm text-gray-500">
				{link.createdAt ? link.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
			</p>
		</div>
	</div>

	{#if $isEditing}
		<!-- Edit Form -->
		<div class="mt-2">
			<input
				type="text"
				bind:value={editTitle}
				class="w-full rounded border p-2"
				placeholder="Edit title"
			/>
			<input
				type="url"
				bind:value={editUrl}
				class="mt-2 w-full rounded border p-2"
				placeholder="Edit URL"
			/>
			<button on:click={handleEdit} class="mt-2 rounded bg-green-500 px-4 py-2 text-white"
				>Save</button
			>
			<button
				on:click={() => isEditing.set(false)}
				class="mt-2 rounded bg-gray-500 px-4 py-2 text-white">Cancel</button
			>
		</div>
	{:else}
		<!-- Display Title and URL -->
		<div class="mt-2">
			<h3 class="text-lg font-semibold">{link.title}</h3>
			<a href={link.url} target="_blank" class="text-blue-500 underline">Watch on YouTube</a>
		</div>
		<!-- Like Button -->
		<button on:click={toggleLike} class="mt-2 rounded bg-blue-500 px-2 py-1 text-sm text-white">
			{likedByUser ? '👍 Unlike' : '👍 Like'}
			{likeCount}
		</button>
	{/if}

	<!-- Show Edit and Delete Buttons only to the author -->
	{#if currentUser && currentUser.uid === link.userId}
		<button on:click={() => isEditing.set(true)} class="mt-2 text-sm text-yellow-500">Edit</button>
		<button on:click={handleDelete} class="mt-2 text-sm text-red-500">Delete</button>
	{/if}
</div>
