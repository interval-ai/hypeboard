// app/api/recognize/route.js
// Fires when someone submits a recognition on HypeBoard
// Posts a formatted card to your Slack #hype channel

export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, category, message, emoji } = body;

    if (!from || !to || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slackPayload = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *${from}* just recognized *${to}* on HypeBoard!`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `_"${message}"_`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🏷️ *${category}*  ·  Posted on Interval HypeBoard`,
            },
          ],
        },
        { type: 'divider' },
      ],
    };

    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!slackRes.ok) {
      throw new Error(`Slack error: ${slackRes.status}`);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Recognition API error:', err);
    return Response.json({ error: 'Failed to post to Slack' }, { status: 500 });
  }
}
