import React, { useState, useEffect } from 'react';
import { Award, Code, Users, Rocket, ChevronRight, Sparkles, Trophy, Target } from 'lucide-react';
import { Button } from '../ui/button';

interface TeamIntroProps {
  onComplete: () => void;
}

const TeamIntro: React.FC<TeamIntroProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      type: 'title',
      title: 'Why We\'re the Team to Build Twisky',
      subtitle: 'Our unfair advantage',
      icon: <Rocket className="w-16 h-16" />
    },
    {
      type: 'founder',
      name: 'Favour Olaboye',
      role: 'Co-Founder & CEO',
      image: '/image.png',
      achievements: [
        {
          icon: <Code className="w-5 h-5" />,
          text: 'Mechatronics engineering + deep AI/ML focus'
        },
        {
          icon: <Trophy className="w-5 h-5" />,
          text: 'Microsoft Imagine Cup Quarterfinalist + Winner of multiple Hackathons'
        },
        {
          icon: <Award className="w-5 h-5" />,
          text: 'Microsoft for Startups program ($50k credits)'
        },
        {
          icon: <Target className="w-5 h-5" />,
          text: '2x Founder and raised ₦5M to support autistic individuals with AI-powered tools.'
        }
      ]
    },
    {
      type: 'founder',
      name: 'Dara Akojede',
      role: 'Co-Founder & CTO',
      image: '/dara.jpeg',
      achievements: [
        {
          icon: <Code className="w-5 h-5" />,
          text: 'Research and Development + Blockchain Development (Rust)'
        },
        {
          icon: <Sparkles className="w-5 h-5" />,
          text: 'Founder IncuBed. Built Solana IDL Extractor and Account Generator'
        },
        {
          icon: <Award className="w-5 h-5" />,
          text: 'Bsc. Biomedical Engineering'
        },
        {
          icon: <Trophy className="w-5 h-5" />,
          text: 'Founded Google Developers on Campus-UNILAG, Winner of multiple AI hackathons, GDoC ML, 10x revenue growth for 2 startups'
        }
      ]
    },
    {
      type: 'team-advantage',
      title: 'Combined Team Advantage',
      points: [
        'Complementary Skills: Strong AI/ML + product engineering',
        'Proven Execution: Shipped AI products + traction with competitions',
        'Founder-Market Fit: Deep personal connection + technical capacity',
        'Track Record: Awards, recognition, ambitious projects',
        'Unfair Advantage: Personal story + technical edge + resilience'
      ]
    }
  ];

  useEffect(() => {
    if (isAutoPlaying && currentSlide < slides.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 6000);
      return () => clearTimeout(timer);
    } else if (currentSlide === slides.length - 1) {
      setIsAutoPlaying(false);
    }
  }, [currentSlide, isAutoPlaying, slides.length]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setIsAutoPlaying(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setIsAutoPlaying(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      <div className="absolute inset-0 cosmic-grid opacity-30" />

      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-96 h-96 cosmic-glow rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-20 w-96 h-96 cosmic-glow rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1 transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-12 bg-primary'
                    : index < currentSlide
                    ? 'w-6 bg-primary/50'
                    : 'w-6 bg-muted'
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Intro
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div
            className={`w-full max-w-4xl transition-all duration-500 ${
              isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
            }`}
          >
            {currentSlideData.type === 'title' && (
              <div className="text-center space-y-8">
                <div className="inline-flex p-6 rounded-full cosmic-glass text-primary animate-scale-in">
                  {currentSlideData.icon}
                </div>
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-in">
                    {currentSlideData.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground animate-slide-in-delay">
                    {currentSlideData.subtitle}
                  </p>
                </div>
              </div>
            )}

            {currentSlideData.type === 'founder' && (
              <div className="cosmic-glass p-8 md:p-12 rounded-2xl">
                <div className="grid md:grid-cols-[200px,1fr] gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden cosmic-gradient flex items-center justify-center animate-scale-in">
                      {currentSlideData.image ? (
                        <img
                          src={currentSlideData.image}
                          alt={`${currentSlideData.name} profile photo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-20 h-20 text-primary" />
                      )}
                    </div>
                    <div className="text-center animate-slide-in">
                      <h2 className="text-2xl font-bold">{currentSlideData.name}</h2>
                      <p className="text-muted-foreground">{currentSlideData.role}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {currentSlideData.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-in-left"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="text-primary mt-1">{achievement.icon}</div>
                        <p className="text-foreground">{achievement.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentSlideData.type === 'team-advantage' && (
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-center animate-slide-in">
                  {currentSlideData.title}
                </h2>
                <div className="cosmic-glass p-8 rounded-2xl space-y-4">
                  {currentSlideData.points?.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 animate-slide-in-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-lg text-foreground">{point}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
                  Together, we're the team to redefine omnichannel AI support.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="min-w-[100px]"
          >
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              onClick={handleNext}
              size="sm"
              className="min-w-[120px] group"
            >
              {currentSlide === slides.length - 1 ? 'Enter Pitch' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-in {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }

        .animate-slide-in-delay {
          animation: slide-in 0.5s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default TeamIntro;