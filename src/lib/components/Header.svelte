<script lang="ts">
	import { user, login, logout } from '../stores/auth';
	import type { User } from 'firebase/auth';

	let currentUser: User | null = null;
	user.subscribe((value) => (currentUser = value));

	const handleLogin = () => login();
	const handleLogout = () => logout();
</script>

<header class="flex justify-between bg-gray-800 p-4 text-white">
	<h1 class="text-lg">YouTube Links App</h1>
	{#if currentUser}
		<div>
			<span>Welcome, {currentUser.displayName}</span>
			<button on:click={handleLogout} class="ml-4 rounded bg-red-500 px-2 py-1">Logout</button>
		</div>
	{:else}
		<button on:click={handleLogin} class="rounded bg-blue-500 px-4 py-1">Login with Google</button>
	{/if}
</header>
