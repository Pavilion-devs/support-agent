import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Calendar, Clock, Users, MessageSquare, ArrowLeft, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type DemoRequest } from '@/lib/supabase';
import { createDemoConfirmationEmail, createAdminNotificationEmail } from '@/lib/email';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  teamSize: z.string().min(1, 'Please select team size'),
  currentSolution: z.string().min(1, 'Please select current solution'),
  challenges: z.string().min(10, 'Please describe your challenges (at least 10 characters)'),
  preferredTime: z.string().min(1, 'Please select preferred time'),
});

const BookDemo = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      jobTitle: '',
      teamSize: '',
      currentSolution: '',
      challenges: '',
      preferredTime: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for Supabase
      const submissionData: DemoRequest = {
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        company: values.company,
        job_title: values.jobTitle,
        team_size: values.teamSize,
        current_solution: values.currentSolution,
        challenges: values.challenges,
        preferred_time: values.preferredTime,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('demo_requests')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Demo request submission:', data);
      
      // Send emails using Supabase Edge Function
      try {
        const emailResponse = await supabase.functions.invoke('send-emails', {
          body: {
            type: 'demo',
            data: submissionData
          }
        });

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        console.log('✅ Emails sent successfully:', emailResponse.data);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the whole process if email fails - user demo is still scheduled
        toast.error('Demo scheduled, but confirmation email may be delayed.');
      }

      toast.success('Demo scheduled successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to schedule demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center space-y-6 max-w-md">
            <div className="cosmic-glow rounded-full w-20 h-20 mx-auto flex items-center justify-center bg-primary/10">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-medium tracking-tighter">Demo scheduled!</h1>
              <p className="text-muted-foreground text-lg">
                Thank you for booking a demo. Our team will reach out within 24 hours to confirm your preferred time slot.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-2">What happens next?</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Calendar invite sent to your email</li>
                  <li>• Demo materials prepared for your use case</li>
                  <li>• Follow-up resources shared after the call</li>
                </ul>
              </div>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 py-12 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 cosmic-grid opacity-30"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full">
          <div className="w-full h-full opacity-10 bg-primary blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted text-primary">
                <Video className="h-3 w-3" />
                Book a Demo
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-balance">
              See Twisky in action
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Get a personalized demo tailored to your team's needs. 
              Discover how Twisky can transform your customer support experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Demo Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-medium tracking-tighter">What to expect</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">30-minute session</h3>
                      <p className="text-muted-foreground text-sm">Focused demo covering your specific use cases</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Tailored presentation</h3>
                      <p className="text-muted-foreground text-sm">Customized demo based on your team size and needs</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Q&A session</h3>
                      <p className="text-muted-foreground text-sm">Ask questions and get expert recommendations</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Follow-up resources</h3>
                      <p className="text-muted-foreground text-sm">Implementation guide and pricing information</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cosmic-glass rounded-xl p-6 space-y-3">
                <div className="text-sm font-medium">Demo highlights</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live AI agent interactions</li>
                  <li>• Multi-channel dashboard walkthrough</li>
                  <li>• Custom integration examples</li>
                  <li>• Analytics and reporting features</li>
                  <li>• Implementation timeline discussion</li>
                </ul>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card className="cosmic-glow">
                <CardHeader>
                  <CardTitle>Schedule your demo</CardTitle>
                  <CardDescription>
                    Tell us about your team so we can prepare a relevant demo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@company.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Customer Success Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="teamSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Team Size</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    {...field}
                                  >
                                    <option value="">Select team size</option>
                                    <option value="1-10">1-10 people</option>
                                    <option value="11-50">11-50 people</option>
                                    <option value="51-200">51-200 people</option>
                                    <option value="200+">200+ people</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="currentSolution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Support Solution</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    {...field}
                                  >
                                    <option value="">Select current solution</option>
                                    <option value="zendesk">Zendesk</option>
                                    <option value="intercom">Intercom</option>
                                    <option value="freshdesk">Freshdesk</option>
                                    <option value="help-scout">Help Scout</option>
                                    <option value="custom">Custom solution</option>
                                    <option value="email-only">Email only</option>
                                    <option value="none">No current solution</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="challenges"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Support Challenges</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your current support challenges and what you hope to achieve with Twisky..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Scheduling */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Demo Scheduling</h3>
                        <FormField
                          control={form.control}
                          name="preferredTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  {...field}
                                >
                                  <option value="">Select preferred time</option>
                                  <option value="morning">Morning (9AM - 12PM)</option>
                                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                                  <option value="evening">Evening (5PM - 7PM)</option>
                                  <option value="flexible">I'm flexible</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Scheduling demo...
                          </>
                        ) : (
                          'Schedule Demo'
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Our team will reach out within 24 hours to confirm your demo slot. 
                        We respect your privacy and will never share your information.
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookDemo;