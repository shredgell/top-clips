// src/lib/types.ts

import type { Timestamp } from 'firebase/firestore';

export interface YouTubeLink {
	id: string;
	title: string;
	url: string;
	createdAt: Timestamp | null;
	userId: string;
	username: string;
	photoURL?: string;
	likeCount?: number; // Add likeCount field here
}
