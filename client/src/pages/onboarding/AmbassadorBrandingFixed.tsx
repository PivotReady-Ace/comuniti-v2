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
import { useAuth } from '@/hooks/useAuth';
import { clearOnboardingStateForUser } from '@/lib/onboardingState';

// localStorage diagnostic helper
const logLocalStorageSnapshot = (step: string) => {
  console.log(`📊 LOCALSTORAGE SNAPSHOT [${step}]:`, {
    keys: Object.keys(localStorage),
    values: Object.keys(localStorage).reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>)
  });
};

const formSchema = z.object({
  listName: z.string().min(5, 'List name must be at least 5 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters').or(z.literal('')).optional(),
  profileImage: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

export function AmbassadorBranding() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { onboardingData, userData, isDataLoaded, clearOnboardingData } = useOnboardingState();
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

  // CRITICAL FIX: Authentication-based data loading with proper user scoping
  useEffect(() => {
    const initializePage = async () => {
      setIsLoadingAmbassador(true);
      
      try {
        // Wait for auth to complete loading before checking user
        if (authLoading) {
          console.log('⏳ Auth still loading, waiting...');
          setIsLoadingAmbassador(false);
          return;
        }
        
        if (!user) {
          console.log('⚠️ Auth completed - No authenticated user found, redirecting to sign in');
          setLocation('/auth/sign-in');
          return;
        }

        const userId = user.id;
        const userEmail = user.email;
        
        console.log('🔐 Loading branding page for authenticated user:', userId, userEmail);
        
        // Fetch all ambassadors and find by user email
        const response = await fetch('/api/ambassadors');
        if (response.ok) {
          const ambassadors = await response.json();
          
          // CRITICAL: Find ambassador by exact user email match
          const foundAmbassador = ambassadors.find((amb: any) => {
            if (!userEmail || !amb.name) return false;
            const emailPrefix = userEmail.split('@')[0].toLowerCase();
            return amb.name.toLowerCase().includes(emailPrefix);
          });
          
          if (foundAmbassador) {
            console.log('✅ Existing ambassador found - entering edit mode');
            console.log('📋 Ambassador data source: DATABASE');
            console.log('📋 Loading data for user:', userId);
            console.log('📋 Ambassador data:', {
              id: foundAmbassador.id,
              name: foundAmbassador.name,
              pageName: foundAmbassador.pageName,
              bio: foundAmbassador.bio
            });
            
            setIsEditMode(true);
            setExistingAmbassador(foundAmbassador);
            
            // CRITICAL: Pre-fill form ONLY with database data
            form.setValue('listName', foundAmbassador.pageName || '');
            form.setValue('tagline', foundAmbassador.bio || '');
            
            if (foundAmbassador.logoUrl) {
              setImagePreview(foundAmbassador.logoUrl);
            }
            
            setIsLoadingAmbassador(false);
            return;
          } else {
            console.log('📝 No existing ambassador found - new onboarding mode');
            console.log('📋 Data source: USER-SCOPED LOCALSTORAGE for user:', userId);
          }
        }
        
        // No existing ambassador - check user-scoped onboarding data
        if (!isDataLoaded) {
          console.log('⏳ Waiting for user-scoped onboarding data to load...');
          setIsLoadingAmbassador(false);
          return;
        }

        // Check user-scoped localStorage
        const userBusinessKey = `user_${userId}_ambassadorBusinesses`;
        const storedBusinesses = localStorage.getItem(userBusinessKey) || localStorage.getItem('ambassadorBusinesses');
        
        console.log('📦 Checking onboarding requirements for user:', userId);
        console.log('📦 Onboarding data:', onboardingData);
        console.log('📦 User data:', userData);
        console.log('📦 Business data found:', !!storedBusinesses);

        if (!onboardingData?.platforms || !userData?.email || !userData?.fullName || !userData?.country || !storedBusinesses) {
          console.log('❌ Missing required onboarding data - redirecting to correct step');
          if (!onboardingData?.platforms) setLocation('/onboarding/ambassador');
          else if (!userData?.email || !userData?.fullName || !userData?.country) setLocation('/onboarding/ambassador/account');
          else if (!storedBusinesses) setLocation('/onboarding/ambassador/list-builder');
        } else {
          console.log('✅ All onboarding data present - ready for branding');
        }
        
      } catch (error) {
        console.error('❌ Error initializing branding page:', error);
      } finally {
        setIsLoadingAmbassador(false);
      }
    };

    initializePage();
  }, [user, authLoading, isDataLoaded, onboardingData, userData, form, setLocation]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setSubmitError('Image file is too large. Please choose a file smaller than 10MB.');
        event.target.value = '';
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Please select a valid image file (JPEG, PNG, or WebP).');
        event.target.value = '';
        return;
      }

      setSubmitError(null);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setSubmitError('You must be logged in to create an ambassador profile.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('🚀 Submitting branding form for user:', user.id, { editMode: isEditMode, data });

      let logoUrl = existingAmbassador?.logoUrl || null;

      // Upload profile image if selected
      if (selectedImage) {
        console.log('📷 Uploading profile image...');
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ambassador-photos')
          .upload(fileName, selectedImage);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload profile image. Please try again.');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('ambassador-photos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
        console.log('✅ Profile image uploaded successfully:', logoUrl);
      }

      if (isEditMode && existingAmbassador) {
        // UPDATE MODE: Edit existing ambassador
        const updateData = {
          pageName: data.listName,
          pageUrl: createSlug(data.listName),
          bio: data.tagline || null,
          logoUrl: logoUrl,
        };

        console.log('🔄 Updating existing ambassador:', existingAmbassador.id, updateData);

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
        console.log('✅ Ambassador profile updated successfully');

        // Debug: Check auth state before navigation
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Auth state before navigation - User ID:', session?.user?.id, 'Email:', session?.user?.email);

        // Clear onboarding state after successful completion
        if (user?.id) {
          clearOnboardingStateForUser(user.id);
        }
        
        // Step 4: Log localStorage before redirect to directory
        logLocalStorageSnapshot('Before Directory Redirect (Edit Mode)');
        
        console.log('🔀 NAVIGATION: Profile update → Directory page:', `/directory/${updatedAmbassador.pageUrl}`);
        setLocation(`/directory/${updatedAmbassador.pageUrl}`);

      } else {
        // CREATE MODE: New ambassador
        console.log('📋 Creating new ambassador for user:', user.id);
        
        // Get user-scoped localStorage data
        const userBusinessKey = `user_${user.id}_ambassadorBusinesses`;
        const storedBusinesses = localStorage.getItem(userBusinessKey) || localStorage.getItem('ambassadorBusinesses');
        const businesses = storedBusinesses ? JSON.parse(storedBusinesses) : [];

        const ambassadorData = {
          name: userData?.fullName || user.email?.split('@')[0] || 'Ambassador',
          platforms: onboardingData?.platforms || [],
          followerCount: onboardingData?.followerCount || 1,
          country: userData?.country || 'Unknown',
          pageName: data.listName,
          pageUrl: createSlug(data.listName),
          bio: data.tagline || null,
          logoUrl: logoUrl,
          verified: false
        };

        console.log('📤 Submitting new ambassador data:', ambassadorData);

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
        console.log('✅ Ambassador profile created successfully');

        // Debug: Check auth state before navigation
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Auth state before navigation - User ID:', session?.user?.id, 'Email:', session?.user?.email);

        // Clear onboarding state after successful completion
        if (user?.id) {
          clearOnboardingStateForUser(user.id);
        }

        // Step 4: Log localStorage before redirect to directory
        logLocalStorageSnapshot('Before Directory Redirect (New Ambassador)');
        
        console.log('🔀 NAVIGATION: Branding completion → Directory page:', `/directory/${createdAmbassador.pageUrl}`);
        setLocation(`/directory/${createdAmbassador.pageUrl}`);
      }

    } catch (error: any) {
      console.error('❌ Branding submission error:', error);
      setSubmitError(error?.message || 'Failed to save your ambassador profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setLocation('/onboarding/ambassador/list-builder');
  };

  // Show loading while authentication is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#F1762E]" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking ambassador data
  if (isLoadingAmbassador || !isDataLoaded) {
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
          {isEditMode && existingAmbassador && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Editing profile for: {existingAmbassador.pageName} (User: {user?.email})
            </p>
          )}
          {!isEditMode && (
            <p className="text-sm text-blue-600 mt-2">
              Creating new profile for: {user?.email}
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
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="profile-image"
                        />
                        <Label 
                          htmlFor="profile-image"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Image
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* List Name */}
                  <FormField
                    control={form.control}
                    name="listName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Recommendation List Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Luna's Happy Places in Costa Rica" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tagline */}
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="A short description of your recommendations" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {!isEditMode && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#F1762E] hover:bg-[#D86527] text-white"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isEditMode ? 'Update Profile' : 'Create Ambassador Page'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003366]">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#003366]">
                    {form.watch('listName') || 'Your List Name'}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {form.watch('tagline') || 'Your tagline will appear here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    URL: comuniti.co/directory/{createSlug(form.watch('listName') || 'your-list-name')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}