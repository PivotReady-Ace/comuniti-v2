import { useState, useEffect } from 'react';
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
import { useOnboardingState } from '@/hooks/useOnboardingState';

// Base URL constant for consistent domain usage
const BASE_URL = 'https://comuniti.co';

const formSchema = z.object({
  listName: z.string().min(5, 'List name must be at least 5 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters').or(z.literal('')).optional(),
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
  const { onboardingData, userData, isDataLoaded, safeNavigateToNextStep, clearOnboardingData } = useOnboardingState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingAmbassador, setExistingAmbassador] = useState<any>(null);
  const [isLoadingAmbassador, setIsLoadingAmbassador] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listName: '',
      tagline: '',
    },
  });

  // CRITICAL FIX 3: Load data based on authenticated user only, no localStorage mixing
  useEffect(() => {
    const initializePage = async () => {
      setIsLoadingAmbassador(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        const currentUserEmail = session?.user?.email;
        
        console.log('🔍 Initializing branding page for user:', currentUserId);
        console.log('📧 User email:', currentUserEmail);
        
        if (session?.user && currentUserId) {
          console.log('✅ Authenticated user detected - checking database for existing ambassador profile');
          
          // CRITICAL: Query database for THIS user's ambassador profile only
          const response = await fetch('/api/ambassadors');
          if (response.ok) {
            const ambassadors = await response.json();
            
            // Find ambassador that matches this specific authenticated user
            const foundAmbassador = ambassadors.find((amb: any) => {
              // More precise matching logic
              const emailMatch = currentUserEmail && 
                (amb.name.toLowerCase().includes(currentUserEmail.split('@')[0].toLowerCase()) ||
                 amb.pageUrl.includes(currentUserEmail.split('@')[0].toLowerCase()));
              
              console.log(`🔍 Checking ambassador: ${amb.name} (${amb.pageUrl}) - Email match: ${emailMatch}`);
              return emailMatch;
            });
            
            if (foundAmbassador) {
              console.log('✅ EDIT MODE: Found existing ambassador for current user:', {
                userId: currentUserId,
                ambassadorId: foundAmbassador.id,
                ambassadorName: foundAmbassador.name,
                pageUrl: foundAmbassador.pageUrl
              });
              
              setIsEditMode(true);
              setExistingAmbassador(foundAmbassador);
              
              // CRITICAL: Pre-fill form with database data ONLY
              form.setValue('listName', foundAmbassador.pageName || '');
              form.setValue('tagline', foundAmbassador.bio || '');
              
              // Load existing profile image
              if (foundAmbassador.logoUrl) {
                setImagePreview(foundAmbassador.logoUrl);
              }
              
              console.log('📝 Form pre-filled with database data:', {
                listName: foundAmbassador.pageName,
                tagline: foundAmbassador.bio,
                logoUrl: foundAmbassador.logoUrl
              });
              
              setIsLoadingAmbassador(false);
              return;
            } else {
              console.log('📋 NEW USER MODE: No existing ambassador found for user:', currentUserId);
            }
          }
        } else {
          console.log('❌ No authenticated user - cannot proceed');
          setLocation('/auth/sign-in');
          return;
        }
        
        // NEW USER MODE: Check for onboarding completion
        console.log('🔄 NEW USER MODE: Checking onboarding data completion');
        
        if (!isDataLoaded) {
          console.log('⏳ Waiting for onboarding data to load...');
          setIsLoadingAmbassador(false);
          return;
        }

        // Check for user-scoped business data
        const userScopedBusinessKey = `user_${currentUserId}_ambassadorBusinesses`;
        const storedBusinesses = localStorage.getItem(userScopedBusinessKey) || localStorage.getItem('ambassadorBusinesses');
        
        console.log('📊 Onboarding data check:', {
          platforms: onboardingData?.platforms,
          userEmail: userData?.email,
          userFullName: userData?.fullName,
          userCountry: userData?.country,
          businessesStored: !!storedBusinesses
        });
        
        if (!onboardingData?.platforms || !userData?.email || !userData?.fullName || !userData?.country || !storedBusinesses) {
          console.log('❌ Missing required onboarding data, redirecting to correct step');
          safeNavigateToNextStep(setLocation);
        } else {
          console.log('✅ All onboarding data present, ready for branding');
        }
        
      } catch (error) {
        console.error('Error initializing branding page:', error);
      } finally {
        setIsLoadingAmbassador(false);
      }
    };

    initializePage();
  }, [isDataLoaded, onboardingData, userData, safeNavigateToNextStep, setLocation, form]);

  const watchedListName = form.watch('listName');
  const previewSlug = watchedListName ? createSlug(watchedListName) : '';

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB - more generous limit)
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeInBytes) {
        setSubmitError('Image file is too large. Please choose a file smaller than 10MB.');
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
      console.log('Submitting branding form:', { editMode: isEditMode, data });

      let logoUrl = existingAmbassador?.logoUrl || null;

      // Upload profile image if selected
      if (selectedImage) {
        console.log('Uploading profile image...');
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ambassador-photos')
          .upload(fileName, selectedImage);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload profile image. Please try again.');
        }

        // Get public URL for uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('ambassador-photos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
        console.log('Profile image uploaded successfully:', logoUrl);
      }

      if (isEditMode && existingAmbassador) {
        // EDIT MODE: Update existing ambassador
        const updateData = {
          pageName: data.listName,
          pageUrl: createSlug(data.listName),
          bio: data.tagline || null,
          logoUrl: logoUrl,
        };

        const response = await fetch(`/api/ambassadors/${existingAmbassador.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update ambassador profile');
        }

        const updatedAmbassador = await response.json();
        console.log('Ambassador profile updated:', updatedAmbassador);

        // Navigate to updated directory page
        setLocation(`/directory/${updatedAmbassador.pageUrl}`);

      } else {
        // CREATE MODE: New ambassador (authenticated user onboarding)
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        const currentUserEmail = session?.user?.email;
        
        if (!currentUserId || !currentUserEmail) {
          throw new Error('Authentication required. Please sign in to continue.');
        }
        
        console.log('🆕 CREATE MODE: Creating new ambassador for user:', currentUserId);
        
        // Get user-scoped onboarding data - prioritize user-scoped keys
        const userScopedUserKey = `user_${currentUserId}_ambassadorUser`;
        const userScopedBusinessKey = `user_${currentUserId}_ambassadorBusinesses`;
        
        const storedUserData = localStorage.getItem(userScopedUserKey) || localStorage.getItem('ambassadorUser');
        const storedBusinesses = localStorage.getItem(userScopedBusinessKey) || localStorage.getItem('ambassadorBusinesses');
        
        if (!storedUserData) {
          throw new Error('User data not found. Please go back to the onboarding account step to continue.');
        }

        const userDataParsed = JSON.parse(storedUserData);
        const businesses = storedBusinesses ? JSON.parse(storedBusinesses) : [];

        console.log('📦 Creating ambassador with data:', {
          currentUserId,
          currentUserEmail,
          userDataParsed,
          businessCount: businesses.length,
          onboardingData,
          formData: data
        });

        // Prepare ambassador data
        const ambassadorData = {
          name: userDataParsed?.fullName || currentUserEmail.split('@')[0] || 'Ambassador',
          platforms: onboardingData?.platforms || [],
          followerCount: onboardingData?.followerCount || 1,
          country: userDataParsed?.country || 'Unknown',
          pageName: data.listName,
          pageUrl: createSlug(data.listName),
          bio: data.tagline || null,
          logoUrl: logoUrl,
          verified: false
        };

        // Create ambassador profile
        const response = await fetch('/api/ambassadors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ambassador: ambassadorData,
            businessIds: businesses.map((b: any) => b.id)
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create ambassador profile');
        }

        const createdAmbassador = await response.json();
        console.log('✅ Ambassador profile created successfully:', {
          ambassadorId: createdAmbassador.id,
          pageUrl: createdAmbassador.pageUrl,
          userId: currentUserId
        });

        // Clear onboarding data after successful completion
        await clearOnboardingData();

        // Navigate to the ambassador's public directory page
        setLocation(`/directory/${createdAmbassador.pageUrl}`);
      }

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

  // Show loading while onboarding data loads
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#F1762E]" />
          <p className="text-gray-600">Loading branding setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            {isEditMode ? 'Edit Your Ambassador Page' : 'Brand Your Ambassador Page'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update your profile information and branding' : 'Complete your profile to create your public recommendation page'}
          </p>
          {!isEditMode && (
            <p className="text-sm text-[#F1762E] mt-2">
              Returning to finish your profile? You can continue from here!
            </p>
          )}
          {isEditMode && existingAmbassador && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Editing profile for: {existingAmbassador.pageName}
            </p>
          )}
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
                          Max file size: 10MB. Supported formats: JPEG, PNG, WebP
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
                          {isEditMode ? 'Updating Profile...' : 'Creating Profile...'}
                        </>
                      ) : (
                        isEditMode ? 'Update My Page' : 'Create My Page'
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
                    {BASE_URL}/directory/{previewSlug}
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