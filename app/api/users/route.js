// app/api/users/route.js
// Fetches workspace members from Slack and caches in Upstash for 1 hour

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // Return cached users if available (1 hour cache)
    const cached = await redis.get('slack_users');
    if (cached) return Response.json({ users: cached });

    if (!process.env.SLACK_BOT_TOKEN) {
      return Response.json({ users: [] });
    }

    const res = await fetch('https://slack.com/api/users.list?limit=200', {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.error);

    const users = data.members
      .filter(m => !m.is_bot && !m.deleted && m.id !== 'USLACKBOT')
      .map(m => ({
        id: m.id,
        name: m.real_name || m.name,
        handle: m.name,
        avatar: m.profile?.image_48 || null,
        title: m.profile?.title || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Cache for 1 hour
    await redis.set('slack_users', users, { ex: 3600 });

    return Response.json({ users });
  } catch (err) {
    console.error('Slack users error:', err);
    return Response.json({ users: [] });
  }
}
