import { TodoItem } from "./TodoItem";
import { Todo } from "./types";

type Props = {
  todos: Todo[];
  onToggle: (t: Todo) => void;
  onDelete: (id: number) => void;
};

export const TodoList = ({ todos, onToggle, onDelete }: Props) => {
  if (todos.length === 0) return <p>No todos.</p>;
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
};
