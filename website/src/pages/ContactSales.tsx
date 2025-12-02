import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Building2, Users, Mail, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface FormData {
  firstName: string;
  lastName: string;
  businessEmail: string;
  companyName: string;
  companySize: string;
  phoneNumber: string;
}

const ContactSales = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Force dark mode for this page
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light-mode');
    htmlElement.classList.add('dark-mode');
    
    // Cleanup function to restore previous theme when leaving the page
    return () => {
      // Don't restore theme here - let the user's preference persist
    };
  }, []);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    businessEmail: '',
    companyName: '',
    companySize: '',
    phoneNumber: ''
  });

  const testimonials = [
    {
      quote: "Meeting customer demand has never been smoother, leading to an impressive 98% CSAT score year to date.",
      author: "Jeff Cardoso",
      title: "Vice President Operations, Azazie"
    },
    {
      quote: "Twisky transformed our support workflow. We've seen a 40% reduction in response time and our team can focus on complex issues.",
      author: "Sarah Chen",
      title: "Head of Customer Success, TechCorp"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalSteps = 3;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
      case 2:
        return formData.businessEmail.trim() !== '' && formData.companyName.trim() !== '';
      case 3:
        return formData.companySize.trim() !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data for the contact sales submission
      const contactData = {
        email: formData.businessEmail,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.companyName,
        team_size: formData.companySize,
        phone_number: formData.phoneNumber || null,
      };

      // Store the contact sales submission in the database
      const { error: dbError } = await supabase
        .from('contact_sales_submissions')
        .insert([contactData]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save contact information');
      }

      // Send emails via edge function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-emails', {
        body: {
          type: 'contact_sales',
          data: contactData
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw here - the submission was saved, we just couldn't send emails
        console.warn('Contact saved but emails failed to send');
      }

      console.log('✅ Contact sales submission successful:', contactData);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('There was an error submitting your request. Please try again or email us directly at hello@usetwisky.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    // Show success message if submitted
    if (isSubmitted) {
      return (
        <div className="text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-medium tracking-tighter text-foreground">
              Thank you for your interest!
            </h2>
            <p className="text-muted-foreground">
              We've received your information and our sales team will contact you within 24 hours to schedule your personalized demo.
            </p>
          </div>
          <Link to="/">
            <Button className="mt-4">
              Back to Website
            </Button>
          </Link>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-medium tracking-tighter text-foreground">
                Let's get to know you
              </h2>
              <p className="text-muted-foreground">
                Tell us a bit about yourself to get started
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm bg-transparent border-none outline-none font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                      className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border"
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                      className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-medium tracking-tighter text-foreground">
                Company details
              </h2>
              <p className="text-muted-foreground">
                Help us understand your business needs
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessEmail" className="text-sm font-medium">
                  Business Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => updateFormData('businessEmail', e.target.value)}
                    placeholder="john@company.com"
                    className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Acme Inc."
                    className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-medium tracking-tighter text-foreground">
                Final details
              </h2>
              <p className="text-muted-foreground">
                Just a few more details to personalize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium">
                  Company Size <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                    <SelectTrigger className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!shadow-none [&:-webkit-autofill]:!border-border"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 cosmic-gradient"></div>
        <div className="absolute inset-0 cosmic-grid opacity-30"></div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md space-y-6">
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="h-6 w-6 rounded bg-white"></div>
                </div>
              </Link>
              
              <h1 className="text-4xl font-medium tracking-tighter">
                Discover the perfect fit with Twisky
              </h1>
              <p className="text-lg text-white/80">
                Secure an appointment to talk to our sales team to explore use cases based on your industry, and learn how Twisky can improve your customer relationships.
              </p>
            </div>
            
            {/* Animated testimonial cards */}
            <div className="relative h-40 overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                    index === currentTestimonial
                      ? 'opacity-100 transform translate-x-0'
                      : 'opacity-0 transform translate-x-full'
                  }`}
                >
                  <p className="text-white/90 mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-white/20 pt-4">
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-white/70">{testimonial.title}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Trust indicators */}
            <div className="space-y-3">
              <div className="text-sm text-white/70">Trusted by more than 25,000 leading brands</div>
              <div className="flex items-center space-x-6 opacity-70">
                <div className="text-white/60 font-medium">Frame.io</div>
                <div className="text-white/60 font-medium">Coda</div>
                <div className="text-white/60 font-medium">Envoy</div>
                <div className="text-white/60 font-medium">Atlassian</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
          
          {/* Progress indicator */}
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted h-1">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form content */}
        <div className="flex-1 flex flex-col justify-center p-6 lg:p-12">
          <div className="max-w-md mx-auto w-full space-y-8">
            {renderStep()}
            
            {/* Navigation buttons - hide when submitted */}
            {!isSubmitted && (
              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep) || isSubmitting}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep) || isSubmitting}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Contact Sales
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSales;