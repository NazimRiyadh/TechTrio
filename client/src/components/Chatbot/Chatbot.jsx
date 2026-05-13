import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import "./Chatbot.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the BigBazar Shopping Assistant. How can I help you find the perfect product?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);

    // Add placeholder for assistant
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages.filter((m) => m.role !== "system") }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: updated[updated.length - 1].content + parsed.text };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, I couldn't connect. Please try again." };
        return updated;
      });
    }
    setStreaming(false);
  };

  return (
    <div className="chatbot-wrapper">
      {open && (
        <div className="chatbot-panel card">
          <div className="chatbot-header flex-between">
            <span className="body-emphasis" style={{ color: "#fff" }}>🛍️ BigBazar AI</span>
            <button className="chatbot-close" onClick={() => setOpen(false)}><FiX size={18} /></button>
          </div>
          <div className="chatbot-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
                <p>{m.content || (streaming && i === messages.length - 1 ? "..." : "")}</p>
              </div>
            ))}
          </div>
          <form className="chatbot-input-row" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input type="text" placeholder="Ask about products..." value={input} onChange={(e) => setInput(e.target.value)} className="chatbot-input" disabled={streaming} />
            <button type="submit" className="chatbot-send" disabled={streaming || !input.trim()}><FiSend size={16} /></button>
          </form>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setOpen(!open)} aria-label="Chat">
        {open ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
};

export default Chatbot;
