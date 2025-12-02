import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardPreview from '@/components/DashboardPreview';
import TeamIntro from '../components/pitch/TeamIntro';
import { ArrowRight, ExternalLink, Calendar, Mail, Twitter, CheckCircle2, TrendingUp, Users, MessageSquare, Clock, Zap, Shield, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

const sections = [
  'title', 'problem', 'solutions', 'what-if', 'product', 'vision',
  'traction', 'differentiation', 'trends', 'timing',
  'founder', 'milestones', 'highlights', 'ask'
];

const Pitch = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState<{[key: number]: boolean}>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark-mode');
    }
    return false; // Default to light mode like home page
  });

  useEffect(() => {
    // Sync with existing theme system used by Header component
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.remove('light-mode');
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      htmlElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (showIntro) return; // Don't run observers when intro is showing

    let observers = new Map();

    // Add a small delay to ensure DOM is rendered
    const timeoutId = setTimeout(() => {
      sections.forEach((section, index) => {
        const element = document.getElementById(section);
        if (element) {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                setCurrentSection(index);
                setIsVisible(prev => ({ ...prev, [index]: true }));
              }
            },
            { threshold: 0.3 }
          );
          observer.observe(element);
          observers.set(section, observer);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observers.forEach(observer => observer.disconnect());
      observers.clear();
    };
  }, [showIntro]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleIntroComplete = () => {
    console.log('Intro completed, switching to main pitch page');
    setIsLoading(true);
    setTimeout(() => {
      setShowIntro(false);
      setIsLoading(false);
    }, 500); // Small delay to show loading state
  };

  if (showIntro) {
    try {
      return <TeamIntro onComplete={handleIntroComplete} />;
    } catch (error) {
      console.error('Error rendering TeamIntro:', error);
      setShowIntro(false); // Fallback to main page
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading pitch deck...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main pitch page');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Progress Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs md:text-sm font-medium">Twisky Pitch Deck</div>
            
            {/* Progress dots - hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(index)}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                    currentSection === index 
                      ? 'bg-cosmic-accent w-4 md:w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme toggle - smaller on mobile */}
              <div className="flex items-center gap-1 md:gap-2">
                <Moon size={14} className={`md:w-4 md:h-4 ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch 
                  checked={!isDarkMode} 
                  onCheckedChange={() => setIsDarkMode(!isDarkMode)} 
                  className="data-[state=checked]:bg-primary scale-75 md:scale-100"
                />
                <Sun size={14} className={`md:w-4 md:h-4 ${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {currentSection + 1} / {sections.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Title */}
      <section id="title" className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-cosmic-accent/5"></div>
        <div className="absolute inset-0 cosmic-grid opacity-20"></div>
        
        <div className={`relative z-10 max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${isVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo/Brand */}
          <div className="space-y-8">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-primary-foreground"></div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-foreground via-cosmic-accent to-blue-400 bg-clip-text text-transparent">
                  Twisky
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl lg:text-4xl font-light text-muted-foreground max-w-4xl mx-auto">
                Automating Customer Support with{' '}
                <span className="font-medium text-foreground">AI agents</span>
              </p>
            </div>
          </div>
          
          {/* Key Stats Preview */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-20 max-w-2xl mx-auto">
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl md:text-3xl font-bold text-cosmic-accent">60-70%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Automation Rate</div>
            </div>
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl md:text-3xl font-bold text-cosmic-accent">$15B</div>
              <div className="text-xs md:text-sm text-muted-foreground">Market Size</div>
            </div>
            <div className="text-center space-y-1 md:space-y-2">
              <div className="text-xl md:text-3xl font-bold text-cosmic-accent">24/7</div>
              <div className="text-xs md:text-sm text-muted-foreground">Availability</div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"></div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Section 2: Problem */}
      <section id="problem" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-4xl mx-auto text-center space-y-8 transition-all duration-1000 ${
          isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Problem</Badge>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter">
            Most customers never get{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent font-bold">
              fast, reliable
            </span>{' '}
            support
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-cosmic-accent">60%+</div>
              <p className="text-muted-foreground">
                of customers expect near-instant answers; many B2B teams still take hours or days
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-red-400">40%</div>
              <p className="text-muted-foreground">
                of customers stop engaging after unresolved complaints
              </p>
            </div>
            <div className="space-y-4">
              <Clock className="w-12 h-12 mx-auto text-orange-400" />
              <p className="text-muted-foreground">
                Repetitive queries overload teams and slow down critical operations
              </p>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-xl bg-card border border-border">
            <p className="text-lg italic">
              "I helped my dad run his laundry's customer support — booking/error calls, repeated questions. 
              That pain is universal and scales badly for B2B companies."
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Current Solutions */}
      <section id="solutions" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Current Solutions</Badge>
          
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            How support is solved today — 
            <span className="text-red-400"> and why it's broken</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <MessageSquare className="w-10 h-10 text-blue-400" />
              <h3 className="text-lg font-semibold">Zendesk</h3>
              <p className="text-sm text-muted-foreground">Enterprise helpdesk with deep ticketing, but slow and outdated. Built for email-era support.</p>
              <div className="text-red-400 text-xs">❌ Hours/days for replies</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Globe className="w-10 h-10 text-green-400" />
              <h3 className="text-lg font-semibold">Intercom</h3>
              <p className="text-sm text-muted-foreground">Modern live chat + AI "Fin" bot. Strong for SMBs, but expensive pricing model.</p>
              <div className="text-red-400 text-xs">❌ $59/seat minimums</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Zap className="w-10 h-10 text-purple-400" />
              <h3 className="text-lg font-semibold">Pylon</h3>
              <p className="text-sm text-muted-foreground">AI-native, B2B-focused. Automates workflows across Slack, Teams, web chat.</p>
              <div className="text-red-400 text-xs">❌ Racing upmarket</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Shield className="w-10 h-10 text-orange-400" />
              <h3 className="text-lg font-semibold">Crisp & Others</h3>
              <p className="text-sm text-muted-foreground">Simple, affordable chat widgets, but lack serious automation or workflows.</p>
              <div className="text-red-400 text-xs">❌ Too simple</div>
            </div>
          </div>
          
          <div className="mt-8 p-6 rounded-xl bg-card border border-border">
            <p className="text-lg italic">
              "Current solutions are either too heavy and expensive (Zendesk/Intercom) or too simple (Crisp). 
              Even AI-first players like Pylon are geared toward larger teams, leaving a gap for mid-market B2B businesses."
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: What If Instead */}
      <section id="what-if" className="min-h-screen flex items-center justify-center py-20 px-6 cosmic-gradient">
        <div className={`max-w-4xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="secondary" className="px-4 py-2 text-lg vision-badge">Vision</Badge>
          
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter vision-title">
            What if support just…{' '}
            <span className="text-cosmic-accent">worked?</span>
          </h2>
          
          <p className="text-xl vision-subtitle max-w-3xl mx-auto">
            What if a smart system answered routine queries instantly, escalated only when necessary, 
            and gave agents perfect context?
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl vision-card space-y-4">
              <div className="text-3xl font-bold text-cosmic-accent">50-70%</div>
              <p className="vision-text">Instant answers for routine queries</p>
            </div>
            <div className="p-6 rounded-xl vision-card space-y-4">
              <ArrowRight className="w-8 h-8 text-cosmic-accent" />
              <p className="vision-text">Seamless escalation to the right channel</p>
            </div>
            <div className="p-6 rounded-xl vision-card space-y-4">
              <Users className="w-8 h-8 text-cosmic-accent" />
              <p className="vision-text">Clear, editable AI-suggested replies for agents</p>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-xl vision-card">
            <p className="vision-text text-lg">
              User types on website or WhatsApp → instant helpful reply; if complex, 
              Twisky escalates to the required platform with summary and draft reply.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Product (with DashboardPreview) */}
      <section id="product" className="min-h-screen py-20 px-6">
        <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center space-y-6">
            <Badge variant="outline" className="px-4 py-2 text-lg">Product</Badge>
            
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
              <span className="bg-gradient-to-r from-cosmic-accent to-blue-400 bg-clip-text text-transparent font-bold">Twisky</span> — 
              AI agents that run customer support
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-cosmic-accent mx-auto" />
                <p className="text-sm text-foreground">AI-native support platform built for B2B</p>
              </div>
              <div className="space-y-2">
                <Zap className="w-8 h-8 text-cosmic-accent mx-auto" />
                <p className="text-sm text-foreground">Multi-agent orchestration</p>
              </div>
              <div className="space-y-2">
                <MessageSquare className="w-8 h-8 text-cosmic-accent mx-auto" />
                <p className="text-sm text-foreground">Omnichannel: Website, WhatsApp, Email, Slack, etc</p>
              </div>
              <div className="space-y-2">
                <Users className="w-8 h-8 text-cosmic-accent mx-auto" />
                <p className="text-sm text-foreground">Auto-summaries, demos, editable AI replies</p>
              </div>
            </div>
            
            {/* <div className="flex items-center justify-center gap-4 mt-8">
              <Button size="lg" className="gap-2" asChild>
                <a href="/book-demo" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Try Demo
                </a>
              </Button>
              <a 
                href="https://usetwisky.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                usetwisky.com
              </a>
            </div> */}
          </div>
          
          {/* Dashboard Preview Integration - Mobile Responsive */}
          <div className="mt-8 md:mt-16">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px] md:min-w-full">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Vision & Market */}
      <section id="vision" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Vision & Market</Badge>
          
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Our vision — world-class{' '}
            <span className="bg-gradient-to-r from-cosmic-accent to-blue-400 bg-clip-text text-transparent font-bold">
              automated support
            </span>{' '}
            for every business
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 mt-16 items-center">
            <div className="space-y-6 text-left">
              <div className="space-y-4">
                <p className="text-lg">
                  We're building the default support layer for modern businesses — AI-first, channel-native.
                </p>
                <p className="text-muted-foreground">
                  Long-term: Twisky becomes the backbone for post-sales operations 
                  (support, onboarding, renewals).
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Like Zendesk for the human era, but AI-native from day one.
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="p-8 rounded-xl bg-card border border-border text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cosmic-accent to-blue-400 bg-clip-text text-transparent">
                  $12-15B
                </div>
                <div className="text-lg font-medium mt-2">AI for Customer Service Market</div>
                <div className="text-cosmic-accent font-semibold">25%+ CAGR</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-card border border-border text-center">
                  <TrendingUp className="w-6 h-6 text-cosmic-accent mx-auto mb-2" />
                  <div className="text-sm">Rapidly expanding automation spend</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border text-center">
                  <Globe className="w-6 h-6 text-cosmic-accent mx-auto mb-2" />
                  <div className="text-sm">Post-sales operations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Traction */}
      <section id="traction" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[6] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2 text-lg">Traction</Badge>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mt-6">
              Early traction & validation
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-cosmic-accent mx-auto" />
              <div className="text-2xl font-bold">Live</div>
              <p className="text-sm text-muted-foreground">Prototype powering multi-agent flows</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border text-center space-y-4">
              <Users className="w-10 h-10 text-cosmic-accent mx-auto" />
              <div className="text-2xl font-bold">Demo</div>
              <p className="text-sm text-muted-foreground">Bookings with early users</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border text-center space-y-4">
              <TrendingUp className="w-10 h-10 text-cosmic-accent mx-auto" />
              <div className="text-2xl font-bold">60-70%</div>
              <p className="text-sm text-muted-foreground">Automation rate in tests</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border text-center space-y-4">
              <Calendar className="w-10 h-10 text-cosmic-accent mx-auto" />
              <div className="text-2xl font-bold">100%</div>
              <p className="text-sm text-muted-foreground">Demo booking success rate</p>
            </div>
          </div>
          
          <div className="mt-12 p-8 rounded-xl bg-card border border-border">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg italic mb-4">
                "A salon business cut manual support time by hours per week in pilot testing."
              </p>
              {/* <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <span>• Chainlit → LangGraph migration complete</span>
                <span>• Google Calendar integration working</span>
                <span>• Multi-channel pilot successful</span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Differentiation */}
      <section id="differentiation" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[7] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2 text-lg">Differentiation</Badge>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mt-6">
              Why <span className="bg-gradient-to-r from-cosmic-accent to-blue-400 bg-clip-text text-transparent font-bold">Twisky</span> wins
            </h2>
          </div>
          
          {/* Competitive Matrix - Mobile Responsive */}
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border border-border rounded-xl bg-card">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left">Feature</th>
                    <th className="p-4 text-center">Twisky</th>
                    <th className="p-4 text-center">Zendesk</th>
                    <th className="p-4 text-center">Intercom</th>
                    <th className="p-4 text-center">Pylon</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium">AI-Native Foundation</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-cosmic-accent mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">✗</td>
                    <td className="p-4 text-center text-muted-foreground">✗</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium">Mid-Market Focus</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-cosmic-accent mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                    <td className="p-4 text-center text-muted-foreground">~</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium">Omnichannel</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-cosmic-accent mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">~</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium">Pricing Simplicity</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-cosmic-accent mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">~</td>
                    <td className="p-4 text-center text-muted-foreground">~</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Setup Speed</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-cosmic-accent mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">✗</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                    <td className="p-4 text-center text-muted-foreground">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">Competitive Comparison</h3>
                
                {/* Feature Cards */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-semibold mb-3">AI-Native Foundation</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cosmic-accent" />
                        <span className="font-medium">Twisky</span>
                      </div>
                      <div className="text-muted-foreground">Zendesk: ✗</div>
                      <div className="text-muted-foreground">Intercom: ✗</div>
                      <div className="text-muted-foreground">Pylon: ✓</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-semibold mb-3">Mid-Market Focus</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cosmic-accent" />
                        <span className="font-medium">Twisky</span>
                      </div>
                      <div className="text-muted-foreground">Zendesk: ✓</div>
                      <div className="text-muted-foreground">Intercom: ✓</div>
                      <div className="text-muted-foreground">Pylon: ~</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-semibold mb-3">Omnichannel</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cosmic-accent" />
                        <span className="font-medium">Twisky</span>
                      </div>
                      <div className="text-muted-foreground">Zendesk: ~</div>
                      <div className="text-muted-foreground">Intercom: ✓</div>
                      <div className="text-muted-foreground">Pylon: ✓</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-semibold mb-3">Pricing Simplicity</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cosmic-accent" />
                        <span className="font-medium">Twisky</span>
                      </div>
                      <div className="text-muted-foreground">Zendesk: ~</div>
                      <div className="text-muted-foreground">Intercom: ~</div>
                      <div className="text-muted-foreground">Pylon: ✓</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="font-semibold mb-3">Setup Speed</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cosmic-accent" />
                        <span className="font-medium">Twisky</span>
                      </div>
                      <div className="text-muted-foreground">Zendesk: ✗</div>
                      <div className="text-muted-foreground">Intercom: ✓</div>
                      <div className="text-muted-foreground">Pylon: ✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Differentiators */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <Zap className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">AI-Native from Day 1</h3>
              <p className="text-sm text-muted-foreground">
                Full orchestration with agents (knowledge, scheduling, escalation). Not "AI add-ons" bolted onto ticket systems.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <Users className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">Mid-Market Focus</h3>
              <p className="text-sm text-muted-foreground">
                Modern AI support built for lean B2B teams and growing startups. Pylon races upmarket, we fill the gap.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <MessageSquare className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">Omnichannel Flexibility</h3>
              <p className="text-sm text-muted-foreground">
                Website chat, Slack, WhatsApp, email — all unified. Escalations routed wherever the team actually works.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <Shield className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">Simple + Affordable</h3>
              <p className="text-sm text-muted-foreground">
                Powerful automation like Pylon, but packaged in Crisp-like simplicity. Pay for usage, not complexity.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <Clock className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">Faster Setup</h3>
              <p className="text-sm text-muted-foreground">
                Plug-and-play knowledge sync. No months-long onboarding. Launch AI support in days, not quarters.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-3">
              <TrendingUp className="w-8 h-8 text-cosmic-accent" />
              <h3 className="font-semibold">Our Edge</h3>
              <p className="text-sm text-muted-foreground">
                Combines the power of Pylon with the simplicity and accessibility of Crisp. Wide-open wedge in a $15B market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Trends */}
      {/* <section id="trends" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[8] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Market Trends</Badge>
          
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Riding two waves:{' '}
            <span className="bg-gradient-to-r from-cosmic-accent to-blue-400 bg-clip-text text-transparent font-bold">AI + Modern commerce</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border space-y-3 md:space-y-4">
              <Zap className="w-10 h-10 md:w-12 md:h-12 text-cosmic-accent mx-auto" />
              <h3 className="text-lg md:text-xl font-semibold">LLM Breakthroughs</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Enable grounded, fast QA from docs (RAG)
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border space-y-3 md:space-y-4">
              <Clock className="w-10 h-10 md:w-12 md:h-12 text-cosmic-accent mx-auto" />
              <h3 className="text-lg md:text-xl font-semibold">24/7 Expectations</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Businesses demand immediate answers across channels
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border space-y-3 md:space-y-4">
              <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-cosmic-accent mx-auto" />
              <h3 className="text-lg md:text-xl font-semibold">Channel Expansion</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Modern channels like WhatsApp/ecommerce chat adoption by developers & SMBs
              </p>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-xl bg-card border border-border">
            <p className="text-lg italic">
              "We have better models, better infra, and more channels than 3 years ago — now's the moment."
            </p>
          </div>
        </div>
      </section> */}

      {/* Section 9: Timing */}
      <section id="timing" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[9] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Timing</Badge>
          
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Why now — timing & enablers
          </h2>
          
          {/* Timeline */}
          <div className="relative mt-16">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cosmic-accent to-transparent"></div>
            
            <div className="space-y-12">
              <div className="flex items-center gap-8">
                <div className="flex-1 text-right">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">LLM Maturity</h3>
                    <p className="text-sm text-muted-foreground">
                      Improved RAG patterns and agentic workflows reduce hallucination risk
                    </p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-cosmic-accent rounded-full relative z-10"></div>
                <div className="flex-1"></div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex-1"></div>
                <div className="w-4 h-4 bg-cosmic-accent rounded-full relative z-10"></div>
                <div className="flex-1 text-left">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Modern Channels</h3>
                    <p className="text-sm text-muted-foreground">
                      Cloud messaging(WhatsApp, Telegram, etc) adoption is mainstream for SMBs and developers
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex-1 text-right">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Cost Reduction</h3>
                    <p className="text-sm text-muted-foreground">
                      Reduced hosting & embedding costs make per-conversation economics viable
                    </p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-cosmic-accent rounded-full relative z-10"></div>
                <div className="flex-1"></div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex-1"></div>
                <div className="w-4 h-4 bg-cosmic-accent rounded-full relative z-10"></div>
                <div className="flex-1 text-left">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Customer Expectations</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant responses expected; businesses will pay for better retention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Founder */}
      {/* <section id="founder" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[10] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2 text-lg">Founder</Badge>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mt-6">
              Why I'm building Twisky
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-cosmic-accent/20 shadow-lg">
                <img 
                  src="/image.png" 
                  alt="Favour Olaboye - Founder & CEO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold">Favour Olaboye</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-cosmic-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">20-year-old engineer</h4>
                    <p className="text-sm text-muted-foreground">
                      Love building cool things especially AI & robots, user focused;
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-cosmic-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">First-hand problem experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Ran family laundry support, experienced repetitive pain firsthand
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-cosmic-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Deep product & technical drive</h4>
                    <p className="text-sm text-muted-foreground">
                      Built Web Applications, Multi-Agent Systems, Slack/WhatsApp integrations, and live pilot flows
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-cosmic-accent mt-1" />
                  <div>
                    <h4 className="font-semibold">Full-time commitment</h4>
                    <p className="text-sm text-muted-foreground">
                      Dedicated to launching Twisky and iterating with early customers
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <p className="italic">
                  "Learning from the radio repairman and helping my dad taught me that the best solutions 
                  come from understanding real problems deeply."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Section 11: Milestones */}
      <section id="milestones" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[11] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2 text-lg">Next 12 Months</Badge>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mt-6">
              If you back us now — where we'll be in 12 months
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Use of Funds */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-center">Use of $1M</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cosmic-accent rounded-lg flex items-center justify-center text-cosmic-darker font-bold">
                    70%
                  </div>
                  <div>
                    <h4 className="font-semibold">Product & Go-to-Market</h4>
                    <p className="text-sm text-muted-foreground">
                      Cloud hosting, API costs, paid acquisition, content
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
                    20%
                  </div>
                  <div>
                    <h4 className="font-semibold">Ops & Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      Integrations, legal, SOC2 prep
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center text-white font-bold">
                    10%
                  </div>
                  <div>
                    <h4 className="font-semibold">Buffer</h4>
                    <p className="text-sm text-muted-foreground">
                      Runway & emergencies
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Milestones */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-center">Key Milestones</h3>
              
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-cosmic-accent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">30-60 days</span>
                  </div>
                  <h4 className="font-semibold mb-2">Launch Public Beta</h4>
                  <p className="text-sm text-muted-foreground">
                    Dashboard + omnichannel widget live
                  </p>
                </div>
                
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-cosmic-accent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">9 months</span>
                  </div>
                  <h4 className="font-semibold mb-2">Customer Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Paying customers with measurable conversation volume
                  </p>
                </div>
                
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-cosmic-accent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">12 months</span>
                  </div>
                  <h4 className="font-semibold mb-2">AI Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    70% AI deflection + core analytics instrumented
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 bg-cosmic-accent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">12 months</span>
                  </div>
                  <h4 className="font-semibold mb-2">GTM Pipeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Build early GTM pipeline with mid-market B2B teams (e.g. SaaS, services, etc)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 12: Highlights */}
      {/* <section id="highlights" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[12] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg">Investment Highlights</Badge>
          
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Why invest — final takeaways
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <Users className="w-12 h-12 text-cosmic-accent mx-auto" />
              <h3 className="font-semibold">Proven founder-market fit</h3>
              <p className="text-sm text-muted-foreground">
                Personal problem + product instincts
              </p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-cosmic-accent mx-auto" />
              <h3 className="font-semibold">Working prototype</h3>
              <p className="text-sm text-muted-foreground">
                Live integrations (Slack, WhatsApp, Google Calendar)
              </p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-cosmic-accent mx-auto" />
              <h3 className="font-semibold">Cost-efficient approach</h3>
              <p className="text-sm text-muted-foreground">
                Planner/doer reduces LLM spending
              </p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <Globe className="w-12 h-12 text-cosmic-accent mx-auto" />
              <h3 className="font-semibold">Massive market</h3>
              <p className="text-sm text-muted-foreground">
                $12-15B with timing advantage
              </p>
            </div>
          </div>
          
          <div className="mt-12 p-8 rounded-xl bg-card border border-border">
            <p className="text-lg">
              "We already have interest from early pilots; happy to introduce."
            </p>
          </div>
        </div>
      </section> */}

      {/* Section 13: Ask & Contact */}
      <section id="ask" className="min-h-screen flex items-center justify-center py-20 px-6 cosmic-gradient">
        <div className={`max-w-4xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[13] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="secondary" className="px-4 py-2 text-lg ask-badge">The Ask</Badge>
          
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter ask-title">
            Let's build faster — 
            <span className="text-cosmic-accent">join us</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="p-6 md:p-8 rounded-xl pitch-ask-card backdrop-blur-sm space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-semibold pitch-ask-title">Funding Ask</h3>
              <div className="text-3xl md:text-4xl font-bold text-cosmic-accent">$500k - $1M</div>
              <p className="pitch-ask-subtitle">Pre-seed round</p>
              
              <div className="space-y-1 md:space-y-2 text-left pitch-ask-card">
                <p className="text-xs md:text-sm">• Product development & marketing</p>
                <p className="text-xs md:text-sm">• Compliance & integrations</p>
                <p className="text-xs md:text-sm">• 12-month runway</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 rounded-xl pitch-ask-card backdrop-blur-sm space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-semibold pitch-ask-title">Get in Touch</h3>
              
              <div className="space-y-3 md:space-y-4">
                <Button size="lg" className="w-full gap-2 text-sm md:text-base" variant="secondary" asChild>
                  <a href="mailto:favour@usetwisky.com">
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">favour@usetwisky.com</span>
                    <span className="sm:hidden">Email</span>
                  </a>
                </Button>
                
                <div className="flex gap-2 md:gap-3">
                  <Button size="lg" className="flex-1 gap-2 text-xs md:text-sm" variant="outline" asChild>
                    <a href="https://usetwisky.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">usetwisky.com</span>
                      <span className="sm:hidden">Website</span>
                    </a>
                  </Button>
                  <Button size="lg" className="flex-1 gap-2 text-xs md:text-sm" variant="outline" asChild>
                    <a href="https://twitter.com/usetwisky" target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4" />
                      <span className="hidden sm:inline">@usetwisky</span>
                      <span className="sm:hidden">Twitter</span>
                    </a>
                  </Button>
                </div>
                
                <Button size="lg" className="w-full gap-2 text-sm md:text-base" asChild>
                  <a href="/book-demo" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4" />
                    Book a Demo
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* <div className="mt-12 p-6 rounded-xl pitch-ask-card backdrop-blur-sm">
            <p className="pitch-ask-card text-lg">
              Would love 15 minutes to demo the product & discuss fit for your portfolio.
            </p>
          </div> */}
        </div>
      </section>
    </div>
  );
};

export default Pitch;