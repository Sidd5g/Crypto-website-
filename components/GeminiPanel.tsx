import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { CryptoAsset, GeminiAnalysisResult, GroundingSource, ChatMessage } from '../types';
import { analyzeCryptoSentiment, streamChatResponse } from '../services/geminiService';

interface GeminiPanelProps {
  selectedAsset: CryptoAsset | null;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ selectedAsset }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setChatMessages([
      {
        id: 'init',
        role: 'model',
        text: 'Hello! I am your AI Market Assistant. Ask me anything about current crypto trends, specific coins, or market news.'
      }
    ]);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Effect to analyze asset when selected
  useEffect(() => {
    if (selectedAsset && activeTab === 'analysis') {
      handleAnalyze();
    }
  }, [selectedAsset, activeTab]);

  const handleAnalyze = async () => {
    if (!selectedAsset) return;
    setLoadingAnalysis(true);
    setAnalysis(null);
    const result = await analyzeCryptoSentiment(selectedAsset.name, parseFloat(selectedAsset.priceUsd).toFixed(2));
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      text: '',
      isThinking: true
    };
    
    setChatMessages(prev => [...prev, modelMsg]);

    const history = chatMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    let accumulatedText = '';

    const sources = await streamChatResponse(
      history,
      userMsg.text,
      (chunk) => {
        accumulatedText += chunk;
        setChatMessages(prev => prev.map(m => 
          m.id === modelMsgId ? { ...m, text: accumulatedText, isThinking: false } : m
        ));
      }
    );

    setChatMessages(prev => prev.map(m => 
      m.id === modelMsgId ? { ...m, sources: sources } : m
    ));
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary-500">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold tracking-wide">Gemini Intelligence</h2>
        </div>
        <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'analysis' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'chat' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-dark-600">
        {activeTab === 'analysis' ? (
          <div className="space-y-6">
            {!selectedAsset ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>Select a cryptocurrency to view AI analysis.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <img 
                      src={`https://assets.coincap.io/assets/icons/${selectedAsset.symbol.toLowerCase()}@2x.png`} 
                      className="w-6 h-6 rounded-full"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      alt={selectedAsset.symbol}
                    />
                    {selectedAsset.name} Market Sentiment
                  </h3>
                  <button 
                    onClick={handleAnalyze} 
                    disabled={loadingAnalysis}
                    className="p-2 hover:bg-dark-700 rounded-full transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-primary-500 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {loadingAnalysis ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                    <div className="h-4 bg-dark-700 rounded w-5/6"></div>
                    <div className="h-4 bg-dark-700 rounded w-2/3"></div>
                  </div>
                ) : analysis ? (
                  <div className="animate-fade-in">
                     <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-700 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {analysis.markdown}
                    </div>

                    {analysis.sources.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-full text-xs text-primary-400 transition-colors border border-dark-600"
                            >
                              <span className="truncate max-w-[150px]">{source.title}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-br-none' 
                      : 'bg-dark-700 text-gray-200 rounded-bl-none border border-dark-600'
                  }`}
                >
                  {msg.isThinking ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dark-600/50">
                           <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">References</p>
                           <div className="flex flex-wrap gap-2">
                             {msg.sources.map((s, i) => (
                               <a 
                                 key={i} 
                                 href={s.uri} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="text-xs text-primary-400 hover:text-primary-300 underline decoration-primary-400/30 truncate max-w-[200px]"
                               >
                                 {s.title}
                               </a>
                             ))}
                           </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      {activeTab === 'chat' && (
        <div className="p-4 bg-dark-800 border-t border-dark-700">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Gemini about the market..."
              className="w-full bg-dark-900 text-white placeholder-gray-500 rounded-lg pl-4 pr-12 py-3 border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GeminiPanel;