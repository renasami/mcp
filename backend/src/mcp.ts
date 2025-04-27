import * as http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryEventStore } from "./inMemoryEventStore";
import { v4 } from "uuid";
import { string, z } from "zod";
import { getAll, getBy } from "./services/getTodo";
import { createTodo } from "./services/createTodo";
import { deleteTodo } from "./services/deleteTodo";
import { updateTodo } from "./services/updateTodo";

// 1. MCP サーバーとツール登録
const mcp = new McpServer({ name: "TodoService", version: "1.0.0" });
mcp.tool("listTodos", async () => ({
  content: Array.from(getAll().values()).map((t) => ({
    type: "text" as const,
    text: JSON.stringify(t),
  })),
}));
mcp.tool("getTodo", { id: z.string() }, async ({ id }) => {
  const todo = getBy(id);
  if (!todo) throw new Error(`ToDo(${id}) not found`);
  return { content: [{ type: "text" as const, text: JSON.stringify(todo) }] };
});

mcp.tool("createTodo", { title: z.string() }, async ({ title }) => {
  const res = createTodo(title);
  if (res.isErr) throw new Error(res.value);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(res.value) }],
  };
});
mcp.tool(
  "updateTodo",
  { id: z.string(), title: z.string(), done: z.boolean() },
  async ({ id, title, done }) => {
    const res = updateTodo(id, title, done);
    if (res.isErr) throw new Error(res.value);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(res.value) }],
    };
  }
);
mcp.tool("deleteTodo", { id: z.string() }, async ({ id }) => {
  const res = deleteTodo(id);
  if (res.isErr) throw new Error(res.value);
  return { content: [{ type: "text" as const, text: `Deleted ${id}` }] };
});

// 2. transports ストア
const transports: Record<string, StreamableHTTPServerTransport> = {};

// 3. HTTP サーバー起動
const server = http.createServer(async (req, res) => {
  if (req.url !== "/mcp") {
    res.writeHead(404).end();
    return;
  }

  // ボディをパース
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());

  // セッションIDヘッダ
  const sidHeader = req.headers["mcp-session-id"] as string | undefined;
  let transport = sidHeader && transports[sidHeader];

  // 初期化リクエストなら新規作成
  if (!transport && isInitializeRequest(body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => v4(),
      eventStore: new InMemoryEventStore(),
      onsessioninitialized: (sid: string) => {
        transports[sid] = transport!;
      },
    });
    transport.onclose = () => {
      delete transports[transport!.sessionId!];
    };
    await mcp.connect(transport);
  }

  // transport がないならエラー
  if (!transport) {
    res.writeHead(400).end(JSON.stringify({ error: "Bad Request" }));
    return;
  }

  // 1回だけ handleRequest を呼ぶ
  await transport.handleRequest(req, res, body);
});

export default server;
