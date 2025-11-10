import React, { useState, useCallback, useMemo } from 'react';
import { QuizSolver } from './components/QuizSolver';
import { Chat } from './components/Chat';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { Icon } from './components/ui/Icon';

type Tab = 'quiz' | 'chat' | 'image' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('quiz');

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'quiz':
        return <QuizSolver />;
      case 'chat':
        return <Chat />;
      case 'image':
        return <ImageAnalyzer />;
      case 'video':
        return <VideoAnalyzer />;
      default:
        return <QuizSolver />;
    }
  }, [activeTab]);
  
  const TABS: { id: Tab; label: string; icon: 'quiz' | 'chat' | 'image' | 'video' }[] = useMemo(() => [
    { id: 'quiz', label: 'Quiz Solver', icon: 'quiz' },
    { id: 'chat', label: 'AI Chat', icon: 'chat' },
    { id: 'image', label: 'Image Analyzer', icon: 'image' },
    { id: 'video', label: 'Video Analyzer', icon: 'video' },
  ], []);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Gemini AI Assistant
          </h1>
          <p className="text-text-secondary mt-2">Your discreet corner-tool for quizzes, chats, and analysis.</p>
        </header>

        <main className="bg-surface rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="p-2 sm:p-4 bg-gray-800/50">
            <div className="flex justify-center space-x-1 sm:space-x-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-transparent text-text-secondary hover:bg-gray-700/50 hover:text-text-primary'
                  }`}
                >
                  <Icon name={tab.icon} className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 min-h-[60vh]">
            {renderContent()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-text-secondary text-sm">
          <p>Powered by Google Gemini. Built for rapid prototyping.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
