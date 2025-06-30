import React from 'react';
import { ShieldCheck, Heart, FileText, Users, CheckCircle, ArrowRight, Lock, Clock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    // Navigate to auth page with signup mode
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    // Navigate to auth page
    navigate('/auth');
  };

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-orange-500" />,
      title: "Guided with Care",
      description: "Our AI gently walks you through each step, making planning feel manageable and meaningful, not overwhelming."
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Bank-Level Security",
      description: "Your most sensitive information is protected with end-to-end encryption and multi-factor authentication."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-700" />,
      title: "Executor Support",
      description: "When the time comes, your loved ones receive clear, step-by-step guidance during their most difficult moments."
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-400" />,
      title: "Save Time & Stress",
      description: "Eliminate hours of confusion and uncertainty. Everything your family needs is organized and accessible."
    }
  ];

  const benefits = [
    "Organize all your important documents in one secure place",
    "Document your healthcare and funeral wishes clearly",
    "Give executors AI-generated checklists tailored to your situation",
    "Reduce family stress during grieving with clear instructions",
    "Ensure nothing important gets overlooked or forgotten",
    "Keep everything updated and accessible when needed most"
  ];

  const testimonials = [
    {
      quote: "After losing my father suddenly, I wish he had used something like EverEase. The confusion and stress we experienced could have been avoided.",
      author: "Sarah M.",
      role: "Daughter & Executor"
    },
    {
      quote: "Planning my end-of-life wishes felt overwhelming until I found EverEase. The guided process made it feel like having a caring friend help me through it.",
      author: "Robert K.",
      role: "Recent Retiree"
    },
    {
      quote: "As an estate attorney, I see families struggle with disorganized affairs daily. EverEase is the solution I've been recommending to all my clients.",
      author: "Jennifer L.",
      role: "Estate Planning Attorney"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 ml-2">EverEase</span>
                <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="ml-2">
                  <img 
                    src="/bolt_badge.png" 
                    alt="Powered by Bolt.new" 
                    className="h-8 w-8"
                  />
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              Plan Forever,{' '}
              <span className="text-blue-600">Rest Easy</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              Give your family the gift of clarity during their most difficult time. 
              EverEase makes end-of-life planning simple, secure, and stress-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold flex items-center"
              >
                Ensure Your Loved Ones Are Taken Care Of
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="text-sm text-gray-500">Free to start • No credit card required</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>HIPAA compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span>Available 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              When grief strikes, families shouldn't struggle with paperwork
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">😰</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overwhelming Chaos</h3>
                <p className="text-gray-600">Families spend weeks searching for documents, passwords, and important information scattered everywhere.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Unknown Wishes</h3>
                <p className="text-gray-600">Without clear instructions, families make difficult decisions while grieving, often unsure of what their loved one wanted.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Time-Sensitive Stress</h3>
                <p className="text-gray-600">Critical deadlines and legal requirements add pressure when families need time to grieve and heal together.</p>
              </div>
            </div>
            <p className="text-xl text-gray-700 font-medium">
              EverEase transforms this experience into one of clarity, support, and peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Designed with love for you and your family
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is crafted to reduce stress and provide clarity when it matters most.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Everything your family needs, organized and ready
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Stop worrying about whether you've forgotten something important. 
                EverEase ensures nothing slips through the cracks.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Digital Legacy</h3>
                    <p className="text-gray-500 text-sm">Secure and organized</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Important Documents</span>
                    <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Healthcare Wishes</span>
                    <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Digital Assets</span>
                    <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Executor Instructions</span>
                    <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by families when it matters most
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Your privacy and security are sacred to us
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We understand the sensitivity of your information and protect it with the highest standards.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-300 text-sm">Your data is encrypted before it leaves your device</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-gray-300 text-sm">Meeting healthcare data protection standards</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Controlled Access</h3>
              <p className="text-gray-300 text-sm">Only verified executors can access your information</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Always Available</h3>
              <p className="text-gray-300 text-sm">24/7 access when your family needs it most</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Give your family peace of mind
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start planning today. Your future self and your loved ones will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold flex items-center"
            >
              Start Your Plan Today - It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <p className="text-blue-200 text-sm">Takes less than 10 minutes to get started</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold ml-2">EverEase</span>
                <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="ml-2">
                  <img 
                    src="/bolt_badge.png" 
                    alt="Powered by Bolt.new" 
                    className="h-8 w-8"
                  />
                </a>
              </div>
            </div>
            <div className="flex space-x-8 text-sm text-gray-300">
              <button 
                onClick={() => navigate('/legal')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/legal')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate('/legal')}
                className="hover:text-white transition-colors"
              >
                Security
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 EverEase. Made with care for families everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}