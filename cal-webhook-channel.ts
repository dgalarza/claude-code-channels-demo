#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const PORT = 8788;

const mcp = new Server(
  { name: "cal-webhook", version: "0.0.1" },
  {
    capabilities: { experimental: { "claude/channel": {} } },
    instructions: [
      "You receive Cal.com webhook events as channel messages.",
      "When a BOOKING_REQUESTED event arrives, run the /process-booking skill to handle the full intake workflow.",
    ].join("\n"),
  }
);

await mcp.connect(new StdioServerTransport());

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.text();

    await mcp.notification({
      method: "notifications/claude/channel",
      params: {
        content: body,
        meta: {
          source: "cal.com",
          path: new URL(req.url).pathname,
          method: req.method,
        },
      },
    });

    return new Response("ok");
  },
});
