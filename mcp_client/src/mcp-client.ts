// src/mcp/McpClient.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  type ListToolsRequest,
  type ListToolsResult,
  type ListToolsResultSchema,
  type CallToolRequest,
  type CallToolResult as SDKCallToolResult,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

export class McpClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport;

  constructor(private readonly endpoint: string) {
    this.client = new Client({ name: "mcp-client", version: "1.0.0" });
    this.transport = new StreamableHTTPClientTransport(new URL(endpoint));
  }

  public async initialize(): Promise<void> {
    await this.client.connect(this.transport);
    console.log("MCP セッション開始:", this.transport.sessionId);
  }

  public async listTools(): Promise<string[]> {
    const req: ListToolsRequest = { method: "tools/list", params: {} };
    const res = await this.client.listTools(req);

    return (res as ListToolsResult).tools.map((it) => it.name);
  }

  public async callTool<T = unknown>(
    name: string,
    args: Record<string, unknown>
  ): Promise<T> {
    const req: CallToolRequest = {
      method: "tools/call",
      params: { name, arguments: args },
    };
    const res = await this.client.request(req, CallToolResultSchema);

    return res.content as T;
  }

  public async close(): Promise<void> {
    await this.transport.terminateSession();
    await this.transport.close();
    console.log("MCP セッション終了");
  }
}
