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
    },
  });

  const watchedListName = form.watch('listName');
  const previewSlug = watchedListName ? createSlug(watchedListName) : '';

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
        throw new Error('User data not found. Please restart the onboarding process.');
      }

      const userData = JSON.parse(storedUserData);
      const slug = createSlug(data.listName);

      // Check if slug already exists (basic validation)
      if (slug.length < 3) {
        throw new Error('List name must create a valid URL slug (at least 3 characters after processing)');
      }

      // TODO: Upload image to Supabase storage if selected
      let imageUrl = null;
      if (selectedImage) {
        console.log('Image upload would happen here:', selectedImage.name);
        // For now, we'll use the preview URL
        imageUrl = imagePreview;
      }

      // Create ambassador profile in database
      const ambassadorData = {
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName || '',
        list_name: data.listName,
        slug: slug,
        profile_image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      console.log('Creating ambassador profile:', ambassadorData);

      // TODO: Save to Supabase database table
      // For now, store in localStorage for demo purposes
      localStorage.setItem('ambassadorProfile', JSON.stringify(ambassadorData));

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
                          accept="image/*"
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
                        {selectedImage && (
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedImage.name}
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
                    comuniti.com/directory/{previewSlug}
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