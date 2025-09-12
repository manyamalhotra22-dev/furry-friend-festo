import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PetProfile } from "@/components/PetProfile";
import { HealthTracker } from "@/components/HealthTracker";
import { GamificationStats } from "@/components/GamificationStats";
import { 
  Bell, 
  Calendar, 
  Plus,
  Sparkles
} from "lucide-react";
import heroImage from "@/assets/hero-realistic.jpg";

export function Home() {
  const [pets] = useState([
    {
      id: '1',
      name: 'Buddy',
      photo: '/placeholder.svg',
      age: '2 years old',
      breed: 'Golden Retriever',
      weight: '28 kg',
      healthNotes: 'Needs daily exercise and loves treats',
      badges: ['Good Boy', 'Vaccinated', 'Social']
    }
  ]);

  const upcomingReminders = [
    { id: '1', title: 'Vaccination due', date: 'Tomorrow', type: 'urgent' },
    { id: '2', title: 'Grooming appointment', date: 'Friday', type: 'normal' },
    { id: '3', title: 'Monthly check-up', date: 'Next week', type: 'normal' }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-inter font-bold text-primary-foreground">
              Good morning! 🌅
            </h1>
            <p className="text-primary-foreground/80">
              Ready to take care of your furry friends?
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground">
            <Bell className="h-6 w-6" />
          </Button>
        </div>
        
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-inter">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="btn-primary h-12">
                <Plus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
              <Button className="btn-secondary h-12">
                <Calendar className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pet Profiles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-inter font-semibold">Your Pets</h2>
            <Button size="sm" className="btn-secondary">
              <Plus className="h-4 w-4 mr-1" />
              Add Pet
            </Button>
          </div>
          
          {pets.map((pet) => (
            <PetProfile key={pet.id} pet={pet} />
          ))}
        </div>

      </div>
    </div>
  );
}