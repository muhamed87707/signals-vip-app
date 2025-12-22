import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

// Get Twitter client with credentials from settings
async function getTwitterClient() {
    await dbConnect();
    const settings = await Settings.findOne();
    
    if (!settings?.twitterApiKey || !settings?.twitterApiSecret || 
        !settings?.twitterAccessToken || !settings?.twitterAccessSecret) {
        throw new Error('Twitter credentials not configured');
    }

    return new TwitterApi({
        appKey: settings.twitterApiKey,
        appSecret: settings.twitterApiSecret,
        accessToken: settings.twitterAccessToken,
        accessSecret: settings.twitterAccessSecret,
    });
}

// POST - Create a tweet with optional image
export async function POST(request) {
    try {
        const { text, imageUrl, imageBase64 } = await request.json();
        
        console.log('Twitter POST request received:', { 
            hasText: !!text, 
            hasImageUrl: !!imageUrl,
            hasImageBase64: !!imageBase64 
        });

        if (!text && !imageUrl && !imageBase64) {
            return NextResponse.json({ 
                success: false, 
                error: 'Text or image is required' 
            }, { status: 400 });
        }

        const client = await getTwitterClient();
        console.log('Twitter client created successfully');
        
        const twitterClient = client.readWrite;

        let mediaId = null;

        // Upload image if provided
        if (imageBase64) {
            try {
                // Convert base64 to buffer
                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Upload media
                mediaId = await twitterClient.v1.uploadMedia(buffer, { mimeType: 'image/jpeg' });
                console.log('Image uploaded from base64, mediaId:', mediaId);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                // Continue without image if upload fails
            }
        } else if (imageUrl && !imageUrl.startsWith('data:')) {
            try {
                console.log('Fetching image from URL:', imageUrl.substring(0, 50));
                // Fetch image from URL and upload
                const imageResponse = await fetch(imageUrl);
                const arrayBuffer = await imageResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                mediaId = await twitterClient.v1.uploadMedia(buffer, { mimeType: 'image/jpeg' });
                console.log('Image uploaded from URL, mediaId:', mediaId);
            } catch (uploadError) {
                console.error('Image URL upload error:', uploadError);
            }
        }

        // Create tweet
        const tweetOptions = {};
        if (mediaId) {
            tweetOptions.media = { media_ids: [mediaId] };
        }

        console.log('Creating tweet with options:', { hasMedia: !!mediaId, textLength: text?.length });
        const tweet = await twitterClient.v2.tweet(text || '', tweetOptions);
        console.log('Tweet created successfully:', tweet.data.id);

        return NextResponse.json({
            success: true,
            tweetId: tweet.data.id,
            message: 'Tweet posted successfully'
        });

    } catch (error) {
        console.error('Twitter POST Error:', error);
        console.error('Error details:', error.data || error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to post tweet'
        }, { status: 500 });
    }
}

// DELETE - Delete a tweet
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tweetId = searchParams.get('tweetId');

        if (!tweetId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Tweet ID is required' 
            }, { status: 400 });
        }

        const client = await getTwitterClient();
        const twitterClient = client.readWrite;

        await twitterClient.v2.deleteTweet(tweetId);

        return NextResponse.json({
            success: true,
            message: 'Tweet deleted successfully'
        });

    } catch (error) {
        console.error('Twitter DELETE Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to delete tweet'
        }, { status: 500 });
    }
}
