import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { generateResponse } from './services/geminiService';
import { MessageItem } from './components/MessageItem';
import { InputArea } from './components/InputArea';
import { TypingIndicator } from './components/TypingIndicator';
import { INITIAL_GREETING } from './constants';
import { ChatMessage, Sender, GenerationState } from './types';
import { Sparkles, Moon, Send } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>({ isLoading: false, error: null });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: Sender.Model,
        text: INITIAL_GREETING,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generationState.isLoading]);

  const handleSendMessage = async (text: string, image?: string) => {
    if (!text && !image) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.User,
      text: text,
      image: image,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setGenerationState({ isLoading: true, error: null });

    try {
      // 2. Generate Response
      const { text: responseText, image: responseImage } = await generateResponse(text, image, messages);

      // 3. Add Model Message
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.Model,
        text: responseText,
        image: responseImage, // Attach generated image if present
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setGenerationState({ 
        isLoading: false, 
        error: err.message || "Сталася помилка. Будь ласка, спробуйте ще раз." 
      });
      // Optionally add an error message to the chat
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        sender: Sender.Model,
        text: "Пробач, зв'язок з полем зараз слабкий. Спробуй ще раз пізніше.",
        timestamp: Date.now(),
      }]);
    } finally {
      setGenerationState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Determine if the chat limit is reached (2 user messages)
  const userMessageCount = messages.filter(m => m.sender === Sender.User).length;
  const isLimitReached = userMessageCount >= 2;
  
  // Show CTA only if limit is reached AND we are NOT currently loading the final answer
  const showCTA = isLimitReached && !generationState.isLoading;

  return (
    <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-900 to-black text-slate-100 font-sans">
      
      {/* Header */}
      <header className="flex-none p-4 md:p-6 flex items-center justify-between bg-black/20 backdrop-blur-sm border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-full border border-purple-500/30">
            <Moon className="text-purple-300" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-100 tracking-wide">
              Soul Guide
            </h1>
            <p className="text-xs text-purple-300/60 uppercase tracking-widest font-medium">
              Духовний Провідник & Психолог
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-indigo-300/50">
          <Sparkles size={12} />
          <span>Простір трансформації</span>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-2 relative">
        {/* Background ambient elements */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto pb-4">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          
          {generationState.isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-slate-800/50 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm border border-white/5">
                 <TypingIndicator />
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area or CTA */}
      <footer className="flex-none z-20 min-h-[80px]">
        {showCTA ? (
          <div className="w-full max-w-4xl mx-auto px-4 pb-8 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] text-center space-y-6">
              <p className="text-indigo-100 text-lg md:text-xl font-light leading-relaxed font-serif">
                Для більш детального розбору записуйся на консультацію до Дар'ї Будакової
              </p>
              <a 
                href="https://t.me/budakova_daria" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] animate-gradient text-white px-8 py-4 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform hover:-translate-y-1 group"
              >
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                <span>Написати в Telegram</span>
              </a>
              <div className="text-purple-300/40 text-xs">@budakova_daria</div>
            </div>
          </div>
        ) : (
          /* Only show input if limit is NOT reached. 
             If limit IS reached but still loading (showCTA is false), we show nothing (blocking input). */
          !isLimitReached && (
            <InputArea onSend={handleSendMessage} isLoading={generationState.isLoading} />
          )
        )}
        
        {!isLimitReached && (
          <div className="text-center pb-2 text-[10px] text-white/10 select-none">
            Створено з любов'ю для внутрішніх подорожей
          </div>
        )}
      </footer>
    </div>
  );
};

export default App;