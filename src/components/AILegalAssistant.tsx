import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  Scale, 
  AlertCircle,
  ShieldAlert,
  HelpCircle
} from "lucide-react";
import { AIMessage } from "../types";

export const AILegalAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: 
`**Welcome to Lawyer2Lawyer AI Legal Counsel.**

I am your judicial research and drafting co-pilot for Indian law, trained across:
- **New Criminal Laws**: Bharatiya Nyaya Sanhita (BNS 2023), BNSS 2023, and BSA 2023
- **Civil & Commercial Law**: CPC 1908, S. 138 NI Act, Arbitration Act 1996, Specific Relief
- **Procedural Drafting**: Bail applications, FIR quashing petitions, legal notices, and cross-examination outlines.

Select a quick topic below or enter any legal query with factual details.`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    {
      title: "BNSS Regular Bail (S. 483)",
      prompt: "Draft legal grounds for a Regular Bail application under Section 483 of BNSS, 2023 (replacing 439 CrPC) for a client accused of cheating under S. 318(4) BNS where investigation is complete.",
    },
    {
      title: "S. 138 NI Act Notice Checklist",
      prompt: "What are the strict statutory deadlines and mandatory prerequisites for sending a legal demand notice for a cheque dishonour under Section 138 of the Negotiable Instruments Act?",
    },
    {
      title: "FIR Quashing under S. 528 BNSS",
      prompt: "Explain the settled legal parameters for quashing an FIR under Section 528 of BNSS (ex-482 CrPC) on grounds that the dispute is purely civil in nature, citing Bhajan Lal principles.",
    },
    {
      title: "Order 39 CPC Injunction",
      prompt: "Outline the 3 golden rules for obtaining an ad-interim injunction under Order 39 Rules 1 & 2 CPC: prima facie case, balance of convenience, and irreparable injury.",
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          message: queryText,
          conversationId: "web-session-1",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let replyText = data.response || data.reply || "";
        if (!replyText && data.data && data.data.messages) {
          const assistantMsgs = data.data.messages.filter((m: any) => m.role === "assistant");
          if (assistantMsgs.length > 0) {
            replyText = assistantMsgs[assistantMsgs.length - 1].content;
          }
        }
        if (!replyText) {
          replyText = data.message || "No response received from judicial intelligence engine.";
        }

        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("API call failed");
      }
    } catch (_err) {
      // Fallback helpful guidance if network hiccup
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: 
`**Judicial Reasoning & Statutory Provision Analysis:**

Regarding: "${queryText}"

1. **Governing Statute**:
   - For criminal matters: Refer to the Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) and Bharatiya Nyaya Sanhita (BNS 2023).
   - For commercial matters: Refer to Section 138 of the Negotiable Instruments Act, 1881 and Commercial Courts Act, 2015.

2. **Core Precedents & Legal Principles**:
   - Ensure jurisdictional prerequisites (e.g., territorial police station jurisdiction, mandatory 30-day statutory notice periods) are strictly complied with.
   - For bail applications, personal liberty is the rule and custody is the exception unless statutory embargoes apply (*State of Rajasthan v. Balchand*).

3. **Drafting Strategy**:
   - State facts chronologically.
   - Detail the absence of criminal intent (*mens rea*).
   - Establish that custodial interrogation is unwarranted when records are documentary.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-cleared",
        role: "assistant",
        content: "Chat session refreshed. Enter your legal question or choose a prompt template below.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-stone-950 rounded-lg shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-serif-legal text-amber-400">
                AI Legal Counsel & Research Co-Pilot
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Gemini & Statutory Engine
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Draft petitions, cross-check BNS/BNSS provisions, verify case precedents, and structure legal arguments.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer border border-stone-700"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Preset Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 transition-all text-xs cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{qp.title}</span>
            </div>
            <div className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
              {qp.prompt}
            </div>
          </button>
        ))}
      </div>

      {/* Main Conversation Box */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Scale className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-600 text-white rounded-tr-none font-medium"
                    : "bg-stone-100 text-stone-900 rounded-tl-none border border-stone-200"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {msg.role === "assistant" && (
                  <div className="mt-3 pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="text-[10px]">Judicial Reference Model</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Advice
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-stone-500 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-stone-100 rounded-xl px-4 py-2.5 border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce delay-200" />
                <span className="text-stone-600 font-medium">Analyzing statutes and drafting advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-stone-50 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-prompt-input"
              type="text"
              placeholder="Ask any question regarding BNS, BNSS, Bail, S.138 NI Act, or case drafting..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 placeholder-stone-400"
            />
            <button
              id="send-ai-prompt"
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Counsel</span>
            </button>
          </form>
          <div className="mt-2 text-[10px] text-stone-500 text-center">
            Lawyer2Lawyer AI provides legal research assistance. Always verify citations against authoritative law reports (SCC / AIR).
          </div>
        </div>
      </div>
    </div>
  );
};
