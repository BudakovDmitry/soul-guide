import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
        <div className="flex items-end gap-2 p-2">
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напиши свій запит або поділися думками..."
            className="w-full bg-transparent text-white placeholder-purple-200/40 border-none focus:ring-0 resize-none max-h-32 py-3 px-2 font-light leading-relaxed scrollbar-thin scrollbar-thumb-white/20"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '48px' }}
          />

          <button 
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
              !text.trim() || isLoading
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};