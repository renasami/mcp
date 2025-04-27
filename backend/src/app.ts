import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createTodo } from "./services/createTodo";
import { deleteTodo } from "./services/deleteTodo";
import { getAll, getBy } from "./services/getTodo";
import { updateTodo } from "./services/updateTodo";

export const createApp = () => {
  const app = new Hono();

  const customLogger = (message: string, ...rest: string[]) => {
    console.log("[API]", message, ...rest);
  };

  app.use(logger(customLogger));

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

  app.get("/todos", (ctx) => {
    return ctx.json(Array.from(getAll().values()));
  });

  // ID 指定取得
  app.get("/todos/:id", (ctx) => {
    const id = ctx.req.param("id");

    return ctx.json(getBy(id));
  });

  // 作成
  app.post("/todos", async (ctx) => {
    const { title } = (await ctx.req.json()) as { title: string };

    const todo = createTodo(title);

    if (todo.isErr) return ctx.text(todo.value, 400);

    return ctx.json(todo, 201);
  });

  // 更新（タイトル or done）
  app.put("/todos/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const body = (await ctx.req.json()) as { title: string; done: boolean };

    const updated = updateTodo(id, body.title, body.done);
    if (updated.isErr) {
      switch (updated.value) {
        case "NOT_FOUND":
          return ctx.text("Not Found", 404);

        case "INVALID_TITLE":
          return ctx.text("Invalid title", 400);
      }
    }

    return ctx.json(updated.value);
  });

  // 削除
  app.delete("/todos/:id", (ctx) => {
    const id = ctx.req.param("id");

    const result = deleteTodo(id);

    if (result.isErr) return ctx.text("Not Found", 404);

    return ctx.json(result.value);
  });

  return app;
};
