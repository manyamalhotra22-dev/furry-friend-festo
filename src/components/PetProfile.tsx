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
              <h3 className="text-xl font-inter font-semibold text-foreground">
                {pet.name}
              </h3>
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