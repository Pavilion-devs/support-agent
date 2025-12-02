
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const plans = [
    {
      name: "Starter",
      monthlyPrice: 99,
      annualPrice: 79,
      period: "per seat per month",
      description: "For startups and lean teams who want AI-powered support from day one.",
      features: [
        "Email",
        "Chat Widget",
        "Knowledge Base (1 source)",
        "Training Data",
        "Ticket Forms",
        "Test Playground",
        "Agent Workflows",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
      popular: false
    },
    {
      name: "Pro",
      monthlyPrice: 149,
      annualPrice: 119,
      period: "per seat per month",
      description: "For scaling B2B teams automating daily support across channels.",
      subtitle: "Includes everything in Starter, plus:",
      features: [
        "Omnichannel integrations: Slack, WhatsApp, Email",
        "Conversation Summaries",
        "Analytics",
        "Support for Onboarding",
        "Templates",
        "Ask AI",
        "AI Copilot",
        "Automation workflows"
      ],
      buttonText: "Get Started",
      buttonVariant: "default",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom Pricing",
      period: "annual contracts only",
      description: "For large companies with advanced integrations and compliance needs.",
      subtitle: "Includes everything in Pro, plus:",
      features: [
        "Unlimited channels & AI responses",
        "Custom CRM & API integrations",
        "White-label dashboard & chatbot widget",
        "Dedicated support manager",
        "SOC 2 + GDPR compliance guarantees",
        "Advanced analytics (warehouse exports & BI connectors)",
        "Priority Support SLAs"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false
    }
  ];
  
  return (
    <section id="pricing" className="w-full py-20 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-foreground">
            Transparent pricing for every stage
          </h2>
          <p className="text-muted-foreground text-lg">
            Scale your customer support with plans that grow with your business
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-full w-fit mx-auto">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                !isAnnual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isAnnual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="ml-1 text-xs bg-cosmic-accent text-cosmic-darker px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`p-6 rounded-xl border flex flex-col h-full ${
                plan.popular 
                  ? "border-primary/50 cosmic-glow bg-card" 
                  : "border-border cosmic-gradient bg-card"
              } transition-all duration-300 relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded-full font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-auto">
                <h3 className="text-2xl font-medium tracking-tighter mb-1 text-foreground">{plan.name}</h3>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold tracking-tighter text-foreground">
                    {plan.monthlyPrice && plan.annualPrice ? (
                      <>
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        {isAnnual && plan.monthlyPrice && (
                          <span className="text-base text-muted-foreground line-through ml-2">
                            ${plan.monthlyPrice}
                          </span>
                        )}
                      </>
                    ) : (
                      plan.price
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.period}
                    {isAnnual && plan.monthlyPrice && plan.annualPrice && (
                      <span className="ml-1 text-xs text-cosmic-accent font-medium">
                        (billed annually)
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                {plan.subtitle && (
                  <p className="text-sm text-foreground font-medium mb-6">{plan.subtitle}</p>
                )}
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <Link to={plan.buttonText === "Contact Sales" ? "/contact-sales" : "/early-access"} className="block">
                  <Button 
                    className={
                      plan.buttonVariant === "default" 
                        ? "w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "w-full border-border text-foreground hover:bg-muted"
                    }
                    variant={plan.buttonVariant as "default" | "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center text-muted-foreground">
          Have questions? <Link to="/contact-sales" className="text-primary hover:underline">Contact our sales team</Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
