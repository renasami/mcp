import { v4 } from "uuid";
import { Todo, todos } from "../stores/todo";
import { createErr, createOk, Result } from "../result";

export const createTodo = (title: string): Result<Todo, string> => {
  if (title.trim() === "") return createErr("Invalid title");

  const todo: Todo = { id: v4(), title: title.trim(), done: false };

  todos.set(todo.id, todo);

  return createOk(todo);
};
