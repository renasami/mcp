import { Result, createErr, createOk } from "../result";
import { Todo, todos } from "../stores/todo";

export const updateTodo = (
  id: string,
  title: string,
  done: boolean
): Result<Todo, UpdateError> => {
  const existTodo = todos.get(id);

  if (existTodo === undefined) return createErr<UpdateError>("NOT_FOUND");

  if (title.trim() === "") return createErr<UpdateError>("INVALID_TITLE");

  const updated = { ...existTodo, title, done };

  todos.set(id, updated);

  return createOk(updated);
};

export type UpdateError = "NOT_FOUND" | "INVALID_TITLE";
