import React, { useState, useCallback } from 'react';
import { solveQuizWithGrounding } from '../services/geminiService';
import type { QuizResult } from '../types';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Icon } from './ui/Icon';

export const QuizSolver: React.FC = () => {
  const [quizText, setQuizText] = useState('');
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = useCallback(async () => {
    if (!quizText.trim()) {
      setError('Please paste your quiz questions first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await solveQuizWithGrounding(quizText);
      if (response && response.quizResults) {
        setResults(response.quizResults);
      } else {
        setError('The AI could not process the quiz. Please check the format and try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [quizText]);

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="mt-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Quiz Results</h2>
        {results.map((result, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="font-semibold text-lg text-text-primary mb-3">{index + 1}. {result.question}</p>
            <ul className="space-y-2">
              {result.options.map((option, optionIndex) => (
                <li
                  key={optionIndex}
                  className={`p-3 rounded-md transition-colors duration-200 ${
                    option === result.correctAnswer
                      ? 'bg-green-500/20 border-l-4 border-green-400 text-green-300'
                      : 'bg-surface text-text-secondary'
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
            <p className="mt-4 pt-3 border-t border-gray-700 text-sm text-text-secondary">
              <span className="font-semibold text-primary">Explanation:</span> {result.explanation}
            </p>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold text-text-primary mb-4 text-center">AI-Powered Quiz Solver</h2>
      <p className="text-text-secondary mb-6 text-center">
        Paste your multiple-choice questions below. The AI will use Google Search to find the most accurate answers.
      </p>
      
      <div className="relative">
        <textarea
          value={quizText}
          onChange={(e) => setQuizText(e.target.value)}
          placeholder="Example: What is the capital of France?&#10;A) Berlin&#10;B) Madrid&#10;C) Paris&#10;D) Rome"
          className="w-full h-48 p-4 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-colors"
          disabled={isLoading}
        />
        <Button 
          onClick={() => setQuizText('')}
          className="absolute bottom-3 right-3 !p-2 bg-gray-600 hover:bg-gray-500"
          disabled={isLoading || !quizText}
          aria-label="Clear text"
        >
          <Icon name="close" className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 text-center">
        <Button onClick={handleSolve} disabled={isLoading || !quizText.trim()} className="w-full sm:w-auto">
          {isLoading ? <><Spinner /> Solving...</> : 'Solve Quiz'}
        </Button>
      </div>

      {error && <p className="mt-4 text-center text-red-400">{error}</p>}

      {renderResults()}
    </div>
  );
};
