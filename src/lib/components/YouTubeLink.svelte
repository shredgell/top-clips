<script lang="ts">
	import { db } from '../firebase';
	import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
	import { user } from '../stores/auth';
	import { get } from 'svelte/store';
	import type { YouTubeLink } from '../types';

	export let link: YouTubeLink;

	let isEditing = false;
	let updatedTitle = link.title;
	let updatedUrl = link.url;
	let error = '';

	const currentUser = get(user);

	const handleEdit = () => {
		isEditing = true;
		updatedTitle = link.title;
		updatedUrl = link.url;
		error = '';
	};

	const handleCancel = () => {
		isEditing = false;
		error = '';
	};

	const handleSave = async () => {
		// Validate URL format
		const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
		if (!urlPattern.test(updatedUrl)) {
			error = 'Please enter a valid YouTube URL.';
			return;
		}

		try {
			await updateDoc(doc(db, 'youtubeLinks', link.id), {
				title: updatedTitle,
				url: updatedUrl
			});
			isEditing = false; // Exit edit mode
		} catch (e) {
			console.error('Error updating document:', e);
			error = 'Failed to update the link.';
		}
	};

	const handleDelete = async () => {
		if (currentUser && currentUser.uid === link.userId) {
			try {
				await deleteDoc(doc(db, 'youtubeLinks', link.id));
			} catch (error) {
				console.error('Error deleting document:', error);
			}
		}
	};
</script>

<li class="rounded border p-4">
	{#if isEditing}
		<input
			type="text"
			bind:value={updatedTitle}
			placeholder="Title"
			class="mb-2 w-full rounded border px-2 py-1"
		/>
		<input
			type="url"
			bind:value={updatedUrl}
			placeholder="YouTube URL"
			class="mb-2 w-full rounded border px-2 py-1"
		/>
		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}
		<button on:click={handleSave} class="rounded bg-green-500 px-3 py-1 text-white">Save</button>
		<button on:click={handleCancel} class="ml-2 rounded bg-gray-500 px-3 py-1 text-white"
			>Cancel</button
		>
	{:else}
		<h3 class="text-lg font-semibold">{link.title}</h3>
		<a href={link.url} target="_blank" class="text-blue-500 underline">Watch on YouTube</a>
		<p class="text-sm text-gray-600">Posted by {link.username}</p>

		{#if currentUser?.uid === link.userId}
			<button on:click={handleEdit} class="mt-2 rounded bg-yellow-500 px-3 py-1 text-white"
				>Edit</button
			>
			<button on:click={handleDelete} class="ml-2 mt-2 rounded bg-red-500 px-3 py-1 text-white"
				>Delete</button
			>
		{/if}
	{/if}
</li>
