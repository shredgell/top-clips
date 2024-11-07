import { writable } from 'svelte/store';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

export const user = writable<User | null>(null);

auth.onAuthStateChanged((currentUser) => {
	user.set(currentUser);
});

export const login = async () => {
	try {
		await signInWithPopup(auth, provider);
	} catch (error) {
		console.error('Login error:', error);
	}
};

export const logout = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error('Logout error:', error);
	}
};
