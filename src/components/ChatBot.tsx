import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant IA du Mouda Palace. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        
        if (data.requiresValidation) {
          showToast("Validation humaine requise pour cette demande !", "warning");
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        let errorMessage = "Désolé, une erreur est survenue lors de la connexion au serveur.";
        if (errData.error === "API key not found") {
            errorMessage = "La clé d'API Gemini est manquante. Veuillez l'ajouter dans les paramètres du projet (Settings -> Environment Variables).";
        } else if (errData.error && (errData.error.includes("401") || errData.error.includes("ACCOUNT_STATE_INVALID") || errData.error.includes("UNAUTHENTICATED"))) {
            errorMessage = "La clé d'API Gemini utilisée semble invalide, désactivée ou expirée. Veuillez vérifier la clé d'API dans vos paramètres (Settings -> Environment Variables).";
        }
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur de réseau est survenue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#5b45f4] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#4b35e4] transition-all z-50 transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} ring-8 ring-[#5b45f4]/20`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-[#5b45f4] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-medium text-sm">Assistant IA</h3>
                <p className="text-[10px] text-indigo-100">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-100 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#5b45f4] text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#5b45f4]" />
                  <span className="text-xs text-gray-500">L'assistant écrit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1 border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[#5b45f4] focus:ring-1 focus:ring-[#5b45f4]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-[#5b45f4] text-white rounded-full hover:bg-[#4b35e4] disabled:opacity-50 disabled:hover:bg-[#5b45f4] transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
