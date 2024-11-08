<script lang="ts">
	import { onDestroy } from 'svelte';
	import { db } from '$lib/utils/firebase';
	import { onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
	import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
	import { user } from '$lib/stores/auth';
	import { toggleLike as toggleLikeUtil } from '$lib/utils/likeUtils';
	import type { YouTubeLink } from '$lib/types';
	import { extractYouTubeVideoID } from '$lib/utils/youtube';

	export let link: YouTubeLink;

	// Reactive subscription to user store
	$: currentUser = $user;

	let isEditing = false;
	let editTitle = link.title;
	let editUrl = link.url;
	let likedByUser = false;

	// Loading state for iframe
	let isIframeLoading = true;

	// Listener unsubscribe function
	let unsubscribeLikeStatus: (() => void) | null = null;

	// Extract video ID
	$: videoID = extractYouTubeVideoID(link.url);

	// Embed URL
	$: embedURL = videoID ? `https://www.youtube.com/embed/${videoID}` : null;

	// Like status listener
	$: if (currentUser && link.id) {
		if (unsubscribeLikeStatus) {
			unsubscribeLikeStatus();
		}

		const likeDocRef = doc(db, 'youtubeLinks', link.id, 'likes', currentUser.uid);

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
			console.log(`Unsubscribed from likes for Link ID: ${link.id}`);
		}
	});

	// Toggle like
	const toggleLike = async () => {
		if (!link.id || !currentUser || !videoID) return;

		try {
			await toggleLikeUtil(link, currentUser, likedByUser);
			console.log(`Successfully toggled like for Link ID: ${link.id}`);
		} catch (error) {
			console.error('Error updating like:', error);
		}
	};

	// Handle delete
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

	// Handle edit
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

	// Handle iframe load
	const handleIframeLoad = () => {
		isIframeLoading = false;
	};
</script>

<div class="bg-base-200 mb-2 mt-4">
	<!-- Display Embedded Video -->
	{#if embedURL}
		<div class="relative aspect-[16/9] w-full overflow-hidden rounded">
			{#if isIframeLoading}
				<!-- Loading Spinner Overlay -->
				<div class="bg-base-200 absolute inset-0 flex items-center justify-center">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{/if}
			<iframe
				src={embedURL}
				title={`YouTube video: ${link.title}`}
				frameborder="0"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				class="h-full w-full"
				on:load={handleIframeLoad}
			></iframe>
		</div>
		<h3 class="break-words px-4 pt-4 text-2xl font-bold sm:text-3xl">{link.title}</h3>
	{:else}
		<!-- Error Message for Invalid URL -->
		<div class="rounded bg-red-100 p-4 text-red-700">
			<p>Invalid YouTube URL provided.</p>
		</div>
	{/if}

	<div class="p-4">
		<!-- User Info -->
		<div class="flex justify-between">
			<div class="flex">
				<img src={link.photoURL} alt="User Avatar" class="mr-3 h-10 w-10 rounded-full" />
				<div>
					<p class="font-bold">{link.username}</p>
					<p class="text-sm text-gray-500">
						{link.createdAt
							? link.createdAt.toDate().toLocaleString(undefined, {
									dateStyle: 'medium',
									timeStyle: 'short'
								})
							: 'Unknown date'}
					</p>
				</div>
			</div>

			<!-- Like Button -->
			<div>
				<button
					on:click={toggleLike}
					class={`btn btn-sm sm:btn-md ${
						likedByUser ? 'btn-primary' : 'btn-neutral'
					} ${!currentUser ? 'btn-disabled cursor-not-allowed opacity-50' : ''}`}
					disabled={!currentUser}
					title={!currentUser ? 'Please log in to like' : 'Like this video'}
				>
					{likedByUser ? '❤️' : '🤍'}
					{link.likeCount || 0}
				</button>
			</div>
		</div>

		<!-- Edit Form -->
		{#if isEditing}
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
				<div class="flex space-x-2">
					<button on:click={handleEdit} class="btn btn-success">Save</button>
					<button on:click={() => (isEditing = false)} class="btn btn-neutral">Cancel</button>
				</div>
			</div>
		{:else}
			<!-- Show Edit and Delete Buttons only to the author -->
			{#if currentUser && currentUser.uid === link.userId}
				<div class="mt-2 flex space-x-2">
					<button on:click={() => (isEditing = true)} class="btn btn-sm btn-warning">Edit</button>
					<button on:click={handleDelete} class="btn btn-sm btn-error">Delete</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
