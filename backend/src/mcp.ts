import * as http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryEventStore } from "./inMemoryEventStore";
import { v4 } from "uuid";
import { string, z } from "zod";
import { getAll, getBy } from "./services/getTodo";
import { createTodo } from "./services/createTodo";
import { updateTodo } from "./services/updateTodo";
import { deleteTodo } from "./services/deleteTodo";

const mcp = new McpServer({ name: "TodoService", version: "1.0.0" });

// ツール登録（isErr() 呼び出しに注意）
mcp.tool("createTodo", { title: z.string() }, async ({ title }) => {
  console.log("createTodo:", title);
  const res = createTodo(title);
  if (res.isErr) throw new Error(res.value);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(res.value) }],
  };
});
// …他ツールも同様に…

const transports: Record<string, StreamableHTTPServerTransport> = {};

const server = http.createServer(async (req, res) => {
  if (req.url !== "/mcp") {
    res.writeHead(404).end();
    return;
  }

  // 初期化 or POST(JSON-RPC)
  if (req.method === "POST") {
    const buf: Uint8Array[] = [];
    for await (const chunk of req) buf.push(chunk);
    let body: any;
    try {
      body = JSON.parse(Buffer.concat(buf).toString());
    } catch {
      res.writeHead(400).end("Invalid JSON");
      return;
    }

    const sidHeader = req.headers["mcp-session-id"] as string | undefined;
    let transport = sidHeader && transports[sidHeader];

    if (!transport && isInitializeRequest(body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => v4(),
        eventStore: new InMemoryEventStore(),
        onsessioninitialized: (sid: string) => {
          transports[sid] = transport!;
        },
      });

      transport.onclose = () => delete transports[transport!.sessionId!];
      await mcp.connect(transport);
    }
    if (!transport) {
      res.writeHead(400).end("Bad Request");
      return;
    }

    await transport.handleRequest(req, res, body);
    return;
  }

  // SSE stream (GET) or session-terminate (DELETE)
  if (req.method === "GET" || req.method === "DELETE") {
    const sid = req.headers["mcp-session-id"] as string | undefined;
    const transport = sid && transports[sid];
    if (!transport) {
      res.writeHead(400).end("Invalid session");
      return;
    }
    await transport.handleRequest(req, res);
    return;
  }

  // その他は許可しない
  res.writeHead(405).end("Method Not Allowed");
});

export default server;
