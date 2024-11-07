import type { Timestamp } from 'firebase/firestore';

export interface YouTubeLink {
	id: string;
	title: string;
	url: string;
	userId: string;
	username: string;
	photoURL: string;
	createdAt: Timestamp | null;
}
