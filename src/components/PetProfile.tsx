import { Heart, Calendar, MapPin, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Pet {
  id: string;
  name: string;
  photo: string;
  age: string;
  breed: string;
  weight: string;
  healthNotes: string;
  badges: string[];
}

interface PetProfileProps {
  pet: Pet;
  onEdit?: () => void;
}

export function PetProfile({ pet, onEdit }: PetProfileProps) {
  return (
    <Card className="card-warm mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img 
            src={pet.photo} 
            alt={pet.name}
            className="pet-avatar"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-inter font-semibold text-foreground">
                  {pet.name}
                </h3>
                {/* XP Bar */}
                <div className="flex-1 max-w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-inter font-medium">Lvl 5</span>
                    <span className="text-xs text-muted-foreground">850/1000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 group cursor-pointer relative">
                    <div className="bg-gradient-primary h-2 rounded-full transition-all duration-300" style={{width: '85%'}}></div>
                    {/* Tooltip on hover */}
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-soft text-xs whitespace-nowrap z-10">
                      <div className="font-inter font-medium mb-1">Level 6 Requirements:</div>
                      <div className="space-y-1 text-muted-foreground">
                        <div>• Complete 7-day care streak</div>
                        <div>• Log 30 health activities</div>
                        <div>• Get 50 community likes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onEdit}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{pet.age}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{pet.breed}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {pet.badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-primary-light text-primary-foreground font-medium"
                >
                  {badge}
                </Badge>
              ))}
            </div>
            
            {pet.healthNotes && (
              <p className="text-sm text-muted-foreground">
                {pet.healthNotes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}