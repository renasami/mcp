import { Todo, Todos, todos } from "../stores/todo";

export const getAll = (): Todos => {
  return todos;
};

export const getBy = (id: string): Todo | null => {
  return todos.get(id) ?? null;
};
