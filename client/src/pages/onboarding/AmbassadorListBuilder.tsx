import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const businessCategories = [
  'Tour Guide',
  'Travel Agent',
  'Housekeeper',
  'Hairdresser',
  'Hair Braider',
  'Doctor',
  'Dentist',
  'Immigration Attorney',
  'Tax Attorney',
  'Real Estate Agent (Rental or Sales)',
  'Used Car Dealer',
  'Language Tutor',
  'Veterinarian',
  'Private Driver',
  'Daycare Provider',
  'Massage Therapist',
  'Personal Trainer',
  'Pet Sitter',
  'Property Manager',
  'Handyman',
  'Chef or Caterer',
  'Translator',
  'Restaurant owner (event center owner)',
  'Pet Relocation',
  'Vehicle Relocation',
  'Personal Relocation Consultant',
  'Moving Company',
  'Social Club',
];

const businessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  whatsappNumber: z.string().regex(/^[1-9][0-9]{7,14}$/, {
    message: 'Enter a valid number in international format (no +, spaces, or symbols).',
  }),
  businessAddress: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
});

const formSchema = z.object({
  businesses: z.array(businessSchema).min(1, 'Please add at least one business'),
});

type FormData = z.infer<typeof formSchema>;

export function AmbassadorListBuilder() {
  const [, setLocation] = useLocation();
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businesses: [
        {
          businessName: '',
          contactPerson: '',
          email: '',
          whatsappNumber: '',
          businessAddress: '',
          categories: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'businesses',
  });

  const toggleCard = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addBusiness = () => {
    append({
      businessName: '',
      contactPerson: '',
      email: '',
      whatsappNumber: '',
      businessAddress: '',
      categories: [],
    });
    // Expand the new card
    setExpandedCards(prev => ({
      ...prev,
      [fields.length]: true,
    }));
  };

  const removeBusiness = (index: number) => {
    remove(index);
    // Clean up expanded state
    setExpandedCards(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const onSubmit = (data: FormData) => {
    // Store form data for next step (could use context or localStorage)
    localStorage.setItem('ambassadorBusinesses', JSON.stringify(data.businesses));
    setLocation('/onboarding/ambassador/branding');
  };

  const goBack = () => {
    setLocation('/onboarding/ambassador');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Build Your Recommendation List
          </h1>
          <p className="text-gray-600">
            Add trusted service providers you'd recommend to fellow expats
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-2 border-gray-200">
                <Collapsible
                  open={expandedCards[index] ?? true}
                  onOpenChange={() => toggleCard(index)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#003366]">
                          Business #{index + 1}
                          {form.watch(`businesses.${index}.businessName`) && 
                            ` - ${form.watch(`businesses.${index}.businessName`)}`}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBusiness(index);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {expandedCards[index] ?? true ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`businesses.${index}.businessName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter business name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`businesses.${index}.contactPerson`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person</FormLabel>
                              <FormControl>
                                <Input placeholder="Contact person name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`businesses.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="business@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`businesses.${index}.whatsappNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number (include country code, numbers only) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  inputMode="numeric"
                                  placeholder="50761234567" 
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-sm text-gray-500 mt-1">
                                Use numbers only — no +, spaces, or symbols.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`businesses.${index}.businessAddress`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Full business address (optional, for Google Maps)"
                                className="resize-none"
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`businesses.${index}.categories`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Service Categories *</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
                              {businessCategories.map((category) => (
                                <FormField
                                  key={category}
                                  control={form.control}
                                  name={`businesses.${index}.categories`}
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(category)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, category])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== category
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {category}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={addBusiness}
                className="flex items-center gap-2 border-[#F1762E] text-[#F1762E] hover:bg-[#F1762E] hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add Another Business
              </Button>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white"
              >
                Continue to Brand My Page
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}