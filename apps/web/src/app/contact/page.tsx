"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@largence/ui";
import { Footer } from "@/components/landing/Footer";
import { useUser } from "@clerk/nextjs";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  Globe,
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Import Navbar dynamically with no SSR since it uses useTheme
const Navbar = dynamic(
  () => import("@/components/Navbar").then((mod) => ({ default: mod.Navbar })),
  { ssr: false }
);

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
}

interface FormErrors {
  [key: string]: string;
}

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "sales", label: "Sales & Pricing" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership Opportunities" },
  { value: "feedback", label: "Product Feedback" },
  { value: "enterprise", label: "Enterprise Solutions" },
];

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get in touch via email for general inquiries",
    contact: "support@largence.com",
    responseTime: "Within 24 hours",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us for urgent matters and sales inquiries",
    contact: "+234 123 456 7890",
    responseTime: "Mon-Fri, 9AM-5PM WAT",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    contact: "Available on app",
    responseTime: "Instant during business hours",
  },
];

const remoteOperations = [
  {
    region: "West Africa",
    coverage: "Nigeria, Ghana, Ivory Coast, Senegal",
    timezone: "GMT+1 (WAT)",
    languages: "English, French",
  },
  {
    region: "East Africa", 
    coverage: "Kenya, Uganda, Tanzania, Rwanda",
    timezone: "GMT+3 (EAT)",
    languages: "English, Swahili",
  },
  {
    region: "Southern Africa",
    coverage: "South Africa, Botswana, Namibia, Zimbabwe",
    timezone: "GMT+2 (SAST)",
    languages: "English, Afrikaans",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, isSignedIn } = useUser();

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (isSignedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [isSignedIn, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Message Sent Successfully!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for reaching out to us. We've received your message and will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Return Home</a>
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
              Contact Us
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Get in{" "}<br className="hidden sm:block" />
              <span className="text-primary">Touch</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about Largence? We're here to help. Reach out to our team and we'll respond as soon as possible.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>24h Response Time</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Expert Team</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              How to Reach Us
            </h2>
            <p className="text-muted-foreground">
              Choose the most convenient way to get in touch with our team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="bg-background rounded-lg border p-6 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.responseTime}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <p className="font-medium text-sm">{method.contact}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Offices */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
              
              {errors.submit && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.submit}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.name ? "border-destructive" : "border-border"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.email ? "border-destructive" : "border-border"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange("inquiryType", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.subject ? "border-destructive" : "border-border"
                    }`}
                    placeholder="How can we help you?"
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={5}
                    className={`w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.message ? "border-destructive" : "border-border"
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Remote Operations */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-6">Our Remote Operations</h2>
              
              <div className="space-y-6">
                {remoteOperations.map((region, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-6 border">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{region.region}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{region.coverage}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{region.timezone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{region.languages}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-3">Remote-First Company</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We're a fully remote team serving clients across the world. 
                  This allows us to provide flexible support and maintain lower operational costs, 
                  which we pass on to our customers through competitive pricing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>24/7 Digital Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Global Coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Flexible Meeting Times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Multi-Language Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-8">
            Quick answers to common questions about Largence
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">What is Largence?</h3>
              <p className="text-sm text-muted-foreground">
                Largence is an AI-powered legal intelligence platform designed for  enterprises, offering AI enhanced contract drafting and compliance management.
              </p>
            </div>
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">How do I get started?</h3>
              <p className="text-sm text-muted-foreground">
                Sign up for a free account to explore our features. We offer a 14-day trial with full access to all premium features.
              </p>
            </div>
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Do you offer enterprise plans?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! We offer custom enterprise solutions with advanced features, dedicated support, and custom integrations.
              </p>
            </div>
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. We use enterprise-grade encryption and comply with data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
