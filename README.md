# 🔥 Interval HypeBoard

Internal team recognition platform. Give shoutouts, attach photos, comment, react — and sync everything to Slack.

## Features

- 🔥 **Live recognition feed** with hype reactions
- 💬 **Comments** with hype-able replies  
- 📸 **Photo attachments** — client meetings, team activities, big wins
- 🎁 **Hype Wrapped** — team stats and highlights
- ⚡ **Slack sync** — posts to #hype channel + `/hype` slash command

## Project Structure

```
app/
  page.jsx                  ← Main HypeBoard UI
  layout.jsx                ← Root layout
  api/
    recognize/route.js      ← HypeBoard → Slack webhook
    slack/route.js          ← Slack /hype command → HypeBoard
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import this repo
3. Add environment variables (see below)
4. Deploy — done

## Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `SLACK_WEBHOOK_URL` | Slack App → Incoming Webhooks → Add Webhook |
| `SLACK_VERIFICATION_TOKEN` | Slack App → Basic Information → App Credentials |

## Slack Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App
2. Enable **Incoming Webhooks** → Add to your `#hype` channel
3. Create **Slash Command** → `/hype` → Request URL: `https://your-vercel-url.vercel.app/api/slack`
4. Copy **Verification Token** from Basic Information
5. Add both values as environment variables in Vercel

## Slash Command Usage

```
/hype @Alex Clutch Save — Fixed the critical bug right before the demo. Legend.
```

Categories: `Teamwork` · `Innovation` · `Leadership` · `Clutch Save` · `Above & Beyond` · `Big Energy`

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```
