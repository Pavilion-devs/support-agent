import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Sparkles, Users, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type WaitlistSubmission } from '@/lib/supabase';
import { createWaitlistWelcomeEmail, createAdminNotificationEmail } from '@/lib/email';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  teamSize: z.string().min(1, 'Please select team size'),
});

const EarlyAccess = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      teamSize: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for Supabase
      const submissionData: WaitlistSubmission = {
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        company: values.company,
        team_size: values.teamSize,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('waitlist')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Waitlist submission:', data);
      
      // Send emails using Supabase Edge Function
      try {
        const emailResponse = await supabase.functions.invoke('send-emails', {
          body: {
            type: 'waitlist',
            data: submissionData
          }
        });

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        console.log('✅ Emails sent successfully:', emailResponse.data);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the whole process if email fails - user is still on waitlist
        toast.error('Saved to waitlist, but welcome email may be delayed.');
      }

      toast.success('Successfully joined the waitlist!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to join waitlist. Please try again.');
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
              <h1 className="text-3xl font-medium tracking-tighter">You're on the list!</h1>
              <p className="text-muted-foreground text-lg">
                Thank you for your interest in Twisky. We'll notify you as soon as early access is available.
              </p>
            </div>
            <div className="pt-4">
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

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted text-primary">
                <Sparkles className="h-3 w-3" />
                Early Access Program
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-balance">
              Join the future of <span className="text-primary">customer support</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Be among the first to experience AI-powered customer support that scales with your business. 
              Get exclusive early access to Twisky.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Benefits Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-medium tracking-tighter">What you'll get</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Priority Access</h3>
                      <p className="text-muted-foreground text-sm">Be the first to access Twisky when we launch</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Exclusive Pricing</h3>
                      <p className="text-muted-foreground text-sm">Special launch pricing for early adopters</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Direct Feedback Line</h3>
                      <p className="text-muted-foreground text-sm">Help shape the product with your feedback</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cosmic-glass rounded-xl p-6 space-y-3">
                <div className="text-sm text-muted-foreground">Trusted by teams at</div>
                <div className="flex items-center gap-4 text-muted-foreground/60">
                  <div className="h-8 px-3 rounded bg-muted/50 flex items-center text-xs font-medium">Company A</div>
                  <div className="h-8 px-3 rounded bg-muted/50 flex items-center text-xs font-medium">Company B</div>
                  <div className="h-8 px-3 rounded bg-muted/50 flex items-center text-xs font-medium">Company C</div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <Card className="cosmic-glow">
              <CardHeader>
                <CardTitle>Join the waitlist</CardTitle>
                <CardDescription>
                  Get notified when Twisky is ready for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Joining waitlist...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EarlyAccess;