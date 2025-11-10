export interface QuizResult {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}
