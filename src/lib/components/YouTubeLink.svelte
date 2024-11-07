<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
	import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
	import { user } from '$lib/stores/auth';
	import { toggleLike as toggleLikeUtil } from '$lib/utils/likeUtils';
	import type { YouTubeLink } from '$lib/types';
	import { onDestroy } from 'svelte';

	export let link: YouTubeLink;

	// Reactive subscription to user store using Svelte's $ syntax
	$: currentUser = $user;

	let isEditing = false;
	let editTitle = link.title;
	let editUrl = link.url;
	let likedByUser = false;

	// Explicit type annotation for unsubscribeLikeStatus
	let unsubscribeLikeStatus: (() => void) | null = null;

	// Set up a real-time listener for the user's like status
	$: if (currentUser && link.id) {
		// If there's an existing subscription, unsubscribe before creating a new one
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
		}

		// Reference to the specific like document
		const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);

		// Subscribe to changes in the like document
		unsubscribeLikeStatus = onSnapshot(
			likeDocRef,
			(docSnapshot: DocumentSnapshot<DocumentData>) => {
				likedByUser = docSnapshot.exists();
			}
		);
	} else {
		// If there's no current user or link ID, reset like status and unsubscribe if necessary
		likedByUser = false;
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
			unsubscribeLikeStatus = null;
		}
	}

	// Clean up the listener when the component is destroyed
	onDestroy(() => {
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
			console.log(`Unsubscribed from likes for Link ID: ${link.id}`);
		}
	});

	// Toggle like status without optimistic UI updates
	const toggleLike = async () => {
		if (!link.id || !currentUser) return;

		try {
			await toggleLikeUtil(link, currentUser, likedByUser);
			console.log(`Successfully toggled like for Link ID: ${link.id}`);
		} catch (error) {
			console.error('Error updating like:', error);
		}
	};

	// Delete the post if the current user is the author
	const handleDelete = async () => {
		if (currentUser && currentUser.uid === link.userId) {
			try {
				await deleteDoc(doc(db, 'youtubeLinks', link.id));
				console.log(`Deleted Link ID: ${link.id}`);
			} catch (error) {
				console.error('Error deleting document:', error);
				alert('Failed to delete the post.');
			}
		}
	};

	// Update post title and URL if the current user is the author
	const handleEdit = async () => {
		if (currentUser && currentUser.uid === link.userId && editUrl && editTitle) {
			try {
				await updateDoc(doc(db, 'youtubeLinks', link.id), {
					title: editTitle,
					url: editUrl
				});
				isEditing = false;
				console.log(`Updated Link ID: ${link.id}`);
			} catch (error) {
				console.error('Error updating document:', error);
				alert('Failed to update the post.');
			}
		}
	};
</script>

<!-- Component Template -->
<div class="space-y-2 rounded p-4">
	<div class="flex items-center">
		<img src={link.photoURL} alt="User Avatar" class="mr-3 h-10 w-10 rounded-full" />
		<div>
			<p class="font-bold">{link.username}</p>
			<p class="text-sm text-gray-500">
				{link.createdAt ? link.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
			</p>
		</div>
	</div>

	{#if isEditing}
		<!-- Edit Form -->
		<div class="space-y-2">
			<input
				type="text"
				bind:value={editTitle}
				class="input input-bordered w-full"
				placeholder="Edit title"
			/>
			<input
				type="url"
				bind:value={editUrl}
				class="input input-bordered w-full"
				placeholder="Edit URL"
			/>
			<button on:click={handleEdit} class="btn btn-success">Save</button>
			<button on:click={() => (isEditing = false)} class="btn btn-neutral">Cancel</button>
		</div>
	{:else}
		<!-- Display Title and URL -->
		<div>
			<h3 class="text-lg font-semibold">{link.title}</h3>
			<a href={link.url} target="_blank" class="text-primary hover:underline">Watch on YouTube</a>
		</div>
		<!-- Like Button -->
		<button
			on:click={toggleLike}
			class={`btn btn-sm ${
				likedByUser ? 'btn-error' : 'btn-neutral'
			} ${!currentUser ? 'btn-disabled cursor-not-allowed' : ''}`}
			disabled={!currentUser}
			title={!currentUser ? 'Please log in to like' : 'Like this link'}
		>
			{likedByUser ? '❤️' : '🤍'}
			{link.likeCount || 0}
		</button>
		<!-- Show Edit and Delete Buttons only to the author -->
		{#if currentUser && currentUser.uid === link.userId}
			<button on:click={() => (isEditing = true)} class="btn btn-sm btn-warning">Edit</button>
			<button on:click={handleDelete} class="btn btn-sm btn-error">Delete</button>
		{/if}
	{/if}
</div>
