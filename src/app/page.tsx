import Link from 'next/link';
import { CheckCircle, BarChart, MessageSquare, BookOpen, BrainCircuit, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-orange">sAInik</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="text-gray-300 hover:text-foreground text-sm sm:text-base">Login</Link>
          <Link href="/register" className="bg-orange-600 hover:bg-orange-700 text-foreground font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300 text-sm sm:text-base">
            Register
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Your AI Study Buddy for <span className="text-brand-orange">NDA Success</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Collaborate, learn, and master your subjects with a personalized AI assistant. Anytime. Anywhere.
          </p>
          <Link href="/register" className="inline-block bg-orange-600 hover:bg-orange-700 text-foreground font-bold py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition duration-300 touch-manipulation">
            Start Your Journey Today
          </Link>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-12 sm:py-16 md:py-20 bg-card px-4 sm:px-6">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">Key Features</h3>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Everything you need to conquer the NDA exam.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<BrainCircuit size={40} className="text-brand-orange" />}
                title="AI Summarizer & Quizzes"
                description="Upload any PDF or video and instantly get concise summaries and practice quizzes to test your knowledge."
              />
              <FeatureCard
                icon={<Users size={40} className="text-brand-orange" />}
                title="Collaborative Study Rooms"
                description="Join real-time chat rooms with a shared whiteboard to solve problems and learn with your peers."
              />
              <FeatureCard
                icon={<BarChart size={40} className="text-brand-orange" />}
                title="Personalized Analytics"
                description="Track your quiz scores over time with intuitive charts and detailed reports to identify your strengths and weaknesses."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
            <div className="container mx-auto text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 leading-tight px-2">
                    Built for NDA Aspirants, Especially <span className="text-brand-orange">Hindi-Medium</span> Students
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <TestimonialCard
                        quote="The live translation and AI summaries have been a game-changer. I can finally understand complex topics from English materials."
                        author="Ankit S."
                    />
                    <TestimonialCard
                        quote="Collaborating on the whiteboard with other aspirants is the best feature. It feels like a real study group."
                        author="Priya Sharma"
                    />
                    <TestimonialCard
                        quote="The analytics page showed me I was weak in Trigonometry. I focused on it and my scores improved dramatically. Highly recommended!"
                        author="Rohan K."
                    />
                </div>
            </div>
        </section>


        {/* Final CTA Section */}
        <section className="bg-card py-12 sm:py-16 md:py-20 text-center px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">Be NDA-Ready with AI.</h3>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 mb-6 sm:mb-8 px-2">Start your journey today and give your preparation the ultimate advantage.</p>
          <Link href="/register" className="inline-block bg-orange-600 hover:bg-orange-700 text-foreground font-bold py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition duration-300 touch-manipulation">
            Sign Up for Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
        <p className="text-sm sm:text-base">&copy; 2025 sAInik. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Helper components for cards
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-background p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors duration-300">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h4 className="text-lg sm:text-xl font-bold mb-2 text-center">{title}</h4>
    <p className="text-muted-foreground text-sm sm:text-base text-center leading-relaxed">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author }: { quote: string, author: string }) => (
    <div className="bg-background p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors duration-300">
        <p className="text-gray-300 italic text-sm sm:text-base leading-relaxed">"{quote}"</p>
        <p className="text-orange-400 font-bold mt-3 sm:mt-4 text-sm sm:text-base">- {author}</p>
    </div>
);