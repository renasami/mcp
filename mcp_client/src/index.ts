import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { McpClient } from "./mcp-client";

const app = new Hono();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

app.use(logger());

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })
);

const mcpClient = new McpClient("http://localhost:3001/mcp");

(async () => {
  // ② MCP セッション開始（initialize）
  await mcpClient.initialize();
})().catch((err) => {
  console.error("Failed to initialize MCP client:", err);
  process.exit(1);
});

app.post("/chat", async (ctx) => {
  const { msg } = await ctx.req.json();
  if (typeof msg !== "string" || !msg.trim()) {
    return ctx.text("メッセージが空です。", 400);
  }

  // メッセージを空白区切りで分割
  const parts = msg.trim().split(/\s+/);

  console.log(parts);
  const cmd = parts[0];

  try {
    // 日本語コマンド判定
    if (cmd === "todo") {
      const sub = parts[1];
      // 一覧取得
      if (sub === "一覧") {
        const todos = await mcpClient.callTool<{ text: string }[]>(
          "listTodos",
          {}
        );
        const data = todos.map((t) => JSON.parse(t.text));
        return ctx.json({ todos: data });
      }
      // 単一取得
      if (sub === "取得" && parts[2]) {
        const id = parts[2];
        const todo = await mcpClient.callTool<{ text: string }[]>("getTodo", {
          id,
        });
        return ctx.json({ todo: JSON.parse(todo[0].text) });
      }
      // 作成
      if (sub === "作成" && parts.length >= 3) {
        const title = parts.slice(2).join(" ");
        console.log("タイトル", title);
        const created = await mcpClient.callTool<{ text: string }[]>(
          "createTodo",
          { title }
        );
        console.log(created);
        return ctx.json({ created: JSON.parse(created[0].text) });
      }
      // 更新
      if (sub === "更新" && parts[2] && parts[3]) {
        const id = parts[2];
        const done = parts[3] === "完了";
        const args: any = { id, done };
        if (parts.length > 4) {
          args.title = parts.slice(4).join(" ");
        }
        const updated = await mcpClient.callTool<{ text: string }[]>(
          "updateTodo",
          args
        );
        return ctx.json({ updated: JSON.parse(updated[0].text) });
      }
      // 削除
      if (sub === "削除" && parts[2]) {
        const id = parts[2];
        const res = await mcpClient.callTool<{ text: string }[]>("deleteTodo", {
          id,
        });
        return ctx.json({ message: res[0].text });
      }

      // コマンド不正
      return ctx.text(
        "不明な todo コマンドです。\n" +
          "使い方：\n" +
          "  todo 一覧\n" +
          "  todo 取得 <ID>\n" +
          "  todo 作成 <タイトル>\n" +
          "  todo 更新 <ID> <完了|未完了> [新タイトル]\n" +
          "  todo 削除 <ID>",
        400
      );
    }

    // /todo 以外は AI チャットとして処理
    const aiResp = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: msg,
    });
    return ctx.json({ value: aiResp.text });
  } catch (err: any) {
    console.error("エラー:", err);
    return ctx.text(`エラーが発生しました：${err.message}`, 500);
  }
});

app.get("/todos", async (ctx) => {
  try {
    // listTools を使ってツールの一覧だけ取得する場合
    // const tools = await mcpClient.listTools();

    // 実際に作成した ToDo 一覧を取得するには
    const todos = await mcpClient.callTool<Array<{ text: string }>>(
      "listTodos",
      {}
    );
    return ctx.json({ todos });
  } catch (err) {
    console.error("Error fetching todos via MCP:", err);
    return ctx.text("Failed to fetch todos", 500);
  }
});

export default {
  port: 4000,
  fetch: app.fetch,
};
