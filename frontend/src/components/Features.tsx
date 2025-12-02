
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers, Grid3x3, ListCheck, BookOpen, Star, LayoutDashboard } from "lucide-react";

// Custom hook for staggered animation
const useStaggeredAnimation = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return { hoveredIndex, setHoveredIndex };
};

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const { hoveredIndex, setHoveredIndex } = useStaggeredAnimation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Intersection observer for entrance animation
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);
  
  const features = [
    {
      title: "AI-Powered Support",
      description: "Automate repetitive support questions with instant, accurate answers.",
      expandedDescription: "Our AI agents understand customer queries and provide instant, accurate responses based on your knowledge base. Reduce response times from hours to seconds while maintaining quality and consistency across all support interactions.",
      icon: <Layers size={24} className="transition-all duration-500 ease-out" />
    },
    {
      title: "Smart Escalations",
      description: "Seamlessly route complex issues to your team inside Slack.",
      expandedDescription: "When AI can't resolve an issue, automatically escalate to the right team member with full context. Every escalation includes conversation summaries, customer history, and suggested solutions so your team can pick up instantly.",
      icon: <Grid3x3 size={24} className="transition-all duration-500 ease-out" />
    },
    {
      title: "Conversation Summaries",
      description: "Every escalation includes a full summary so your team can pick up instantly.",
      expandedDescription: "Get comprehensive summaries of customer conversations including key issues, attempted solutions, and customer sentiment. Your team receives all the context they need without reading through entire conversation threads.",
      icon: <LayoutDashboard size={24} className="transition-all duration-500 ease-out" />
    },
    {
      title: "Omnichannel by Default",
      description: "One AI engine across Slack, WhatsApp, Email, and Web.",
      expandedDescription: "Provide consistent support experience across all channels with a single AI engine. Customers get the same quality of support whether they reach out via Slack, WhatsApp, email, or your website. Unified conversation history and seamless handoffs between channels.",
      icon: <ListCheck size={24} className="transition-all duration-500 ease-out" />
    },
    {
      title: "Knowledge Sync",
      description: "Keep support accurate by syncing FAQs, Docs, and Policies from Google Docs.",
      expandedDescription: "Automatically sync your knowledge base from Google Docs, Notion, or other sources. Keep support responses up-to-date with the latest product information, policies, and FAQs without manual updates.",
      icon: <Star size={24} className="transition-all duration-500 ease-out" />
    },
    {
      title: "Analytics & Insights",
      description: "Track resolutions, escalations, and response speed to improve support ROI.",
      expandedDescription: "Monitor key support metrics including resolution rates, escalation frequency, response times, and customer satisfaction. Identify trends, optimize your knowledge base, and measure the ROI of your AI support investment.",
      icon: <BookOpen size={24} className="transition-all duration-500 ease-out" />
    }
  ];
  
  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };
  
  return (
    <section id="features" className="w-full py-12 md:py-16 px-6 md:px-12">
      <div id="features-section" className="opacity-0"></div>
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter">
            Everything your business needs
          </h2>
          <p className="text-cosmic-muted text-lg">
            Comprehensive AI support solutions to streamline customer success and drive growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Collapsible
              key={index}
              open={openFeature === index}
              onOpenChange={() => toggleFeature(index)}
              className={`group relative rounded-xl border overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                openFeature === index 
                  ? 'border-primary/60 shadow-xl shadow-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5' 
                  : hoveredIndex === index
                  ? 'border-primary/40 shadow-lg shadow-primary/10 bg-gradient-to-br from-primary/3 via-card to-card'
                  : 'border-border cosmic-gradient hover:border-primary/30'
              } ${
                isVisible 
                  ? `opacity-100 translate-y-0 transition-all duration-700 ease-out` 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Animated background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <CollapsibleTrigger className="relative w-full text-left p-6 flex flex-col z-10">
                <div className="flex justify-between items-start">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
                    hoveredIndex === index || openFeature === index
                      ? 'bg-primary/20 shadow-lg shadow-primary/30 scale-110'
                      : 'bg-muted/30 group-hover:bg-primary/10'
                  }`}>
                    <div className={`transition-all duration-500 ${
                      hoveredIndex === index 
                        ? 'text-primary scale-125 rotate-12' 
                        : openFeature === index
                        ? 'text-primary scale-110 rotate-6'
                        : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                    }`}>
                      {feature.icon}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-all duration-300 ${
                      openFeature === index 
                        ? 'rotate-180 text-primary' 
                        : hoveredIndex === index 
                        ? 'text-primary scale-110' 
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  />
                </div>
                <h3 className={`text-xl font-medium tracking-tighter mb-3 transition-colors duration-300 ${
                  hoveredIndex === index || openFeature === index ? 'text-primary' : 'text-foreground'
                }`}>{feature.title}</h3>
                <p className={`transition-colors duration-300 ${
                  hoveredIndex === index || openFeature === index ? 'text-foreground' : 'text-muted-foreground'
                }`}>{feature.description}</p>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 pt-2">
                <div className="pt-3 border-t border-cosmic-light/10">
                  <p className="text-cosmic-muted">{feature.expandedDescription}</p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-cosmic-accent hover:text-cosmic-accent/80 text-sm font-medium">
                      Learn more →
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
