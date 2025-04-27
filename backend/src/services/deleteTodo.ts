import { createErr, createOk, Result } from "../result";
import { todos } from "../stores/todo";

export const deleteTodo = (id: string): Result<null, string> => {
  const existTodo = todos.get(id);

  if (existTodo === undefined) return createErr("Not Found");

  todos.delete(id);

  return createOk(null);
};
