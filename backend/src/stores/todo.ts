export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export type Todos = Map<string, Todo>;

export const todos: Todos = new Map<string, Todo>();
