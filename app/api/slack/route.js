// app/api/slack/route.js
// Handles the /hype slash command from Slack
// Usage: /hype @Alex Clutch Save — Fixed the bug right before the demo!

// In-memory store — swap for Vercel KV or Supabase for persistence
let recognitions = [];

export async function GET() {
  // HypeBoard polls this every 10s to pick up new Slack recognitions
  return Response.json({ recognitions });
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const token     = formData.get('token');
    const text      = formData.get('text');      // e.g. "@Alex Clutch Save — Great work!"
    const userName  = formData.get('user_name'); // who typed the command

    // Verify it's from your Slack workspace
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Show usage hint if no text provided
    if (!text || !text.trim()) {
      return Response.json({
        response_type: 'ephemeral',
        text: '👋 Usage: `/hype @Name Category — Your message`\nExample: `/hype @Alex Clutch Save — Fixed the bug right before the demo!`',
      });
    }

    // Parse: /hype @Alex Clutch Save — Message here
    const parsed = parseHypeCommand(text);
    if (!parsed) {
      return Response.json({
        response_type: 'ephemeral',
        text: '❌ Couldn\'t parse that. Try: `/hype @Alex Teamwork — They covered the whole team!`',
      });
    }

    const { to, category, message } = parsed;
    const EMOJIS = {
      'Teamwork': '👑', 'Innovation': '💎', 'Leadership': '🚀',
      'Clutch Save': '🔥', 'Above & Beyond': '⚡', 'Big Energy': '🌟',
    };
    const emoji = EMOJIS[category] || '🔥';

    // Store it so HypeBoard can pick it up on next poll
    recognitions = [{
      id: Date.now(),
      from: userName,
      to: to.replace('@', ''),
      category,
      message,
      emoji,
      likes: 0,
      timestamp: 'Just now',
      comments: [],
      source: 'slack',
    }, ...recognitions].slice(0, 100);

    // Post back to Slack channel (visible to everyone)
    return Response.json({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *@${userName}* just recognized *${to}* on HypeBoard!`,
          },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `_"${message}"_` },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `🏷️ *${category}*  ·  Live on Interval HypeBoard` }],
        },
      ],
    });
  } catch (err) {
    console.error('Slack inbound error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// Parses "/hype @Alex Clutch Save — Message here"
function parseHypeCommand(text) {
  const match = text.match(/^(@?\S+)\s+([\w\s&]+?)\s*[—–-]+\s*(.+)$/i);
  if (!match) return null;

  const [, to, rawCategory, message] = match;
  const CATEGORIES = ['Teamwork', 'Innovation', 'Leadership', 'Clutch Save', 'Above & Beyond', 'Big Energy'];
  const category = CATEGORIES.find(c =>
    c.toLowerCase() === rawCategory.trim().toLowerCase()
  ) || 'Big Energy';

  return {
    to: to.startsWith('@') ? to : `@${to}`,
    category,
    message: message.trim(),
  };
}
