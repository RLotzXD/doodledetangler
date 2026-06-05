import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionUrl, hasIdeas, hasTweets } = await req.json();

    if (!sessionUrl) {
      return NextResponse.json({ error: 'Missing sessionUrl' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = 'regner.lotz@vml.com';

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 400 });
    }

    const subject = hasIdeas ? '💡 Your Ideas are Ready' : hasTweets ? '🐦 Your Tweets are Ready' : '✓ Your Session is Ready';
    const htmlContent = `
      <h2>${subject}</h2>
      <p>Your DoodleDetangler session is ready! Click the link below to view and edit your results:</p>
      <p><a href="${sessionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 4px;">View Results</a></p>
      <p><strong>Or copy this link:</strong><br>${sessionUrl}</p>
      ${hasIdeas ? '<p>✓ Ideas extracted and ready for review</p>' : ''}
      ${hasTweets ? '<p>✓ Tweets generated and ready for editing</p>' : ''}
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Resend failed: ${error.message}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

