import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Settings, DollarSign, Package, Users, Building, Loader2 } from 'lucide-react';

// Removed hardcoded data - now fetched from MongoDB via API

export const MasterDataModule = () => {
   const [activeTab, setActiveTab] = useState('uom');
   const [uom, setUom] = useState<any[]>([]);
   const [rates, setRates] = useState<any[]>([]);
   const [currencies, setCurrencies] = useState<any[]>([]);
   const [vatRates, setVatRates] = useState<any[]>([]);
   const [loading, setLoading] = useState({
     uom: true,
     rates: true,
     currencies: true,
     vat: true
   });
   const [open, setOpen] = useState(false);
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<any>(null);
   const { toast } = useToast();
   const [formData, setFormData] = useState({
     code: '', name: '', description: '', dailyRate: '', weeklyRate: '', monthlyRate: '', currency: 'AED',
     symbol: '', exchangeRate: '', rate: '', effectiveFrom: ''
   });

   // Fetch data from MongoDB on component mount
   useEffect(() => {
     fetchUOM();
     fetchRates();
     fetchCurrencies();
     fetchVAT();
   }, []);

   const fetchUOM = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/master-data/uom/', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         setUom(data);
       }
     } catch (error) {
       console.error('Failed to fetch UOM:', error);
     } finally {
       setLoading(prev => ({ ...prev, uom: false }));
     }
   };

   const fetchRates = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/master-data/rates/', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         setRates(data);
       }
     } catch (error) {
       console.error('Failed to fetch rates:', error);
     } finally {
       setLoading(prev => ({ ...prev, rates: false }));
     }
   };

   const fetchCurrencies = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/master-data/currencies/', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         setCurrencies(data);
       }
     } catch (error) {
       console.error('Failed to fetch currencies:', error);
     } finally {
       setLoading(prev => ({ ...prev, currencies: false }));
     }
   };

   const fetchVAT = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/master-data/vat/', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         setVatRates(data);
       }
     } catch (error) {
       console.error('Failed to fetch VAT rates:', error);
     } finally {
       setLoading(prev => ({ ...prev, vat: false }));
     }
   };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();

     try {
       let endpoint = '';
       let payload = {};

       switch (activeTab) {
         case 'uom':
           endpoint = 'http://localhost:8000/api/master-data/uom/';
           payload = {
             code: formData.code,
             name: formData.name,
             description: formData.description
           };
           break;
         case 'rates':
           endpoint = 'http://localhost:8000/api/master-data/rates/';
           payload = {
             item_code: formData.code,
             item_name: formData.name,
             daily_rate: parseFloat(formData.dailyRate),
             weekly_rate: parseFloat(formData.weeklyRate),
             monthly_rate: parseFloat(formData.monthlyRate),
             currency: formData.currency
           };
           break;
         case 'currency':
           endpoint = 'http://localhost:8000/api/master-data/currencies/';
           payload = {
             code: formData.code.toUpperCase(),
             name: formData.name,
             symbol: formData.symbol,
             exchange_rate: parseFloat(formData.exchangeRate)
           };
           break;
         case 'vat':
           endpoint = 'http://localhost:8000/api/master-data/vat/';
           payload = {
             rate: parseFloat(formData.rate),
             name: formData.name,
             description: formData.description,
             effective_from: new Date(formData.effectiveFrom).toISOString()
           };
           break;
       }

       const response = await fetch(endpoint, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         },
         body: JSON.stringify(payload)
       });

       if (response.ok) {
         toast({
           title: 'Item Added',
           description: `${formData.name} has been added successfully.`,
         });
         setOpen(false);
         resetForm();

         // Refresh data
         switch (activeTab) {
           case 'uom': fetchUOM(); break;
           case 'rates': fetchRates(); break;
           case 'currency': fetchCurrencies(); break;
           case 'vat': fetchVAT(); break;
         }
       } else {
         const error = await response.json();
         toast({
           title: 'Error',
           description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to add item',
           variant: 'destructive',
         });
       }
     } catch (error) {
       toast({
         title: 'Error',
         description: 'Failed to add item. Please check your connection.',
         variant: 'destructive',
       });
     }
   };

  const resetForm = () => {
    setFormData({
      code: '', name: '', description: '', dailyRate: '', weeklyRate: '', monthlyRate: '', currency: 'AED',
      symbol: '', exchangeRate: '', rate: '', effectiveFrom: ''
    });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'uom':
          endpoint = `http://localhost:8000/api/master-data/uom/${editingItem.id}`;
          payload = {
            code: editingItem.code,
            name: editingItem.name,
            description: editingItem.description
          };
          break;
        case 'rates':
          endpoint = `http://localhost:8000/api/master-data/rates/${editingItem.id}`;
          payload = {
            item_code: editingItem.item_code,
            item_name: editingItem.item_name,
            daily_rate: editingItem.daily_rate,
            weekly_rate: editingItem.weekly_rate,
            monthly_rate: editingItem.monthly_rate,
            currency: editingItem.currency
          };
          break;
        case 'currency':
          endpoint = `http://localhost:8000/api/master-data/currencies/${editingItem.id}`;
          payload = {
            code: editingItem.code,
            name: editingItem.name,
            symbol: editingItem.symbol,
            exchange_rate: editingItem.exchange_rate
          };
          break;
        case 'vat':
          endpoint = `http://localhost:8000/api/master-data/vat/${editingItem.id}`;
          payload = {
            rate: editingItem.rate,
            name: editingItem.name,
            description: editingItem.description,
            effective_from: editingItem.effective_from
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Item Updated',
          description: `${editingItem.name} has been updated successfully.`,
        });
        setEditDialogOpen(false);
        setEditingItem(null);

        // Refresh data
        switch (activeTab) {
          case 'uom': fetchUOM(); break;
          case 'rates': fetchRates(); break;
          case 'currency': fetchCurrencies(); break;
          case 'vat': fetchVAT(); break;
        }
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to update item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      let endpoint = '';

      switch (activeTab) {
        case 'uom':
          endpoint = `http://localhost:8000/api/master-data/uom/${id}`;
          break;
        case 'rates':
          endpoint = `http://localhost:8000/api/master-data/rates/${id}`;
          break;
        case 'currency':
          endpoint = `http://localhost:8000/api/master-data/currencies/${id}`;
          break;
        case 'vat':
          endpoint = `http://localhost:8000/api/master-data/vat/${id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Item Deleted',
          description: `${name} has been removed.`,
        });

        // Refresh data
        switch (activeTab) {
          case 'uom': fetchUOM(); break;
          case 'rates': fetchRates(); break;
          case 'currency': fetchCurrencies(); break;
          case 'vat': fetchVAT(); break;
        }
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to delete item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const renderUOMTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Unit of Measurement</h3>
          <p className="text-sm text-muted-foreground">Manage measurement units for equipment</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab('uom')}>
              <Plus className="mr-2 h-4 w-4" />
              Add UoM
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        {loading.uom ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uom.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No units of measurement found. Add your first UOM.
                  </TableCell>
                </TableRow>
              ) : (
                uom.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );

  const renderRatesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rate Management</h3>
          <p className="text-sm text-muted-foreground">Configure pricing rates for equipment</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab('rates')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        {loading.rates ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Weekly Rate</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No rates found. Add your first rate configuration.
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_code}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.currency} {item.daily_rate}</TableCell>
                    <TableCell>{item.currency} {item.weekly_rate}</TableCell>
                    <TableCell>{item.currency} {item.monthly_rate}</TableCell>
                    <TableCell>{item.currency}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.item_name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );

  const renderCurrencyTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Currency Configuration</h3>
          <p className="text-sm text-muted-foreground">Manage currency settings and exchange rates</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab('currency')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        {loading.currencies ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No currencies found. Add your first currency.
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.symbol}</TableCell>
                    <TableCell>{item.exchange_rate} AED</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );

  const renderVATTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">VAT Configuration</h3>
          <p className="text-sm text-muted-foreground">Manage VAT rates and settings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab('vat')}>
              <Plus className="mr-2 h-4 w-4" />
              Add VAT Rate
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        {loading.vat ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rate (%)</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vatRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No VAT rates found. Add your first VAT rate.
                  </TableCell>
                </TableRow>
              ) : (
                vatRates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.rate}%</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{new Date(item.effective_from).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );

  const renderFormDialog = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {activeTab === 'uom' && 'Add Unit of Measurement'}
          {activeTab === 'rates' && 'Add Rate Configuration'}
          {activeTab === 'currency' && 'Add Currency'}
          {activeTab === 'vat' && 'Add VAT Rate'}
        </DialogTitle>
        <DialogDescription>
          {activeTab === 'uom' && 'Enter unit of measurement details'}
          {activeTab === 'rates' && 'Configure pricing rates'}
          {activeTab === 'currency' && 'Add currency configuration'}
          {activeTab === 'vat' && 'Configure VAT rate settings'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(activeTab === 'uom' || activeTab === 'currency') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
          </div>
        )}
        {activeTab === 'rates' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Item Code</Label>
                <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate</Label>
                <Input id="dailyRate" type="number" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyRate">Weekly Rate</Label>
                <Input id="weeklyRate" type="number" value={formData.weeklyRate} onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRate">Monthly Rate</Label>
                <Input id="monthlyRate" type="number" value={formData.monthlyRate} onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.id} value={curr.code}>{curr.code} - {curr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        {activeTab === 'currency' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Exchange Rate (to AED)</Label>
                <Input id="exchangeRate" type="number" step="0.01" value={formData.exchangeRate} onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })} required />
              </div>
            </div>
          </>
        )}
        {activeTab === 'vat' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">VAT Rate (%)</Label>
                <Input id="rate" type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <Input id="effectiveFrom" type="date" value={formData.effectiveFrom} onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })} required />
              </div>
            </div>
          </>
        )}
        {(activeTab === 'uom' || activeTab === 'vat') && (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit">Add Item</Button>
        </div>
      </form>
    </DialogContent>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Master Data Setup</h3>
        <p className="text-sm text-muted-foreground">Configure equipment, rates, currencies, and VAT settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uom">Unit of Measurement</TabsTrigger>
          <TabsTrigger value="rates">Rate Management</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="vat">VAT Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="uom">{renderUOMTab()}</TabsContent>
        <TabsContent value="rates">{renderRatesTab()}</TabsContent>
        <TabsContent value="currency">{renderCurrencyTab()}</TabsContent>
        <TabsContent value="vat">{renderVATTab()}</TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        {renderFormDialog()}
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'uom' && 'Edit Unit of Measurement'}
              {activeTab === 'rates' && 'Edit Rate Configuration'}
              {activeTab === 'currency' && 'Edit Currency'}
              {activeTab === 'vat' && 'Edit VAT Rate'}
            </DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {(activeTab === 'uom' || activeTab === 'currency') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Code</Label>
                    <Input id="edit-code" value={editingItem.code} onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required />
                  </div>
                </div>
              )}
              {activeTab === 'rates' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-code">Item Code</Label>
                      <Input id="edit-code" value={editingItem.item_code} onChange={(e) => setEditingItem({ ...editingItem, item_code: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Item Name</Label>
                      <Input id="edit-name" value={editingItem.item_name} onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-dailyRate">Daily Rate</Label>
                      <Input id="edit-dailyRate" type="number" value={editingItem.daily_rate ? editingItem.daily_rate.toString() : ''} onChange={(e) => setEditingItem({ ...editingItem, daily_rate: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-weeklyRate">Weekly Rate</Label>
                      <Input id="edit-weeklyRate" type="number" value={editingItem.weekly_rate ? editingItem.weekly_rate.toString() : ''} onChange={(e) => setEditingItem({ ...editingItem, weekly_rate: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-monthlyRate">Monthly Rate</Label>
                      <Input id="edit-monthlyRate" type="number" value={editingItem.monthly_rate ? editingItem.monthly_rate.toString() : ''} onChange={(e) => setEditingItem({ ...editingItem, monthly_rate: parseFloat(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select value={editingItem.currency} onValueChange={(val) => setEditingItem({ ...editingItem, currency: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.id} value={curr.code}>{curr.code} - {curr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {activeTab === 'currency' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-symbol">Symbol</Label>
                      <Input id="edit-symbol" value={editingItem.symbol} onChange={(e) => setEditingItem({ ...editingItem, symbol: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-exchangeRate">Exchange Rate (to AED)</Label>
                      <Input id="edit-exchangeRate" type="number" step="0.01" value={editingItem.exchange_rate} onChange={(e) => setEditingItem({ ...editingItem, exchange_rate: parseFloat(e.target.value) })} required />
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'vat' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-rate">VAT Rate (%)</Label>
                      <Input id="edit-rate" type="number" value={editingItem.rate} onChange={(e) => setEditingItem({ ...editingItem, rate: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-effectiveFrom">Effective From</Label>
                      <Input id="edit-effectiveFrom" type="date" value={editingItem.effective_from ? new Date(editingItem.effective_from).toISOString().split('T')[0] : ''} onChange={(e) => setEditingItem({ ...editingItem, effective_from: e.target.value })} required />
                    </div>
                  </div>
                </>
              )}
              {(activeTab === 'uom' || activeTab === 'vat') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input id="edit-description" value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} required />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update Item</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};