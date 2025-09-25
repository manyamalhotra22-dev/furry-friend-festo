import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Heart, PawPrint, ArrowRight, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be 0 or greater').max(30, 'Age must be realistic'),
});

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [petData, setPetData] = useState({
    name: '',
    breed: '',
    age: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const validatePetForm = () => {
    try {
      petSchema.parse({
        ...petData,
        age: parseInt(petData.age) || 0,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleCreatePet = async () => {
    if (!validatePetForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pets')
        .insert({
          user_id: user?.id,
          name: petData.name,
          breed: petData.breed,
          age: parseInt(petData.age),
        });

      if (error) throw error;

      toast({
        title: "Pet profile created!",
        description: `${petData.name} has been added to your family.`,
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: "Error creating pet profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPetData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleComplete = () => {
    toast({
      title: "Welcome to PetPal!",
      description: "Your account is all set up. Let's start your pet care journey!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <Heart className="w-8 h-8 text-primary fill-current" />
          </div>
          <h1 className="text-2xl font-fredoka font-bold text-foreground">
            Let's set up your profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Tell us about your furry family member
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="card-warm">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-fredoka">Add Your First Pet</CardTitle>
                <CardDescription>
                  Let's create a profile for your beloved companion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pet-name">Pet Name</Label>
                  <Input
                    id="pet-name"
                    placeholder="What's your pet's name?"
                    value={petData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet-breed">Breed</Label>
                  <Input
                    id="pet-breed"
                    placeholder="e.g., Golden Retriever, Persian Cat"
                    value={petData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className={errors.breed ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.breed && <p className="text-sm text-destructive">{errors.breed}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet-age">Age (years)</Label>
                  <Input
                    id="pet-age"
                    type="number"
                    placeholder="How old is your pet?"
                    value={petData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={errors.age ? 'border-destructive' : ''}
                    disabled={isLoading}
                    min="0"
                    max="30"
                  />
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>

                <Button 
                  onClick={handleCreatePet}
                  className="w-full btn-primary mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <PawPrint className="mr-2 h-4 w-4 animate-pulse" />
                      Creating profile...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-xl font-fredoka">All Set!</CardTitle>
                <CardDescription>
                  Your pet profile has been created. You're ready to start tracking their health and connecting with the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-center mb-2">What's Next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Track daily health activities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Connect with other pet parents
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Get personalized care reminders
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handleComplete}
                  className="w-full btn-primary"
                >
                  Start My Pet Care Journey
                  <Heart className="ml-2 h-4 w-4 fill-current" />
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};