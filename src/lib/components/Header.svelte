<script lang="ts">
	import { user, login, logout } from '../stores/auth';
	import type { User } from 'firebase/auth';

	let currentUser: User | null = null;
	user.subscribe((value) => (currentUser = value));

	const handleLogin = () => login();
	const handleLogout = () => logout();
</script>

<header class="flex justify-end p-4">
	{#if currentUser}
		<div>
			<span>Welcome, {currentUser.displayName}</span>
			<button on:click={handleLogout} class="btn btn-sm btn-error ml-2">Logout</button>
		</div>
	{:else}
		<button on:click={handleLogin} class="btn btn-sm btn-neutral">Login with Google</button>
	{/if}
</header>
