import { NextRequest, NextResponse } from 'next/server';
import { RegisterData } from '../../../(auth)/schema';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Here you would typically validate and save to database
    // For now, just return success
    console.log('Registration data:', body);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: { userId: '123' } // mock data
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}