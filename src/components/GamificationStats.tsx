import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Zap, 
  Target, 
  Star,
  Award,
  Flame
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export function GamificationStats() {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Daily Warrior',
      description: 'Complete daily care for 7 days',
      icon: Flame,
      unlocked: false,
      progress: 5,
      target: 7
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Get 50 likes on posts',
      icon: Star,
      unlocked: true
    },
    {
      id: '3',
      title: 'Health Hero',
      description: 'Log 30 health activities',
      icon: Trophy,
      unlocked: false,
      progress: 18,
      target: 30
    }
  ];

  const stats = {
    level: 5,
    experience: 850,
    nextLevelExp: 1000,
    streak: 5,
    totalPoints: 2340
  };

  return (
    <div className="space-y-4">
      {/* Level Progress */}
      <Card className="card-warm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-inter gradient-text">
              Level {stats.level}
            </span>
            <Badge className="bg-gradient-primary text-primary-foreground">
              {stats.totalPoints} pts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{stats.experience}/{stats.nextLevelExp} XP</span>
              </div>
              <Progress 
                value={(stats.experience / stats.nextLevelExp) * 100} 
                className="h-3"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <span className="font-medium">{stats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">
                  Keep going!
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="card-warm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-inter">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            
            return (
              <div 
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  achievement.unlocked 
                    ? 'bg-success/10 border-success/20' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div 
                  className={`p-2 rounded-full ${
                    achievement.unlocked 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    achievement.unlocked 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  
                  {achievement.progress && achievement.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{achievement.progress}/{achievement.target}</span>
                        <span>
                          {Math.round((achievement.progress / achievement.target) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
                
                {achievement.unlocked && (
                  <Award className="h-5 w-5 text-success" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}