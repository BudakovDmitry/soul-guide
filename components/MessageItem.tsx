import React from 'react';
import { ChatMessage, Sender } from '../types';
import { User, Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  // Simple function to parse bold text (**text**)
  const renderFormattedText = (text: string) => {
    // Split by **text** pattern
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove asterisks and wrap in strong tag
        return (
          <strong key={index} className="font-semibold text-purple-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-purple-600/50 shadow-[0_0_15px_rgba(147,51,234,0.5)]'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-purple-200" />}
        </div>

        {/* Bubble */}
        <div className={`relative px-5 py-4 rounded-2xl text-base leading-relaxed shadow-lg overflow-hidden
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-slate-800/80 backdrop-blur-md border border-white/5 text-purple-50 rounded-bl-none'
          }
        `}>
          {message.image && (
            <div className="-mx-5 -mt-4 mb-4 bg-black/20">
              <img 
                src={message.image} 
                alt="MAC Card" 
                className="w-full h-auto object-cover max-h-[500px] block" 
              />
            </div>
          )}
          
          <div className="whitespace-pre-wrap font-light tracking-wide">
            {renderFormattedText(message.text)}
          </div>
          
          <div className={`text-[10px] mt-2 opacity-50 ${isUser ? 'text-indigo-200' : 'text-purple-300'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};