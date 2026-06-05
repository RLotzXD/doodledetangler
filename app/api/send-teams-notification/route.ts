import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionUrl, hasIdeas, hasTweets } = await req.json();

    if (!sessionUrl) {
      return NextResponse.json({ error: 'Missing sessionUrl' }, { status: 400 });
    }

    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Teams webhook not configured' }, { status: 400 });
    }

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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Teams webhook failed: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send Teams notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
