import { NextRequest, NextResponse } from 'next/server';
import { AppUrls } from '@/config/appUrls';

const BACKEND_URL = AppUrls.backend.sendOtpCustomer;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform = 'web',
      language_code = 'en',
      action_when = 'admin_login',
      phone_number,
      country_code = 'BD',
    } = body;

    if (!phone_number) {
      return NextResponse.json(
        { status: false, message: 'Phone number is required', data: [] },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('platform', platform);
    formData.append('language_code', language_code);
    formData.append('action_when', action_when);
    formData.append('phone_number', phone_number);
    formData.append('country_code', country_code);

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Failed to send OTP. Please check your connection.',
        data: [],
      },
      { status: 500 }
    );
  }
}
