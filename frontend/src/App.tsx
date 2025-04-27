import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import { ChatModal } from "./ChatModal";
import { useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  const qc = useQueryClient();

  // useQuery はオブジェクトシグネチャ
  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // useMutation もオブジェクト形式
  const createM = useMutation({
    mutationFn: createTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateM = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteM = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error)
    return <p style={{ color: "red" }}>Error: {(error as Error).message}</p>;

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Hono TODO (for MCP)</h1>
        <TodoForm onAdd={(title) => createM.mutate(title)} />
        <TodoList
          todos={todos}
          onToggle={(t) => updateM.mutate({ ...t, done: !t.done })}
          onDelete={(id) => deleteM.mutate(id)}
        />
      </div>
      <ChatModal />
    </QueryClientProvider>
  );
}

export default App;
