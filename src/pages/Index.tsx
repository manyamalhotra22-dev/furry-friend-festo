import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Home } from "./Home";
import { Community } from "./Community";
import { Profile } from "./Profile";
import { GamificationStats } from "@/components/GamificationStats";
import { HealthTracker } from "@/components/HealthTracker";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'health':
        return (
          <div className="min-h-screen bg-gradient-warm pb-20">
            <div className="bg-gradient-primary p-6 rounded-b-3xl">
              <h1 className="text-2xl font-inter font-bold text-primary-foreground">
                Health Tracking 📊
              </h1>
              <p className="text-primary-foreground/80">
                Monitor your pet's daily wellness
              </p>
            </div>
            <div className="p-6 space-y-6">
              <HealthTracker />
              
              {/* Upcoming Reminders */}
              <Card className="card-warm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-inter">Upcoming Reminders</span>
                    <AddReminderDialog />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: '1', title: 'Vaccination due', date: 'Tomorrow', type: 'urgent' },
                    { id: '2', title: 'Grooming appointment', date: 'Friday', type: 'normal' },
                    { id: '3', title: 'Monthly check-up', date: 'Next week', type: 'normal' }
                  ].map((reminder) => (
                    <div 
                      key={reminder.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted"
                    >
                      <div>
                        <p className="font-medium">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">{reminder.date}</p>
                      </div>
                      <Badge 
                        variant={reminder.type === 'urgent' ? 'destructive' : 'secondary'}
                      >
                        {reminder.type === 'urgent' ? 'Urgent' : 'Scheduled'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'community':
        return <Community />;
      case 'add':
        return (
          <div className="min-h-screen bg-gradient-warm pb-20 flex items-center justify-center">
            <Card className="card-warm max-w-sm mx-auto">
              <CardContent className="text-center p-8">
                <h2 className="text-xl font-fredoka font-semibold mb-4">
                  Quick Add
                </h2>
                <p className="text-muted-foreground mb-6">
                  What would you like to add?
                </p>
                <div className="space-y-3">
                  <button className="btn-primary w-full">
                    📸 Share Photo
                  </button>
                  <button className="btn-secondary w-full">
                    🏥 Log Health Activity
                  </button>
                  <button className="btn-secondary w-full">
                    🐕 Add New Pet
                  </button>
                  <button className="btn-secondary w-full">
                    ⏰ Set Reminder
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="bg-background">
      {renderContent()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default Index;
