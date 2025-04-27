// src/server.ts
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import server from "./mcp";

async function main() {
  // ① 通常の HTTP（ポート3000）
  const app = createApp();
  serve({
    fetch: app.fetch, // Hono のフェッチハンドラ
    port: 3000, // デフォルトは3000
  });
  console.log("🚀 Hono TODO backend running at http://localhost:3000");

  // ② MCP 用 JSON-RPC & SSE（ポート3001）
  // const mcpApp = createMcpApp();
  // serve({
  //   fetch: mcpApp.fetch, // MCP 用 Hono アプリ
  //   port: 3001, // 別ポートで待ち受け
  //   overrideGlobalObjects: false, // 生の ServerResponse をそのまま使う
  // });
  // リッスン
  server.listen(3001, () => {
    console.log("🚀 MCP server running at http://localhost:3001");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
