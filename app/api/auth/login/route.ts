import { NextRequest, NextResponse } from 'next/server';
import { LoginData } from '../../../(auth)/schema';

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();

    // Here you would typically validate credentials and return token
    // For now, just return success
    console.log('Login data:', body);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { token: 'mock-token', user: { id: '123', email: body.email, role: "user" } }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}