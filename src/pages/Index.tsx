import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  TrendingUp,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';

type EnquiryFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  equipmentCategory: string;
  equipmentType: string;
  quantity: string;
  desiredStartDate: string;
  location: string;
  message: string;
};

const initialEnquiryState: EnquiryFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  equipmentCategory: '',
  equipmentType: '',
  quantity: '1',
  desiredStartDate: '',
  location: '',
  message: '',
};

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const [enquiryForm, setEnquiryForm] = useState<EnquiryFormState>(initialEnquiryState);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      const rolePath = role === 'super_admin' ? '/super-admin' : `/${role}`;
      navigate(rolePath);
    }
  }, [user, role, loading, navigate]);

  const handleEnquiryChange = <K extends keyof EnquiryFormState>(field: K, value: EnquiryFormState[K]) => {
    setEnquiryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnquirySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnquiryStatus('idle');

    if (!enquiryForm.firstName || !enquiryForm.email || !enquiryForm.phone || !enquiryForm.equipmentCategory) {
      toast({
        title: 'Missing information',
        description: 'Please provide your name, contact details, and equipment requirements.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingEnquiry(true);

    const payload = {
      firstName: enquiryForm.firstName,
      lastName: enquiryForm.lastName || undefined,
      email: enquiryForm.email,
      phone: enquiryForm.phone,
      organization: enquiryForm.organization || undefined,
      equipmentCategory: enquiryForm.equipmentCategory,
      equipmentType: enquiryForm.equipmentType || undefined,
      quantity: Number(enquiryForm.quantity) > 0 ? Number(enquiryForm.quantity) : 1,
      desiredStartDate: enquiryForm.desiredStartDate || undefined,
      location: enquiryForm.location || undefined,
      message: enquiryForm.message || undefined,
    };

    try {
      const response = await fetch(API_CONFIG.CRM.LEADS_PUBLIC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit enquiry');
      }

      const result = await response.json();
      console.log('Enquiry submitted successfully:', result);

      setEnquiryStatus('success');
      setEnquiryForm(initialEnquiryState);
      
      // Dispatch events to notify modules that an enquiry was created
      // Use a small delay to ensure backend has finished processing
      setTimeout(() => {
        console.log('Dispatching refresh events for enquiry and lead...');
        window.dispatchEvent(new CustomEvent('enquiryCreated', { 
          detail: { enquiry_id: result?.enquiry_id, lead_id: result?.lead_id } 
        }));
        window.dispatchEvent(new CustomEvent('leadCreated', { 
          detail: { lead_id: result?.lead_id, enquiry_id: result?.enquiry_id } 
        }));
        window.dispatchEvent(new CustomEvent('refreshEnquiries'));
        window.dispatchEvent(new CustomEvent('refreshLeads'));
      }, 500); // Small delay to ensure backend processing is complete
      
      toast({
        title: 'Enquiry received',
        description: 'Our team will contact you shortly to discuss your project requirements.',
      });
    } catch (error: any) {
      console.error('Enquiry submission failed:', error);
      setEnquiryStatus('error');
      toast({
        title: 'Submission failed',
        description: error.message || 'Unable to submit your enquiry right now.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const contactInfo = {
    phone: '+971 50 123 4567',
    email: 'info@rigitcontrolhub.com',
    gmail: 'support.rigit@gmail.com',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">Scaffolding Rental Process</span>
            </div>

            {/* Desktop Navigation - Removed as per request */}
            
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-16 lg:pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:50px_50px] opacity-20"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Cloud ERP Software For Small And Big Business
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl">
                Maecena accumsan ocus vella creative fociis voluto ester velit egestas Enim uttorm tellus elementum sagittis.
              </p>
            </div>

            {/* Right Content - Laptop Illustration */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    {/* Dashboard Preview */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">My Google Chart</p>
                        <div className="h-16 bg-gradient-to-t from-blue-200 to-blue-100 rounded"></div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">My Project</p>
                        <div className="flex items-center justify-center h-16">
                          <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-700">75%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">My Tasks</p>
                        <p className="text-2xl font-bold text-purple-700">20541</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">Analytics</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="h-20 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form Section with Contact Info */}
      <section id="contact" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Share your project requirements and our team will get back to you shortly.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-start">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group border border-blue-200/50"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {contactInfo.phone}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group border border-purple-200/50"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Business Email</p>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {contactInfo.email}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${contactInfo.gmail}`}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 group border border-red-200/50"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Gmail</p>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                          {contactInfo.gmail}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                        <p className="text-lg font-bold text-gray-900">
                          123 Business Street, Dubai Industrial City, Dubai, UAE
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enquiry Form - Cool Design */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10 relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Send className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">New Enquiry</h3>
                        <p className="text-sm text-gray-600">We'll get back to you within 24 hours</p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleEnquirySubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700 font-medium">First name *</Label>
                        <Input
                          id="firstName"
                          value={enquiryForm.firstName}
                          onChange={(event) => handleEnquiryChange('firstName', event.target.value)}
                          placeholder="Priya"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700 font-medium">Last name</Label>
                        <Input
                          id="lastName"
                          value={enquiryForm.lastName}
                          onChange={(event) => handleEnquiryChange('lastName', event.target.value)}
                          placeholder="Nair"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Work email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={enquiryForm.email}
                          onChange={(event) => handleEnquiryChange('email', event.target.value)}
                          placeholder="you@company.com"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone *</Label>
                        <Input
                          id="phone"
                          value={enquiryForm.phone}
                          onChange={(event) => handleEnquiryChange('phone', event.target.value)}
                          placeholder="+971 50 123 4567"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="organization" className="text-gray-700 font-medium">Organization</Label>
                        <Input
                          id="organization"
                          value={enquiryForm.organization}
                          onChange={(event) => handleEnquiryChange('organization', event.target.value)}
                          placeholder="ABC Construction"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-gray-700 font-medium">Project location</Label>
                        <Input
                          id="location"
                          value={enquiryForm.location}
                          onChange={(event) => handleEnquiryChange('location', event.target.value)}
                          placeholder="Dubai Industrial City"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="equipmentCategory" className="text-gray-700 font-medium">Equipment need *</Label>
                        <Input
                          id="equipmentCategory"
                          value={enquiryForm.equipmentCategory}
                          onChange={(event) => handleEnquiryChange('equipmentCategory', event.target.value)}
                          placeholder="Modular scaffolding"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="equipmentType" className="text-gray-700 font-medium">Specific variant</Label>
                        <Input
                          id="equipmentType"
                          value={enquiryForm.equipmentType}
                          onChange={(event) => handleEnquiryChange('equipmentType', event.target.value)}
                          placeholder="Ringlock system"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-gray-700 font-medium">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          value={enquiryForm.quantity}
                          onChange={(event) => handleEnquiryChange('quantity', event.target.value)}
                          placeholder="100"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desiredStartDate" className="text-gray-700 font-medium">Desired start date</Label>
                        <Input
                          id="desiredStartDate"
                          type="date"
                          value={enquiryForm.desiredStartDate}
                          onChange={(event) => handleEnquiryChange('desiredStartDate', event.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 font-medium">Project context</Label>
                      <Textarea
                        id="message"
                        value={enquiryForm.message}
                        onChange={(event) => handleEnquiryChange('message', event.target.value)}
                        placeholder="Tell us about schedules, compliance needs, or services you expect."
                        rows={4}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80 backdrop-blur-sm resize-none"
                      />
                    </div>
                    {enquiryStatus === 'success' && (
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm text-emerald-800 font-medium">
                          Thanks for reaching out. A specialist will confirm the next steps shortly.
                        </p>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-xl h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      disabled={isSubmittingEnquiry}
                    >
                      {isSubmittingEnquiry ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending enquiry...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5" />
                          Submit Enquiry
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/80 to-primary/60">
        <div className="container relative z-10 mx-auto px-4 py-12 lg:py-16 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to get started?</h2>
            <p className="text-lg sm:text-xl opacity-90">
              Sign in to access your dashboard and explore our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
