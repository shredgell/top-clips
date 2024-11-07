// src/lib/types.ts

import type { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface YouTubeLink {
	id: string;
	title: string;
	url: string;
	createdAt: Timestamp | null;
	userId: string;
	username: string;
	photoURL?: string;
	likeCount?: number;
}

export type AuthUser = User | null;
