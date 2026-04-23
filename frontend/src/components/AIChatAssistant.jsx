import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader,
  ChevronDown,
} from "lucide-react";
import api from "../api/client";

const QUICK_QUESTIONS = [
  "What is my KYC status?",
  "Which documents can I upload?",
  "How do I fill the form?",
  "What format for citizenship number?",
  "Help with form field",
];

const Message = ({ msg }) => {
  const isUser = msg.role === "user";

  // Better markdown-like formatting
  const formatContent = (text) => {
    // Split by double newlines first (paragraphs)
    const paragraphs = text.split("\n\n");

    return paragraphs.map((para, pIdx) => {
      // Split by single newlines within paragraphs
      const lines = para.split("\n").filter((l) => l.trim());

      return (
        <div key={pIdx} className="mb-2 last:mb-0">
          {lines.map((line, lIdx) => {
            // Check if it's a list item
            const isListItem = /^[-•]\s/.test(line.trim());

            if (isListItem) {
              // Remove the list marker and format
              const content = line.replace(/^[-•]\s/, "").trim();
              // Apply bold formatting
              const formattedContent = content.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>",
              );

              return (
                <div key={lIdx} className="flex gap-2 ml-2 mb-1">
                  <span className="text-teal-600 font-bold flex-shrink-0">
                    •
                  </span>
                  <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                </div>
              );
            } else {
              // Regular line with bold formatting
              const formattedContent = line.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>",
              );
              return (
                <div
                  key={lIdx}
                  className="mb-1"
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
              );
            }
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser ? "bg-teal-600" : "bg-slate-800"}`}
      >
        {isUser ? (
          <User size={13} color="white" />
        ) : (
          <Bot size={13} color="white" />
        )}
      </div>
      <div
        className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed
        ${
          isUser
            ? "bg-teal-600 text-white rounded-tr-sm"
            : "bg-slate-100 text-slate-800 rounded-tl-sm"
        }`}
      >
        <div className="space-y-0">{formatContent(msg.content)}</div>
      </div>
    </div>
  );
};

const AIChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey 👋 I'm Buddhi AI. Ask me about your KYC status, documents, or form fields.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg = { role: "user", content: messageText };
    const history = messages.filter((m) => m.role !== "system");

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: messageText,
        conversationHistory: history.slice(-6), // last 6 messages for context
      });

      const assistantMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white
          rounded-full shadow-lg flex items-center justify-center transition-all duration-200
          hover:scale-105 active:scale-95"
        title="KYC Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
            rounded-full flex items-center justify-center font-bold"
          >
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-22 right-5 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl
          border border-slate-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "520px", bottom: "80px" }}
        >
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <Bot size={16} color="white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Buddhi AI</p>
                <p className="text-teal-400 text-xs">Always online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
            style={{ minHeight: "280px" }}
          >
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} color="white" />
                </div>
                <div className="bg-slate-100 px-3 py-2.5 rounded-2xl rounded-tl-sm">
                  <Loader size={14} className="animate-spin text-teal-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 border-t border-slate-100 flex gap-1.5 overflow-x-auto">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs whitespace-nowrap px-2.5 py-1 bg-teal-50 hover:bg-teal-100
                  text-teal-700 rounded-full border border-teal-200 transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your KYC..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200
                focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200
                text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
