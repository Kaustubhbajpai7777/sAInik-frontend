'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation'; // <-- 1. Import useParams
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface QuizData {
  title: string;
  quizData: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  };
}

export default function QuizPage() { // <-- 2. Remove props from here
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  
  const params = useParams(); // <-- 3. Get params using the hook
  const contentId = params.id as string; // Get the id

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem('token');
      if (!isAuthenticated || !contentId) return;

      try {
        // 4. Use the contentId variable
        const res = await fetch(`http://localhost:8000/api/content/${contentId}/quiz`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch quiz.');
        const data = await res.json();
        console.log("DATA RECEIVED FROM BACKEND:", JSON.stringify(data, null, 2));
        setQuiz(data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      }
    };

    if (isAuthenticated) {
      fetchQuiz();
    }
  }, [contentId, isAuthenticated]); // 4. Use contentId here

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = async () => {
    let newScore = 0;
    const totalQuestions = quiz?.quizData.questions.length || 0;

    quiz?.quizData.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    
    setScore(newScore);
    setIsSubmitted(true);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:8000/api/analytics/save-quiz-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            contentId: parseInt(contentId), // 4. Use contentId here
            score: newScore,
            totalQuestions: totalQuestions,
          }),
        });
        toast.success("Quiz score saved!");
      } catch (error) {
        toast.error("Failed to save quiz score.");
        console.error("Failed to save quiz score:", error);
      }
    }
  };
  
  if (authIsLoading || !quiz) {
    return <div className="flex h-full w-full items-center justify-center bg-background text-foreground">Loading Quiz...</div>;
  }
  
  return (
    <div className="min-h-full bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/content/${contentId}`} className="text-brand-orange hover:underline mb-8 inline-block">&larr; Back to Content Hub</Link>
        <div className="bg-card p-8 rounded-lg border">
          <h1 className="text-3xl font-bold mb-6 text-brand-orange">{quiz.title} - Quiz</h1>
          
          {quiz?.quizData?.questions?.map((q, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border rounded-lg">
              <p className="font-bold mb-4">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => {
                  let optionStyle = "bg-secondary hover:bg-muted";
                  if (isSubmitted) {
                    if (option === q.correctAnswer) {
                      optionStyle = "bg-green-500/20 border-green-500 text-green-300";
                    } else if (userAnswers[qIndex] === option) {
                      optionStyle = "bg-red-500/20 border-red-500 text-red-300";
                    } else {
                      optionStyle = "bg-secondary opacity-60";
                    }
                  }

                  return (
                    <label key={oIndex} className={`block p-3 rounded-md cursor-pointer border-2 border-transparent transition-colors ${optionStyle}`}>
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`} 
                        value={option}
                        checked={userAnswers[qIndex] === option}
                        onChange={() => handleAnswerChange(qIndex, option)}
                        disabled={isSubmitted}
                        className="mr-3 accent-brand-orange"
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {!isSubmitted ? (
            <button onClick={handleSubmitQuiz} className="w-full py-3 font-bold text-white bg-brand-orange rounded-md hover:opacity-90">Submit Quiz</button>
          ) : (
            <div className="text-center p-4 bg-background rounded-lg">
              <h2 className="text-2xl font-bold text-brand-orange">Quiz Complete!</h2>
              <p className="text-xl mt-2">Your Score: {score} / {quiz.quizData.questions.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}