import React, { useState } from 'react';
import {
  Bot,
  ArrowRight,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Modal from '../common/Modal';
import { aiComplianceQA } from '../../data/mockData';

export interface AIComplianceAssistantProps {
  onOpenAssistantModal?: () => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIComplianceAssistant: React.FC<AIComplianceAssistantProps> = ({
  onOpenAssistantModal,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: 'Hello Safety Officer Harini. I am MineGuard AI, your safety compliance assistant. Ask me anything regarding active zones, PPE detections, dust telemetry, or DGMS regulations.',
      timestamp: '10:42 AM',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Why is Zone B risky?',
    "Show today's violations",
    'Generate safety report',
  ];

  const handleOpenChat = () => {
    setChatOpen(true);
    if (onOpenAssistantModal) onOpenAssistantModal();
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Smart contextual response based on query
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('zone b') || lower.includes('risky') || lower.includes('why is zone b')) {
        reply =
          'Zone B currently has a high risk score (87/100) due to recent PPE violations (worker W102 without helmet detected near Loader L-04), elevated environmental particulate count (78 µg/m³), and steep slope geometry on Bench #4.';
      } else if (lower.includes('violation') || lower.includes('today')) {
        reply =
          "Today's safety log includes 4 recorded violations: 1) 10:42 AM: No Helmet in Zone B (Open, High); 2) 11:17 AM: Restricted Zone Entry in Zone A (Open, High); 3) 12:05 PM: High Dust in Zone C (Investigating, Medium); 4) 12:30 PM: PPE Issue in Zone D (Resolved, Low).";
      } else if (lower.includes('report') || lower.includes('generate')) {
        reply =
          'Shift Safety Audit synthesized: 92% Compliance rating. 218 workers on duty. Zero Lost Time Injuries (LTI). Recommended immediate actions: suppress dust at Zone C conveyor head and enforce hard hat checks in Zone B.';
      } else if (lower.includes('dust') || lower.includes('zone c') || lower.includes('environment')) {
        reply =
          'Continuous IoT telemetry shows Zone C dust levels at 92 µg/m³, exceeding the 75 µg/m³ standard threshold. Automation recommends turning on auxiliary mist suppression cannons.';
      } else {
        reply = `Under DGMS Coal Mines Regulations (CMR 2017), safety audits for ${query} require immediate verification by Shift Safety Officer Harini N. All telemetry is recorded to the tamper-evident audit log.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Horizontal card matching reference bottom right */}
      <div
        onClick={handleOpenChat}
        className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 sm:p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              AI Compliance Assistant
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Ask anything about safety, violations, or compliance...
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenChat();
          }}
          className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0"
          aria-label="Open AI Assistant"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Assistant Chat Modal */}
      {chatOpen && (
        <Modal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          title="MineGuard AI Compliance Assistant"
          subtitle="Trained on DGMS Circulars, CMR 2017 & Real-Time Coal Mine Telemetry"
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask about compliance, worker safety, DGMS rules..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {/* Suggested Question Pills */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Suggested Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-full font-medium transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>"{q}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      isAi ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAi && (
                      <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                        isAi
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                          : 'bg-blue-600 text-white shadow-2xs font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] block mt-1 font-mono text-right ${
                          isAi ? 'text-slate-400' : 'text-blue-200'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AIComplianceAssistant;
