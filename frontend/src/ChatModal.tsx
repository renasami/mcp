import { useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form"; // :contentReference[oaicite:6]{index=6}
import { useMutation, useQueryClient } from "@tanstack/react-query"; // :contentReference[oaicite:7]{index=7}
import { postChat } from "./api";

type Form = { message: string };

export const ChatModal = () => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<{ from: string; text: string }[]>([]);
  const { register, handleSubmit, reset } = useForm<Form>();
  const qc = useQueryClient();

  const chat = useMutation({
    mutationFn: postChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const onSubmit = handleSubmit(async ({ message }) => {
    setHistory((h) => [...h, { from: "You", text: message }]);
    try {
      const reply = await chat.mutateAsync(message);

      setHistory((h) => [...h, { from: "Bot", text: reply }]);
    } catch (e: any) {
      setHistory((h) => [...h, { from: "Bot", text: `Error: ${e.message}` }]);
    }
    reset();
  });

  return (
    <>
      <button onClick={() => setOpen(true)}>💬 Chat AI</button>
      <Modal isOpen={open} onRequestClose={() => setOpen(false)}>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {history.map((m, i) => (
            <p
              key={i}
              style={{ textAlign: m.from === "You" ? "right" : "left" }}
            >
              <strong>{m.from}:</strong> {m.text}
            </p>
          ))}
        </div>
        <form onSubmit={onSubmit}>
          <input {...register("message", { required: true })} />
          <button>送信</button>
        </form>
      </Modal>
    </>
  );
};
