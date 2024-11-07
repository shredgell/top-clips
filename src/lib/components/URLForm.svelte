<script lang="ts">
	import { db } from '../firebase';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { user } from '../stores/auth';
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

<form on:submit|preventDefault={handleSubmit} class="space-y-2 p-4">
	<input
		type="text"
		bind:value={title}
		placeholder="Title"
		required
		class="w-full rounded border p-2"
	/>
	<input
		type="url"
		bind:value={url}
		placeholder="YouTube URL"
		required
		class="w-full rounded border p-2"
	/>
	<button type="submit" class="rounded bg-green-500 px-4 py-2 text-white">Submit</button>
	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}
</form>
