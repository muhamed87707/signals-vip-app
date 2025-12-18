import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
        return Response.json({ success: false, error: 'Telegram ID required' }, { status: 400 });
    }

    try {
        let user = await User.findOne({ telegramId });

        if (!user) {
            // Create user with referral code
            user = await User.create({ telegramId });
        } else if (!user.referralCode) {
            // Generate referral code for existing user
            await user.save(); // This will trigger the pre-save hook
        }

        return Response.json({
            success: true,
            referralCode: user.referralCode,
            referralLink: `https://t.me/your_bot?start=ref_${user.referralCode}`,
            referralCount: user.referralCount,
            referralRewardsEarned: user.referralRewardsEarned
        });
    } catch (error) {
        console.error('Referral GET error:', error);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();

    try {
        const { telegramId, referralCode } = await req.json();

        if (!telegramId || !referralCode) {
            return Response.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // Find the referrer by their code
        const referrer = await User.findOne({ referralCode });
        if (!referrer) {
            return Response.json({ success: false, error: 'Invalid referral code' }, { status: 400 });
        }

        // Check if the new user already exists
        let newUser = await User.findOne({ telegramId });

        if (newUser) {
            // User already exists, check if they've already been referred
            if (newUser.referredBy) {
                return Response.json({ success: false, error: 'Already referred' }, { status: 400 });
            }

            // Update existing user with referral
            newUser.referredBy = referralCode;
            await newUser.save();
        } else {
            // Create new user with referral
            newUser = await User.create({
                telegramId,
                referredBy: referralCode
            });
        }

        // Increment referrer's count
        referrer.referralCount += 1;
        await referrer.save();

        return Response.json({
            success: true,
            message: 'Referral recorded successfully',
            referrerCount: referrer.referralCount
        });
    } catch (error) {
        console.error('Referral POST error:', error);
        return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
