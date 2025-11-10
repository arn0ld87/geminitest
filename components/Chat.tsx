import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

type Model = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<Model>('gemini-2.5-flash');
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await generateChatResponse(input, model, useThinkingMode);
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
      setError(e.message || 'An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
    }
  }, [input, model, useThinkingMode]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[65vh]">
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 p-2 bg-gray-800/50 rounded-lg">
        <div className="flex-1 w-full sm:w-auto">
          <label htmlFor="model-select" className="text-sm font-medium text-text-secondary mr-2">Model:</label>
          <select 
            id="model-select" 
            value={model} 
            onChange={(e) => setModel(e.target.value as Model)}
            className="w-full sm:w-auto bg-surface border border-gray-600 rounded-md px-3 py-1.5 focus:ring-primary focus:border-primary text-sm"
          >
            <option value="gemini-2.5-flash-lite">Flash Lite (Fastest)</option>
            <option value="gemini-2.5-flash">Flash (Balanced)</option>
            <option value="gemini-2.5-pro">Pro (Advanced)</option>
          </select>
        </div>
        {model === 'gemini-2.5-pro' && (
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
            <input
              type="checkbox"
              id="thinking-mode"
              checked={useThinkingMode}
              onChange={(e) => setUseThinkingMode(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="thinking-mode" className="text-sm font-medium text-text-primary">
              Enable Thinking Mode (Complex Tasks)
            </label>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-700 text-text-primary rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-700 text-text-primary rounded-bl-none">
              <Spinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="my-2 text-center text-red-400">{error}</p>}
      
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything..."
          className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? <Spinner/> : 'Send'}
        </Button>
      </div>
    </div>
  );
};
