<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { user } from '$lib/auth/authStore';
	import { get } from 'svelte/store';
	import { extractYouTubeVideoID, fetchYouTubeVideoTitle } from '$lib/utils/youtubeUtils';

	let url = '';
	let title = '';
	let error = '';

	const handleSubmit = async () => {
		const currentUser = get(user);
		if (!currentUser) {
			error = 'Please log in to submit a link.';
			return;
		}

		const videoID = extractYouTubeVideoID(url);
		if (!videoID) {
			error = 'Invalid YouTube URL.';
			return;
		}

		title = (await fetchYouTubeVideoTitle(videoID)) ?? 'Untitled Video';

		try {
			await addDoc(collection(db, 'youtubeLinks'), {
				url,
				title,
				userId: currentUser.uid,
				username: currentUser.displayName,
				photoURL: currentUser.photoURL,
				createdAt: serverTimestamp()
			});

			// Reset input fields after submission
			url = '';
			error = '';
		} catch (e) {
			console.error('Error adding document: ', e);
			error = 'Failed to submit the link.';
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-2">
	<input
		type="url"
		bind:value={url}
		placeholder="YouTube URL"
		required
		class="input input-bordered w-full"
	/>
	<button type="submit" class="btn btn-success">Submit</button>
	{#if error}
		<p class="text-error">{error}</p>
	{/if}
</form>
