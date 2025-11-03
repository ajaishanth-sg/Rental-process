import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  Layers3,
  LineChart,
  Network,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (!loading && user && role) {
      navigate(`/${role}`);
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
      const response = await fetch('http://localhost:8000/api/crm/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit enquiry');
      }

      setEnquiryStatus('success');
      setEnquiryForm(initialEnquiryState);
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

  const solutionHighlights = [
    {
      icon: ShieldCheck,
      title: 'Govern Every Process',
      description: 'Configurable workflows covering enquiries, rentals, billing, logistics, and compliance.',
    },
    {
      icon: Network,
      title: 'Built for Collaboration',
      description: 'Unify admin, sales, warehouse, finance, and vendor teams with role-based workspaces.',
    },
    {
      icon: LineChart,
      title: 'Insight-Ready',
      description: 'Dashboards and analytics revealing utilization, margins, and customer engagement trends.',
    },
  ];

  const productSuites = [
    {
      title: 'Rental ERP Control Hub',
      description: 'Plan, dispatch, and monitor every scaffold movement with paperless execution.',
      capabilities: ['Contract lifecycle orchestration', 'Equipment availability and maintenance', 'Return reconciliation and quality checks'],
    },
    {
      title: 'Sales & CRM Acceleration',
      description: 'Convert enquiries into profitable contracts while keeping customers informed.',
      capabilities: ['Lead and enquiry tracking automations', 'Quotation builder with approval tiers', 'Customer portal for status updates'],
    },
    {
      title: 'Finance & Compliance Suite',
      description: 'Keep cash flow predictable with precise billing, deposits, and penalties.',
      capabilities: ['Invoice scheduling & collections', 'Penalty & retention management', 'Audit-ready financial exports'],
    },
    {
      title: 'Logistics & Vendor Network',
      description: 'Coordinate transport, crew, and vendor partners from a single command center.',
      capabilities: ['Dispatch & pickup orchestration', 'Vendor onboarding & scorecards', 'Field updates from mobile teams'],
    },
  ];

  const industries = [
    'Infrastructure & EPC',
    'Real Estate Developers',
    'Oil, Gas & Energy',
    'Heavy Manufacturing',
    'Facility Management',
    'Events & Staging',
  ];

  const certifications = [
    {
      title: 'Security & Reliability',
      description: 'Enterprise-ready controls protecting operational data and customer trust.',
    },
    {
      title: 'Process Excellence',
      description: 'Standardized workflows that ensure First-Time-Right execution across teams.',
    },
    {
      title: 'Scalable Architecture',
      description: 'Cloud-native foundation optimized for multi-location expansion.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Our rental planning and finance teams now act on the same source of truth. Turnaround time on approvals dropped by 60%.',
      name: 'Priya Nair',
      role: 'Head of Operations, Zenith Rentals',
    },
    {
      quote:
        'The customer portal and automated notifications cut follow-up calls drastically while improving satisfaction scores.',
      name: 'Michael Grant',
      role: 'Sales Director, ConstructAllied',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              Unified platform for scaffolding enterprises
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Paperless rental management that adapts to every project phase
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Coordinate enquiries, inventory, logistics, and finance through a single ERP experience. Designed for fast-growing scaffolding and construction service providers who demand agility and compliance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[{ label: 'Locations orchestrated', value: '45+' }, { label: 'Equipment assets managed', value: '12k+' }, { label: 'Approvals automated yearly', value: '9,500+' }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border bg-card px-6 py-5 text-left shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-4 mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">why teams switch to us</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Operate faster without compromising control</h2>
          <p className="text-muted-foreground text-lg">
            Automate hand-offs, eliminate duplicate data entry, and empower every stakeholder with a workspace tailored to their responsibilities.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutionHighlights.map((item) => (
            <Card key={item.title} className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 text-primary">
                  <item.icon className="h-6 w-6" />
                  <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">solution basket</p>
              <h2 className="text-3xl sm:text-4xl font-bold">Modular suites for every department</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground text-lg">
                Deploy one module or the entire platform. Each suite is tightly integrated yet independently impactful, mirroring the flexibility of industry leaders like ACGIL while maintaining your unique brand voice.
              </p>
            </div>
            <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
              Explore the Platform
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {productSuites.map((product) => (
              <Card key={product.title} className="h-full border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Layers3 className="h-6 w-6 text-primary" />
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-base">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {product.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[2fr,3fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">industries served</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Purpose-built for complex project ecosystems</h2>
            <p className="text-lg text-muted-foreground">
              Mirror the adaptability showcased by top ERP vendors while retaining the nuances of scaffolding operations. From heavy construction to events, the platform scales with your delivery pace.
            </p>
            <div className="flex flex-wrap gap-3">
              {industries.map((industry) => (
                <span key={industry} className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <Card className="border">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <Globe2 className="h-6 w-6" />
                <CardTitle className="text-2xl">Enterprise-grade governance</CardTitle>
              </div>
              <CardDescription className="text-base">
                Built-in controls for approval hierarchies, audit trails, and vendor compliance give stakeholders total confidence, no matter how distributed your teams are.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Dedicated workspaces for admin, sales, finance, warehouse, and customer partners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Role-based approvals configured per project type and region.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Network className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Real-time integrations with inventory and finance services keep data synchronized.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-card/20">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,1fr] items-start">
            <div className="space-y-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">start with an enquiry</p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Prefer to talk to a specialist before signing in?
              </h2>
              <p className="text-lg text-muted-foreground">
                Share the scope of your scaffolding or construction project and our team will configure the right mix of modules—mirroring the responsive service described by leaders like ACGIL—so you can stay paperless from day one.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                  <span>Fast triage from the sales desk with hand-off to logistics and finance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                  <span>Industry-aligned templates for EPC, manufacturing, real estate, and healthcare projects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                  <span>Clear next steps within 1 business day, including demo access when required.</span>
                </li>
              </ul>
              <div className="rounded-2xl border bg-background/80 px-6 py-5 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Need to follow up later?</span> We’ll email a summary of your request so you can pick up right where you left off.
              </div>
            </div>
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">New Enquiry</CardTitle>
                <CardDescription>
                  Tell us about your upcoming requirement. We’ll route it to the right expert and respond quickly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleEnquirySubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name *</Label>
                      <Input
                        id="firstName"
                        value={enquiryForm.firstName}
                        onChange={(event) => handleEnquiryChange('firstName', event.target.value)}
                        placeholder="Priya"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={enquiryForm.lastName}
                        onChange={(event) => handleEnquiryChange('lastName', event.target.value)}
                        placeholder="Nair"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={enquiryForm.email}
                        onChange={(event) => handleEnquiryChange('email', event.target.value)}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={enquiryForm.phone}
                        onChange={(event) => handleEnquiryChange('phone', event.target.value)}
                        placeholder="+971 50 123 4567"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={enquiryForm.organization}
                        onChange={(event) => handleEnquiryChange('organization', event.target.value)}
                        placeholder="ABC Construction"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Project location</Label>
                      <Input
                        id="location"
                        value={enquiryForm.location}
                        onChange={(event) => handleEnquiryChange('location', event.target.value)}
                        placeholder="Dubai Industrial City"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="equipmentCategory">Equipment need *</Label>
                      <Input
                        id="equipmentCategory"
                        value={enquiryForm.equipmentCategory}
                        onChange={(event) => handleEnquiryChange('equipmentCategory', event.target.value)}
                        placeholder="Modular scaffolding"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentType">Specific variant</Label>
                      <Input
                        id="equipmentType"
                        value={enquiryForm.equipmentType}
                        onChange={(event) => handleEnquiryChange('equipmentType', event.target.value)}
                        placeholder="Ringlock system"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        value={enquiryForm.quantity}
                        onChange={(event) => handleEnquiryChange('quantity', event.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desiredStartDate">Desired start date</Label>
                      <Input
                        id="desiredStartDate"
                        type="date"
                        value={enquiryForm.desiredStartDate}
                        onChange={(event) => handleEnquiryChange('desiredStartDate', event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Project context</Label>
                    <Textarea
                      id="message"
                      value={enquiryForm.message}
                      onChange={(event) => handleEnquiryChange('message', event.target.value)}
                      placeholder="Tell us about schedules, compliance needs, or services you expect."
                      rows={4}
                    />
                  </div>
                  {enquiryStatus === 'success' && (
                    <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      Thanks for reaching out. A specialist will confirm the next steps shortly.
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmittingEnquiry}>
                    {isSubmittingEnquiry ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending enquiry
                      </span>
                    ) : (
                      'Submit enquiry'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">assurance</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Certified to protect your operations</h2>
            <p className="text-lg text-muted-foreground">
              Align with best-in-class standards for security, quality, and service management inspired by leading ERP providers, so stakeholders know their data and processes are safe.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {certifications.map((cert) => (
              <Card key={cert.title} className="border text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {cert.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{cert.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-4 mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">voices from the field</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Trusted by teams delivering high-stakes projects</h2>
          <p className="text-lg text-muted-foreground">
            Customers leverage the platform to shrink cycle times, reduce overhead, and keep every stakeholder aligned.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border">
              <CardHeader>
                <CardDescription className="text-lg italic">“{testimonial.quote}”</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 py-16 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Launch your connected scaffolding workspace today</h2>
            <p className="text-lg sm:text-xl opacity-90">
              Sign in to access the dashboards you already know, or request a guided tour to see the new experience in action.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Book a Walkthrough
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
