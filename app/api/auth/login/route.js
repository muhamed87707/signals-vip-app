import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { password } = await request.json();

        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@Mainpassword87707';

        if (password === ADMIN_PASSWORD) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
