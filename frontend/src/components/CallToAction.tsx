import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Rocket, Star } from 'lucide-react';

// Sliding text animation component
const SlidingText = ({ children, delay = 0, trigger = false, reset = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (reset) {
      setIsVisible(false);
      return;
    }
    
    if (trigger) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, trigger, reset]);
  
  return (
    <div className={`transform transition-all duration-1000 ease-out ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {children}
    </div>
  );
};

// Magnetic button effect
const MagneticButton = ({ children, ...props }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    
    setPosition({ x: deltaX, y: deltaY });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };
  
  return (
    <div
      className="inline-block"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s ease-out'
      }}
    >
      {React.cloneElement(children, {
        className: `${children.props.className} ${isHovered ? 'scale-110 shadow-2xl' : ''}`,
        ...props
      })}
    </div>
  );
};

// Animated background patterns
const AnimatedBackground = () => {
  return (
    <>
      {/* Sliding geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/4 -right-5 w-16 h-16 bg-primary/15 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute -bottom-5 left-1/3 w-12 h-12 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        
        {/* Sliding lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Rotating elements */}
      <div className="absolute top-10 right-10 w-6 h-6">
        <Star className="w-full h-full text-primary/40 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <div className="absolute bottom-20 left-10 w-8 h-8">
        <Zap className="w-full h-full text-primary/30 animate-pulse" />
      </div>
    </>
  );
};

const CallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showRocket, setShowRocket] = useState(false);
  const [animationReset, setAnimationReset] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationReset(false);
          setIsVisible(true);
          // Trigger rocket animation after a delay
          setTimeout(() => setShowRocket(true), 2000);
        } else {
          // Reset all animations when scrolling away
          setAnimationReset(true);
          setIsVisible(false);
          setShowRocket(false);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('cta-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);
  
  // Mouse tracking for parallax effects
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <section 
      id="cta-section" 
      className="w-full py-20 px-6 md:px-12 bg-gradient-to-br from-background via-card to-background relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced Background Effects with Parallax */}
      <AnimatedBackground />
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      {/* Parallax glow effects that follow mouse */}
      <div 
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 20 - 50}px, ${mousePosition.y * 20 - 50}px)`
        }}
      >
        <div className="w-full h-full opacity-15 bg-primary blur-[80px] animate-pulse"></div>
      </div>
      <div 
        className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -20}px)`
        }}
      >
        <div className="w-full h-full opacity-10 bg-primary blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Flying rocket animation */}
      <div className={`absolute top-10 transition-all duration-3000 ease-out ${
        showRocket ? 'left-full opacity-0' : '-left-20 opacity-100'
      }`}>
        <Rocket className="w-8 h-8 text-primary/60 rotate-45" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div 
          className={`text-center space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Animated Badge with sliding effect */}
          <div className="flex justify-center">
            <SlidingText delay={500} trigger={isVisible} reset={animationReset}>
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm hover:bg-primary/20 transition-all duration-300 cursor-pointer group">
                <Sparkles className="h-4 w-4 animate-pulse group-hover:animate-spin" />
                <span className="relative">
                  Ready to transform your support?
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </span>
              </div>
            </SlidingText>
          </div>

          {/* Main Heading with Enhanced Animations */}
          <div className="space-y-4">
            <SlidingText delay={800} trigger={isVisible} reset={animationReset}>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-balance hover:scale-105 transition-transform duration-300">
                <span className="inline-block animate-slide-in-left">Want faster, smarter{' '}</span>
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70 animate-gradient-x">
                    customer support?
                  </span>
                  <div className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full animate-pulse"></div>
                  {/* Glitch effect overlay */}
                  <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-primary/50 to-primary/30 animate-pulse" style={{ animationDelay: '2s' }}>
                    customer support?
                  </span>
                </span>
              </h2>
            </SlidingText>
            
            <SlidingText delay={1200} trigger={isVisible} reset={animationReset}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto hover:text-foreground transition-colors duration-300">
                See how Twisky cuts the busywork and brings your support teams into one place.
              </p>
            </SlidingText>
          </div>

          {/* Enhanced CTA Button with Magnetic Effect */}
          <SlidingText delay={1600} trigger={isVisible} reset={animationReset}>
            <div className="pt-6">
              <MagneticButton>
                <Link to="/book-demo">
                  <Button 
                    size="lg" 
                    className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-10 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 group overflow-hidden"
                  >
                    {/* Animated background gradient */}
                    <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                      Book a Demo
                      <ArrowRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:scale-125" />
                    </span>
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </SlidingText>

          {/* Trust Indicators */}
          <div 
            className={`pt-8 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Trusted by fast-growing B2B companies
              </p>
              <div className="flex items-center gap-6 opacity-60">
                {/* Placeholder company logos */}
                <div className="h-8 w-20 bg-muted/50 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-muted/50 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-muted/50 rounded animate-pulse"></div>
                <div className="h-8 w-18 bg-muted/50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;