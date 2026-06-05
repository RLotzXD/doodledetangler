import { Idea, Tweet } from './types';

export function encodeSessionData(ideas: Idea[], tweets: Tweet[], briefText: string, notesText: string) {
  const data = {
    ideas: ideas.filter(i => i.selected),
    tweets: tweets.filter(t => t.selected),
    briefText,
    notesText,
    timestamp: new Date().toISOString(),
  };
  return btoa(JSON.stringify(data));
}

export function decodeSessionData(encoded: string) {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function getSessionUrl(sessionData: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}?session=${encodeURIComponent(sessionData)}`;
}

export async function sendToTeams(sessionUrl: string, hasIdeas: boolean, hasTweets: boolean) {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_TEAMS_WEBHOOK_URL || process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) return;

    const title = hasIdeas ? '💡 Ideas Ready' : hasTweets ? '🐦 Tweets Ready' : 'Session Ready';
    const message = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: '0078D4',
      summary: title,
      sections: [
        {
          activityTitle: title,
          activitySubtitle: 'Your DoodleDetangler session is ready',
          text: 'Click the button below to view and edit your results on desktop.',
          potentialAction: [
            {
              '@type': 'OpenUri',
              name: 'Open Results',
              targets: [
                {
                  os: 'default',
                  uri: sessionUrl,
                },
              ],
            },
          ],
        },
      ],
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send Teams message:', error);
  }
}
