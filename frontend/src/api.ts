import { ChatMessage, Todo } from "./types";

const BASE = "http://localhost:3000";
const MCP_CLIENT = "http://localhost:4000";

export const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetch(`${BASE}/todos`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

export const createTodo = async (title: string): Promise<Todo> => {
  const res = await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
};

export const updateTodo = async (todo: Todo): Promise<Todo> => {
  const res = await fetch(`${BASE}/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
};

export const deleteTodo = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");
};

export const postChat = async (message: string): Promise<string> => {
  const res = await fetch(`${MCP_CLIENT}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msg: message }),
  });
  if (!res.ok) throw new Error("Failed to chat");
  const json = (await res.json()) as ChatMessage;
  return json.value;
};
