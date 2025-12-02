import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Calendar, Mail, Twitter, CheckCircle2, TrendingUp, Users, MessageSquare, Clock, Zap, Shield, Globe, DollarSign, Sparkles, Lock, Rocket } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

const HarmoniaPitch = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState<{[key: number]: boolean}>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark-mode');
    }
    return false;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.remove('light-mode');
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      htmlElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const sections = [
    'title', 'problem', 'current-solutions', 'solution', 'target-audience',
    'market', 'technology', 'next-steps', 'team'
  ];

  useEffect(() => {
    const observers = new Map();

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

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Progress Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs md:text-sm font-medium">Swan Suite Pitch</div>

            {/* Progress dots */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(index)}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                    currentSection === index
                      ? 'bg-pink-500 w-4 md:w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme toggle */}
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
        <div className="absolute inset-0 pink-cosmic-gradient"></div>
        <div className="absolute inset-0 cosmic-grid opacity-20"></div>

        <div className={`relative z-10 max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${isVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-8">

            <div className="space-y-6">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg mb-8">
                <Sparkles className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Swan Suite
                </span>
              </h1>

              <p className="text-2xl md:text-3xl lg:text-4xl font-light text-muted-foreground max-w-4xl mx-auto">
                Trustless{' '}
                <span className="font-medium text-foreground">Creator-Brand Collaboration</span>
                {' '}Platform
              </p>
            </div>

            {/* Powered by Sui badge */}
            <div className="flex justify-center mt-8">
              <Badge variant="outline" className="px-4 py-2 border-blue-500/30 bg-blue-500/10">
                <span className="text-blue-400 font-medium">Powered by Sui</span>
              </Badge>
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
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">The Problem</Badge>

          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter">
            The{' '}
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent font-bold">
              $2B Trust Gap
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Creators get burned, brands get ghosted
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Globe className="w-10 h-10 text-purple-400 mx-auto" />
              <div className="text-lg font-semibold">Need for Online Presence</div>
              <p className="text-sm text-muted-foreground">
                Brands struggle to maintain consistent online presence
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Clock className="w-10 h-10 text-red-400 mx-auto" />
              <div className="text-2xl font-bold text-red-400">67%</div>
              <p className="text-sm text-muted-foreground">
                Payment delays: Creators wait 30+ days for payment
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Users className="w-10 h-10 text-orange-400 mx-auto" />
              <div className="text-lg font-semibold">Ghost Campaigns</div>
              <p className="text-sm text-muted-foreground">
                Brands disappear after content delivery
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <MessageSquare className="w-10 h-10 text-yellow-400 mx-auto" />
              <div className="text-lg font-semibold">Dispute Hell</div>
              <p className="text-sm text-muted-foreground">
                No clear resolution when deliverables are questioned
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-card border border-border">
            <p className="text-lg italic">
              "It's like hiring a contractor to paint your house, paying upfront, but having no guarantee they'll show up —
              or paying after the work but they have no guarantee you'll actually pay."
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Current Solutions */}
      <section id="current-solutions" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">Current Solutions</Badge>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Why current solutions{' '}
            <span className="text-red-400">fail</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 mt-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-left">Traditional Escrow Services</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Slow (3-5 business days)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Expensive (3-8% fees)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Still requires human arbitration</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">No integration with social platforms</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-left">Existing Web3 Attempts</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Built for simple payments, not complex workflows</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Can't handle multi-party campaign logic</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Poor user experience for non-crypto natives</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Mutable dispute resolution mechanisms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Solution */}
      <section id="solution" className="min-h-screen flex items-center justify-center py-20 px-6 pink-cosmic-gradient">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="secondary" className="px-4 py-2 text-lg bg-pink-500/20 border-pink-500/30">Our Solution</Badge>

          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">
            Programmable{' '}
            <span className="text-pink-500">Trust</span>
          </h2>

          <p className="text-xl max-w-3xl mx-auto">
            Automated escrow that pays creators instantly when they deliver
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold">1. Brand Deposits</h3>
              <p className="text-sm text-muted-foreground">
                Funds into campaign smart contract
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold">2. Creator Applies</h3>
              <p className="text-sm text-muted-foreground">
                Gets accepted into campaign
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold">3. Content Delivered</h3>
              <p className="text-sm text-muted-foreground">
                Verified on-chain automatically
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold">4. Instant Payment</h3>
              <p className="text-sm text-muted-foreground">
                No waiting, no disputes
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20">
            <p className="text-lg">
              <strong>Think of it like:</strong> A vending machine for influencer marketing.
              You put money in, creator delivers content, money comes out automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Target Audience */}
      <section id="target-audience" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">Target Audience</Badge>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            Who we're{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
              building for
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <Users className="w-12 h-12 text-pink-500 mx-auto" />
              <h3 className="text-xl font-semibold">Target Creators</h3>
              <p className="text-muted-foreground">1K-1M+ followers tired of payment delays</p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <Shield className="w-12 h-12 text-purple-500 mx-auto" />
              <h3 className="text-xl font-semibold">Target Brands</h3>
              <p className="text-muted-foreground">Brands wanting guaranteed content delivery</p>
            </div>
            <div className="p-8 rounded-xl bg-card border border-border text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="text-xl font-semibold">Target Agencies</h3>
              <p className="text-muted-foreground">Agencies managing multiple creator campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Market */}
      <section id="market" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-5xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">Market Opportunity</Badge>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
              $16B Creator Economy
            </span>{' '}
            growing 25% annually
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg font-semibold mb-4">Revenue Model</h3>
              <div className="space-y-2 text-left">
                <p className="text-sm text-muted-foreground">• Platform fees on completed campaigns (2-5%)</p>
                <p className="text-sm text-muted-foreground">• AI-powered analytics and campaign management tools</p>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg font-semibold mb-4">Market Size</h3>
              <div className="text-3xl font-bold text-pink-500">$16B</div>
              <div className="text-sm text-muted-foreground mt-2">Growing at 25% annually</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Technology */}
      <section id="technology" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-1000 ${
          isVisible[6] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">Technology</Badge>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mt-6">
              Why <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent font-bold">Sui</span> is Perfect
            </h2>
          </div>

          <div className="text-center mb-8">
            <p className="text-xl text-muted-foreground">
              Creator campaigns are natural objects with complex ownership
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Shield className="w-10 h-10 text-blue-400" />
              <h3 className="text-lg font-semibold">Object-Centric Model</h3>
              <p className="text-sm text-muted-foreground">
                Each campaign is a Sui object with built-in access controls
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Zap className="w-10 h-10 text-cyan-400" />
              <h3 className="text-lg font-semibold">Parallel Execution</h3>
              <p className="text-sm text-muted-foreground">
                Multiple campaigns settle simultaneously without bottlenecks
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Clock className="w-10 h-10 text-green-400" />
              <h3 className="text-lg font-semibold">Sub-Second Finality</h3>
              <p className="text-sm text-muted-foreground">
                Payments release instantly upon content verification
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Users className="w-10 h-10 text-purple-400" />
              <h3 className="text-lg font-semibold">Shared Objects</h3>
              <p className="text-sm text-muted-foreground">
                Multiple parties (brand, creator, platform) can interact safely
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <Lock className="w-10 h-10 text-pink-400" />
              <h3 className="text-lg font-semibold">Move Language</h3>
              <p className="text-sm text-muted-foreground">
                Memory safety ensures funds can never be lost or duplicated
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <TrendingUp className="w-10 h-10 text-orange-400" />
              <h3 className="text-lg font-semibold">Revolutionary</h3>
              <p className="text-sm text-muted-foreground">
                Try modeling complex multi-party workflows on other chains
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-4xl font-medium tracking-tighter mb-8">
              Showcasing Sui's advantages in a{' '}
              <span className="text-pink-500">real-world use case</span>
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <Sparkles className="w-10 h-10 text-pink-500 mx-auto" />
                <h3 className="font-semibold">Object-Centric Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Demonstrates object-centric programming benefits
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <Zap className="w-10 h-10 text-blue-500 mx-auto" />
                <h3 className="font-semibold">Parallel Execution</h3>
                <p className="text-sm text-muted-foreground">
                  Shows parallel execution solving real bottlenecks
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <Lock className="w-10 h-10 text-purple-500 mx-auto" />
                <h3 className="font-semibold">Move Safety</h3>
                <p className="text-sm text-muted-foreground">
                  Proves Move's safety guarantees matter for financial applications
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <Globe className="w-10 h-10 text-cyan-500 mx-auto" />
                <h3 className="font-semibold">Network Effects</h3>
                <p className="text-sm text-muted-foreground">
                  Creates network effects that attract more creators to Sui ecosystem
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-xl bg-card border border-border">
              <p className="text-lg italic">
                <strong>Bottom line:</strong> We're not just building a product - we're proving Sui can solve problems
                other blockchains can't handle elegantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Next Steps */}
      {/* <section id="next-steps" className="min-h-screen flex items-center justify-center py-20 px-6 pink-cosmic-gradient">
        <div className={`max-w-4xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[7] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="secondary" className="px-4 py-2 text-lg bg-pink-500/20 border-pink-500/30">Next Steps</Badge>

          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">
            Ready to transform{' '}
            <span className="text-pink-500">creator collaboration</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <Rocket className="w-10 h-10 text-pink-500 mx-auto" />
              <h3 className="font-semibold">Launch</h3>
              <p className="text-sm text-muted-foreground">
                Launching with high-value creator partnerships
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <Zap className="w-10 h-10 text-blue-500 mx-auto" />
              <h3 className="font-semibold">Build</h3>
              <p className="text-sm text-muted-foreground">
                Building on Sui's cutting-edge infrastructure
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20 space-y-4">
              <Shield className="w-10 h-10 text-purple-500 mx-auto" />
              <h3 className="font-semibold">Create</h3>
              <p className="text-sm text-muted-foreground">
                Creating the first truly trustless creator economy platform
              </p>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-pink-500/20">
            <h3 className="text-2xl font-semibold mb-4">The Future is Here</h3>
            <p className="text-lg">
              The future of influencer marketing is <strong>programmable</strong>, <strong>instant</strong>,
              and built on <strong>Sui</strong>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button size="lg" className="gap-2 bg-pink-500 hover:bg-pink-600" asChild>
              <a href="mailto:contact@harmoniaprotocol.com">
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-pink-500/30" asChild>
              <a href="https://harmoniaprotocol.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Section 9: Team */}
      <section id="team" className="min-h-screen flex items-center justify-center py-20 px-6">
        <div className={`max-w-6xl mx-auto text-center space-y-12 transition-all duration-1000 ${
          isVisible[8] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="px-4 py-2 text-lg border-pink-500/30">Meet the Team</Badge>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">
            The{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
              Swan
            </span>{' '}
            Team
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building the future of trustless creator-brand collaboration
          </p>

          {/* Team Photo */}
          <div className="mt-16 mb-12">
            <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border shadow-lg">
              <img
                src="/team.jpg"
                alt="Harmonia Team"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4 text-center">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Daniel Asaboro</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Team Lead & Contract Engineer
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border space-y-4 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Akojede Dara</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Blockchain Engineer & Bounty Hunter
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border space-y-4 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Adetola Adedeji</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Backend & Smart Contract Developer
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border space-y-4 text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Olaboye Favour</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Frontend Engineer
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-card border border-border">
            <p className="text-lg">
              <strong>Our mission:</strong> Empowering creators and brands through trustless,
              automated collaboration on the Sui blockchain.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HarmoniaPitch;