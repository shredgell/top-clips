// src/lib/utils/youtubeUtils.ts
import getYouTubeID from 'get-youtube-id';

export function extractYouTubeVideoID(url: string): string | null {
	const videoID = getYouTubeID(url);
	return videoID ? videoID : null;
}

export async function fetchYouTubeVideoTitle(videoID: string): Promise<string | null> {
	const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
	const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${apiKey}&part=snippet`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();
		if (data.items && data.items.length > 0) {
			return data.items[0].snippet.title;
		} else {
			console.error('No video found for the given ID.');
			return null;
		}
	} catch (error) {
		console.error('Error fetching video title:', error);
		return null;
	}
}
