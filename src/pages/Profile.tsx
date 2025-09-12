import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Camera, Settings, Heart, Star } from "lucide-react";

export function Profile() {
  const userStats = {
    accountType: 'Free',
    memberSince: 'March 2024',
    totalPets: 1,
    postsShared: 15,
    likesReceived: 142,
    currentStreak: 5
  };

  const recentMemories = [
    { id: '1', photo: '/placeholder.svg', date: '2 days ago', caption: 'Buddy\'s first beach day!' },
    { id: '2', photo: '/placeholder.svg', date: '1 week ago', caption: 'Playtime in the park' },
    { id: '3', photo: '/placeholder.svg', date: '2 weeks ago', caption: 'New toy unboxing' },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm pb-20">
      <div className="bg-gradient-primary p-6 rounded-b-3xl">
        <h1 className="text-2xl font-inter font-bold text-primary-foreground">
          Your Profile 👤
        </h1>
        <p className="text-primary-foreground/80">
          Manage your account and preferences
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Account Overview */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="text-lg font-inter">Account Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Pet Parent</h3>
                  <Badge variant={userStats.accountType === 'Free' ? 'secondary' : 'default'}>
                    {userStats.accountType === 'Free' ? '🆓 Free' : '👑 Premium'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Member since {userStats.memberSince}</p>
              </div>
              <Button size="sm" className="btn-primary">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade to Premium
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-primary">{userStats.totalPets}</p>
                <p className="text-xs text-muted-foreground">Pets</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-accent">{userStats.postsShared}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-pet-pink">{userStats.likesReceived}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memories Section */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <span className="text-lg font-inter">Recent Memories</span>
              </div>
              <Button size="sm" className="btn-secondary">
                <Camera className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {recentMemories.map((memory) => (
                <div key={memory.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <img 
                    src={memory.photo} 
                    alt="Pet memory"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{memory.caption}</p>
                    <p className="text-sm text-muted-foreground">{memory.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-pet-pink">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-medium">12</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-lg font-inter">Quick Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Star className="h-4 w-4 mr-2" />
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}