'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

export default function QuizPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        const res = await fetch(`http://localhost:8000/api/content/${params.id}/quiz`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch quiz.');
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    };

    if (isAuthenticated) {
      fetchQuiz();
    }
  }, [params.id, isAuthenticated]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = async () => { // Make the function async
    let newScore = 0;
    const totalQuestions = quiz?.quizData.questions.length || 0;

    quiz?.quizData.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    
    setScore(newScore);
    setIsSubmitted(true);

    // --- NEW: Save the result to the backend ---
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:8000/api/analytics/save-quiz-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            contentId: parseInt(params.id),
            score: newScore,
            totalQuestions: totalQuestions,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to save score.");
        }
        console.log("Quiz score saved successfully!");
      } catch (error) {
        console.error("Failed to save quiz score:", error);
      }
    }
    // --- END NEW SECTION ---
  };


  if (authIsLoading || !quiz) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foregrounf">Loading Quiz...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background text-foregrounf p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/content/${params.id}`} className="text-orange-400 hover:underline mb-6 sm:mb-8 inline-block touch-manipulation">&larr; Back to Content Hub</Link>
        <div className="bg-card p-4 sm:p-6 lg:p-8 rounded-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-brand-orange">{quiz.title} - Quiz</h1>
          
          {quiz.quizData.questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 sm:mb-6 p-3 sm:p-4 border border rounded-lg">
              <p className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => {
                  let optionStyle = "bg-gray-700";
                  if (isSubmitted) {
                    if (option === q.correctAnswer) {
                      optionStyle = "bg-green-800 border-green-500";
                    } else if (userAnswers[qIndex] === option) {
                      optionStyle = "bg-red-800 border-red-500";
                    }
                  }

                  return (
                    <label key={oIndex} className={`block p-3 sm:p-4 rounded-md cursor-pointer border-2 border-transparent ${optionStyle} touch-manipulation transition-colors`}>
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`} 
                        value={option}
                        checked={userAnswers[qIndex] === option}
                        onChange={() => handleAnswerChange(qIndex, option)}
                        disabled={isSubmitted}
                        className="mr-3 touch-manipulation"
                      />
                      <span className="text-sm sm:text-base">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {!isSubmitted ? (
            <button onClick={handleSubmitQuiz} className="w-full py-3 sm:py-4 font-bold text-foregrounf bg-orange-600 rounded-md hover:bg-orange-700 touch-manipulation transition-colors">Submit Quiz</button>
          ) : (
            <div className="text-center p-4 sm:p-6 bg-gray-900 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-orange">Quiz Complete!</h2>
              <p className="text-lg sm:text-xl mt-2">Your Score: {score} / {quiz.quizData.questions.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}