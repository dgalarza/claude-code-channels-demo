# Cal.com Webhook → Claude Code Channel

A one-way [Claude Code Channel](https://code.claude.com/docs/en/channels) that receives Cal.com booking webhooks and pushes them into a running Claude Code session. Claude automatically parses the booking details and acts on them — no manual intervention needed.

If this helped you, give it a star — it helps others find it.

**Companion repo for my video: [Claude Code Channels — Turn Claude Into a Reactive Agent](https://youtube.com/@damian.galarza)**

## How It Works

```
Cal.com webhook → HTTP server (port 8788) → MCP notification → Claude Code session
```

Channels are a new type of MCP server that **push events into Claude Code** instead of waiting for Claude to call a tool. This turns Claude Code from something you sit in front of into something that reacts to events while you're away.

This repo demonstrates a **one-way channel** — events flow in, Claude reads and acts on them. Two-way channels (like Telegram or Discord chat bridges) also let Claude reply back.

## What's in the Repo

| File | Purpose |
|------|---------|
| `cal-webhook-channel.ts` | The channel server — receives HTTP POSTs and pushes them into Claude Code via MCP |
| `.mcp.json` | Registers the channel server with Claude Code |
| `cal-booking-requested.json` | Sample Cal.com `BOOKING_REQUESTED` webhook payload for testing |

## The Channel Server (~40 lines)

The entire channel server is `cal-webhook-channel.ts`. It does three things:

1. **Declares the `claude/channel` capability** — this is what makes it a channel instead of a regular MCP server
2. **Runs an HTTP server** on `localhost:8788` to receive webhook POSTs
3. **Forwards events** into the Claude Code session via `mcp.notification()`

The `instructions` field tells Claude what to do when events arrive — this goes into Claude's system prompt and shapes how it interprets the raw webhook payload.

## Try It Yourself

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- Claude Code v2.1.80+
- Claude.ai subscription (Pro or Max) — channels require a login, not an API key

### Setup

```bash
git clone <this-repo>
cd cal-webhook-channel
bun install
```

### Run

Start Claude Code with the channel loaded:

```bash
claude --dangerously-load-development-channels server:cal-webhook
```

> `--dangerously-load-development-channels` is required for custom channels. Official plugins (Telegram, Discord) use `--channels plugin:name@publisher` instead.

In a second terminal, simulate a webhook:

```bash
curl -X POST localhost:8788 \
  -H "Content-Type: application/json" \
  -d @cal-booking-requested.json
```

Watch your Claude Code session — Claude receives the booking event and pulls out the key details: who booked, when, what service they're interested in, what problem they're trying to solve, how they found you, and company size.

## Adapt It

This same pattern works for **any webhook source**. Swap Cal.com for:

- **Stripe** — react to payment events, failed charges, subscription changes
- **GitHub** — investigate CI failures, review new issues, triage PRs
- **Monitoring** — process alerts from Datadog, PagerDuty, or Sentry
- **Deploys** — get notified when a deploy succeeds or fails

The channel contract is simple: declare the capability, push notifications, write instructions that tell Claude how to interpret the events.

## Resources

- [Channels documentation](https://code.claude.com/docs/en/channels)
- [Channels reference](https://code.claude.com/docs/en/channels-reference)
- [Official plugins repo](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins)

---

**Built by [Damian Galarza](https://damiangalarza.com)** — 15+ years shipping production software, former CTO, daily Claude Code user. I share what actually works.

- [Watch the video](https://youtube.com/@damian.galarza) — full walkthrough of channels + this demo
- [Newsletter](https://damiangalarza.com/newsletter?utm_source=github&utm_medium=repo&utm_campaign=cal-webhook-channel) — I'm building more Claude Code automation patterns like this. Get them first.
- [Book a free intro call](https://damiangalarza.com/claude-code?utm_source=github&utm_medium=repo&utm_campaign=cal-webhook-channel) — if you want help building Claude Code workflows for your team
