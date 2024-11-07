import { writable } from 'svelte/store';
import { auth, provider } from '../firebase';
import {
	signInWithPopup,
	signOut,
	setPersistence,
	browserLocalPersistence,
	onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';

export const user = writable<User | null>(null);

// Set persistence to maintain session
setPersistence(auth, browserLocalPersistence).catch((error) => {
	console.error('Error setting persistence:', error);
});

// Listen for authentication state changes
onAuthStateChanged(auth, (currentUser) => {
	user.set(currentUser);
});

// Function to log in using Google Authentication
export const login = async () => {
	try {
		await signInWithPopup(auth, provider);
	} catch (error) {
		console.error('Login error:', error);
		alert('There was an issue logging in. Please try again or check your popup blocker settings.');
	}
};

// Function to log out the current user
export const logout = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error('Logout error:', error);
		alert('There was an issue logging out. Please try again.');
	}
};

// Re-export auth for easy import elsewhere
export { auth };
