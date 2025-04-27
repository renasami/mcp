// src/components/TodoForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";

type FormValues = {
  title: string;
};

type Props = {
  onAdd: (title: string) => void;
};

export const TodoForm = ({ onAdd }: Props) => {
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const t = data.title.trim();
    if (!t) return;
    onAdd(t);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 16 }}>
      <input
        {...register("title", { required: true })}
        placeholder="New todo"
      />
      <button type="submit" style={{ marginLeft: 8 }}>
        Add
      </button>
    </form>
  );
};
