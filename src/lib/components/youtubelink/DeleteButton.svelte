<script lang="ts">
	import { deleteDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/utils/firebase';
	import type { YouTubeLink } from '$lib/types';

	export let link: YouTubeLink;

	const handleDelete = async () => {
		try {
			await deleteDoc(doc(db, 'youtubeLinks', link.id));
		} catch (error) {
			console.error('Error deleting document:', error);
		}
	};
</script>

<button on:click={handleDelete} class="btn btn-sm btn-error">Delete</button>
