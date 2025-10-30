import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, Package, FileText, Truck, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  const features = [
    {
      icon: Package,
      title: 'Equipment Management',
      description: 'Complete catalog with real-time availability tracking',
    },
    {
      icon: FileText,
      title: 'Contract Management',
      description: 'Streamlined rental agreements with approval workflows',
    },
    {
      icon: Truck,
      title: 'Logistics Control',
      description: 'Dispatch, returns, and inventory management',
    },
    {
      icon: DollarSign,
      title: 'Financial Tracking',
      description: 'Invoicing, payments, and profitability analysis',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Dedicated dashboards for all stakeholders',
    },
    {
      icon: Building2,
      title: 'Vendor Integration',
      description: 'Seamless coordination with external suppliers',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-lg">
              <Building2 className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Scaffolding Rental System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Complete ERP solution for managing scaffolding equipment rentals, contracts, logistics, and finances
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border-2 rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border-2 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Rental Business?</h2>
          <p className="text-muted-foreground mb-6">
            Join us today and experience seamless equipment rental management
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
