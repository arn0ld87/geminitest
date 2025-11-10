import React, { useState, useCallback } from 'react';
import { analyzeVideoDescription } from '../services/geminiService';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

export const VideoAnalyzer: React.FC = () => {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!description.trim()) {
      setError('Please provide a video title or description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeVideoDescription(description);
      setResult(analysisResult);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-text-primary mb-4">Video Content Analyzer</h2>
      <p className="text-text-secondary mb-6 text-center">Describe a video and let Gemini Pro analyze its potential content and themes.</p>
      
      <div className="w-full max-w-2xl">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter video title, description, or topic here..."
          className="w-full h-32 p-4 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-colors"
          disabled={isLoading}
        />
      </div>

      <div className="mt-6">
        <Button onClick={handleAnalyze} disabled={isLoading || !description.trim()}>
          {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze Video Content'}
        </Button>
      </div>

      {error && <p className="mt-4 text-center text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-primary mb-2">Analysis Result:</h3>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}
          />
        </div>
      )}
    </div>
  );
};
