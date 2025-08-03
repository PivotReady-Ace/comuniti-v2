import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, User, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  listName: z.string().min(5, 'List name must be at least 5 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters').optional(),
  profileImage: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function AmbassadorBranding() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listName: '',
      tagline: '',
    },
  });

  const watchedListName = form.watch('listName');
  const previewSlug = watchedListName ? createSlug(watchedListName) : '';

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        setSubmitError('Image file is too large. Please choose a file smaller than 5MB.');
        event.target.value = ''; // Clear the input
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Please select a valid image file (JPEG, PNG, or WebP).');
        event.target.value = ''; // Clear the input
        return;
      }

      setSubmitError(null); // Clear any previous errors
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get current user data from localStorage (from previous onboarding steps)
      const storedUserData = localStorage.getItem('ambassadorUser');
      if (!storedUserData) {
        throw new Error('User data not found. Please go back to the onboarding account step to continue.');
      }

      const userData = JSON.parse(storedUserData);
      const slug = createSlug(data.listName);

      // Check if slug already exists (basic validation)
      if (slug.length < 3) {
        throw new Error('List name must create a valid URL slug (at least 3 characters after processing)');
      }

      // Handle image upload to Supabase storage
      let imageUrl = null;
      if (selectedImage) {
        try {
          const fileExt = selectedImage.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `ambassador-logos/${fileName}`;

          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, selectedImage, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Image upload error:', error);
            if (error.message.includes('The resource was not found')) {
              setSubmitError('Storage bucket not found. Please create an "avatars" bucket in your Supabase storage dashboard.');
            } else {
              setSubmitError(`Failed to upload image: ${error.message}`);
            }
            return;
          }

          // Get public URL for the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          imageUrl = publicUrlData.publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Image upload error:', error);
          setSubmitError('Failed to upload image. Please try again.');
          return;
        }
      }

      // Get business data from previous step
      const storedBusinessData = localStorage.getItem('ambassadorBusinesses');
      const businessData = storedBusinessData ? JSON.parse(storedBusinessData) : [];

      // Create ambassador profile for API using correct schema fields
      const ambassadorData = {
        name: userData.fullName || userData.email?.split('@')[0] || 'Ambassador',
        platform: userData.platform || 'Instagram',
        followerCount: userData.followerCount || 0,
        country: userData.country || '',
        logoUrl: imageUrl,
        pageName: data.listName,
        pageUrl: slug,
        bio: data.tagline || '',
      };

      console.log('Creating ambassador profile:', ambassadorData);
      console.log('Business data to create:', businessData);

      // First create businesses from form data
      const createdBusinessIds = [];
      for (const business of businessData) {
        const businessPayload = {
          name: business.businessName,
          category: business.categories.join(', '), // Join multiple categories
          whatsapp: business.whatsappNumber,
          location: business.businessAddress || 'Address not provided',
          description: `Contact: ${business.contactPerson}${business.email ? ` (${business.email})` : ''}`,
        };

        const businessResponse = await fetch('/api/businesses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessPayload),
        });

        if (businessResponse.ok) {
          const createdBusiness = await businessResponse.json();
          createdBusinessIds.push(createdBusiness.id);
        }
      }

      // Save ambassador to database via API
      const response = await fetch('/api/ambassadors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ambassador: ambassadorData,
          businessIds: createdBusinessIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ambassador profile');
      }

      const createdAmbassador = await response.json();
      console.log('Ambassador profile created:', createdAmbassador);

      // Keep stored data for potential re-use (don't clear on success)
      // This allows users to continue from where they left off if needed
      // localStorage.removeItem('ambassadorUser');
      // localStorage.removeItem('selectedBusinesses');

      // Navigate to the public directory page
      setLocation(`/directory/${slug}`);

    } catch (error: any) {
      console.error('Branding submission error:', error);
      setSubmitError(error?.message || 'Failed to create your ambassador profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setLocation('/onboarding/ambassador/list-builder');
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Brand Your Ambassador Page
          </h1>
          <p className="text-gray-600">
            Complete your profile to create your public recommendation page
          </p>
          <p className="text-sm text-[#F1762E] mt-2">
            Returning to finish your profile? You can continue from here!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Profile Image Upload */}
                  <div className="space-y-2">
                    <Label>Profile Photo or Logo (optional)</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="profile-image"
                        />
                        <Label 
                          htmlFor="profile-image"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          {selectedImage ? 'Change Photo' : 'Upload Photo'}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Max file size: 5MB. Supported formats: JPEG, PNG, WebP
                        </p>
                        {selectedImage && (
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)}MB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List Name Field */}
                  <FormField
                    control={form.control}
                    name="listName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Give your list a name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Aaron's Public List for Panama City" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          This name will appear at the top of your public page and be used in your shareable URL.
                        </p>
                        {previewSlug && (
                          <p className="text-sm text-[#F1762E] font-medium">
                            Your URL will be: comuniti.com/directory/{previewSlug}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tagline Field */}
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Helping expats find trusted local services" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          A short description that will appear under your name on your public page.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white"
                      disabled={isSubmitting || !watchedListName}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Profile...
                        </>
                      ) : (
                        'Create My Page'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#003366]">Page Preview</CardTitle>
              <p className="text-sm text-gray-600">
                How your public page will look to visitors
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#003366]">
                      {watchedListName || 'Your List Name'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Trusted recommendations by an ambassador
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Your recommended businesses will appear here
                </p>
              </div>
              
              {previewSlug && (
                <div className="mt-4 p-3 bg-[#F1762E]/10 border border-[#F1762E]/20 rounded-lg">
                  <p className="text-sm text-[#F1762E] font-medium">
                    <strong>Your shareable URL:</strong><br />
                    comuniti.co/directory/{previewSlug}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}