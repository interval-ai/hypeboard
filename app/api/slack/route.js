// app/api/slack/route.js
// Handles /hype slash command + like/comment updates from frontend

import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const recognitions = await kv.get('recognitions') || [];
    return Response.json({ recognitions });
  } catch (err) {
    return Response.json({ recognitions: [] });
  }
}

// Handle likes, comments, and Slack slash command
export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';

  // ── Slack slash command (form data) ──
  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.formData();
      const token    = formData.get('token');
      const text     = formData.get('text');
      const userName = formData.get('user_name');

      if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!text?.trim()) {
        return Response.json({
          response_type: 'ephemeral',
          text: '👋 Usage: `/hype @Name Category — Your message`\nExample: `/hype @Alex Clutch Save — Fixed the bug right before the demo!`',
        });
      }

      const parsed = parseHypeCommand(text);
      if (!parsed) {
        return Response.json({
          response_type: 'ephemeral',
          text: '❌ Try: `/hype @Alex Teamwork — They covered the whole team!`',
        });
      }

      const { to, category, message } = parsed;
      const EMOJIS = { 'Teamwork':'👑','Innovation':'💎','Leadership':'🚀','Clutch Save':'🔥','Above & Beyond':'⚡','Big Energy':'🌟' };
      const emoji = EMOJIS[category] || '🔥';

      const existing = await kv.get('recognitions') || [];
      const newRec = {
        id: Date.now(),
        from: userName,
        to: to.replace('@', ''),
        category, message, emoji,
        photo: null, likes: 0, comments: [],
        timestamp: new Date().toISOString(),
        source: 'slack',
      };
      await kv.set('recognitions', [newRec, ...existing].slice(0, 200));

      return Response.json({
        response_type: 'in_channel',
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: `${emoji} *@${userName}* just recognized *${to}* on HypeBoard!` } },
          { type: 'section', text: { type: 'mrkdwn', text: `_"${message}"_` } },
          { type: 'context', elements: [{ type: 'mrkdwn', text: `🏷️ *${category}*  ·  Live on Interval HypeBoard` }] },
        ],
      });
    } catch (err) {
      console.error('Slack command error:', err);
      return Response.json({ error: 'Server error' }, { status: 500 });
    }
  }

  // ── JSON actions from frontend (likes, comments) ──
  try {
    const body = await request.json();
    const { action, recId, commentId, author, text } = body;
    const recognitions = await kv.get('recognitions') || [];

    if (action === 'like') {
      const updated = recognitions.map(r =>
        r.id === recId ? { ...r, likes: r.likes + 1 } : r
      );
      await kv.set('recognitions', updated);
      return Response.json({ success: true });
    }

    if (action === 'likeComment') {
      const updated = recognitions.map(r =>
        r.id === recId ? {
          ...r,
          comments: r.comments.map(c =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
          )
        } : r
      );
      await kv.set('recognitions', updated);
      return Response.json({ success: true });
    }

    if (action === 'comment') {
      const newComment = {
        id: Date.now(),
        author: author || 'Anonymous',
        text,
        likes: 0,
        timestamp: new Date().toISOString(),
      };
      const updated = recognitions.map(r =>
        r.id === recId ? { ...r, comments: [...r.comments, newComment] } : r
      );
      await kv.set('recognitions', updated);
      return Response.json({ success: true, comment: newComment });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Action error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

function parseHypeCommand(text) {
  const match = text.match(/^(@?\S+)\s+([\w\s&]+?)\s*[—–-]+\s*(.+)$/i);
  if (!match) return null;
  const [, to, rawCategory, message] = match;
  const CATEGORIES = ['Teamwork','Innovation','Leadership','Clutch Save','Above & Beyond','Big Energy'];
  const category = CATEGORIES.find(c => c.toLowerCase() === rawCategory.trim().toLowerCase()) || 'Big Energy';
  return { to: to.startsWith('@') ? to : `@${to}`, category, message: message.trim() };
}
