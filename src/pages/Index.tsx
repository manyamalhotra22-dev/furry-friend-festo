import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Home } from "./Home";
import { Community } from "./Community";
import { GamificationStats } from "@/components/GamificationStats";
import { Card, CardContent } from "@/components/ui/card";

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
              <h1 className="text-2xl font-fredoka font-bold text-primary-foreground">
                Health Tracking 📊
              </h1>
              <p className="text-primary-foreground/80">
                Monitor your pet's daily wellness
              </p>
            </div>
            <div className="p-6">
              <GamificationStats />
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
        return (
          <div className="min-h-screen bg-gradient-warm pb-20">
            <div className="bg-gradient-primary p-6 rounded-b-3xl">
              <h1 className="text-2xl font-fredoka font-bold text-primary-foreground">
                Your Profile 👤
              </h1>
              <p className="text-primary-foreground/80">
                Manage your account and preferences
              </p>
            </div>
            <div className="p-6">
              <Card className="card-warm text-center">
                <CardContent className="p-8">
                  <h2 className="text-lg font-fredoka font-semibold mb-4">
                    Profile coming soon!
                  </h2>
                  <p className="text-muted-foreground">
                    Your profile settings and premium upgrade options will be available here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
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
