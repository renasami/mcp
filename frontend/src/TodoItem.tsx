import { Todo } from "./types";

type Props = {
  todo: Todo;
  onToggle: (t: Todo) => void;
  onDelete: (id: number) => void;
};

export const TodoItem = ({ todo, onToggle, onDelete }: Props) => {
  return (
    <li style={{ marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle({ ...todo, done: !todo.done })}
      />
      <span
        style={{
          textDecoration: todo.done ? "line-through" : "none",
          margin: "0 8px",
        }}
      >
        {todo.title}
      </span>
      <button onClick={() => onDelete(todo.id)}>×</button>
    </li>
  );
};
