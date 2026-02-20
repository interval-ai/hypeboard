// app/api/recognize/route.js
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const recognitions = await redis.get('recognitions') || [];
    return Response.json({ recognitions });
  } catch (err) {
    console.error('Redis read error:', err);
    return Response.json({ recognitions: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, category, message, emoji, photo } = body;

    if (!from || !to || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await redis.get('recognitions') || [];
    const newRec = {
      id: Date.now(),
      from, to, category, message, emoji,
      photo: photo || null,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      source: 'board',
    };
    const updated = [newRec, ...existing].slice(0, 200);
    await redis.set('recognitions', updated);

    // Post to Slack if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: `${emoji} *${from}* just recognized *${to}* on HypeBoard!` } },
            { type: 'section', text: { type: 'mrkdwn', text: `_"${message}"_` } },
            { type: 'context', elements: [{ type: 'mrkdwn', text: `🏷️ *${category}*  ·  Interval HypeBoard` }] },
            { type: 'divider' },
          ],
        }),
      });
    }

    return Response.json({ success: true, recognition: newRec });
  } catch (err) {
    console.error('Recognize API error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
