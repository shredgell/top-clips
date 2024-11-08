<script lang="ts">
	import { db } from '$lib/utils/firebase';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { user } from '$lib/stores/auth';
	import { get } from 'svelte/store';

	let url = '';
	let title = '';
	let error = '';

	const handleSubmit = async () => {
		const currentUser = get(user);
		if (!currentUser) {
			error = 'Please log in to submit a link.';
			return;
		}

		try {
			await addDoc(collection(db, 'youtubeLinks'), {
				url,
				title,
				userId: currentUser.uid,
				username: currentUser.displayName,
				photoURL: currentUser.photoURL,
				createdAt: serverTimestamp()
			});

			url = ''; // Reset input fields after submission
			title = '';
			error = '';
		} catch (e) {
			console.error('Error adding document: ', e);
			error = 'Failed to submit the link.';
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-2">
	<input
		maxlength="30"
		type="text"
		bind:value={title}
		placeholder="Title"
		required
		class="input input-bordered w-full"
	/>
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
