import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const teamPassword = process.env.TEAM_PASSWORD || 'deckbuilder2024';

  if (password === teamPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('deckbuilder_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
