import getYouTubeID from 'get-youtube-id';

export function extractYouTubeVideoID(url: string): string | null {
	const videoID = getYouTubeID(url);
	return videoID ? videoID : null;
}
