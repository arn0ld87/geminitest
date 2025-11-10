import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Icon } from './ui/Icon';
import { Part } from '@google/genai';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || !prompt.trim()) {
      setError('Please upload an image and provide a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const analysisResult = await analyzeImage([imagePart], prompt);
      setResult(analysisResult);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-text-primary mb-4">Image Analyzer</h2>
      <p className="text-text-secondary mb-6 text-center">Upload an image and ask Gemini anything about it.</p>
      
      <div className="w-full max-w-md">
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Icon name="upload" className="w-8 h-8 mb-4 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
          <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to know about this image?"
        className="w-full max-w-md mt-6 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
        disabled={isLoading}
      />

      <div className="mt-6">
        <Button onClick={handleAnalyze} disabled={isLoading || !imageFile || !prompt.trim()}>
          {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze Image'}
        </Button>
      </div>

      {error && <p className="mt-4 text-center text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-primary mb-2">Analysis Result:</h3>
          <p className="text-text-primary whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};
