import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ThumbsUp, Plus } from "lucide-react";

const sampleQuestions = [
  {
    id: '1',
    question: 'My golden retriever puppy is 3 months old. How often should I feed him?',
    author: 'PetParent_23',
    answers: 5,
    likes: 12,
    tags: ['feeding', 'puppy', 'golden retriever']
  },
  {
    id: '2',
    question: 'Best flea prevention for cats in Mumbai weather?',
    author: 'CatMom_Mumbai',
    answers: 8,
    likes: 25,
    tags: ['cats', 'flea prevention', 'mumbai']
  },
  {
    id: '3',
    question: 'My dog seems anxious during thunderstorms. Any tips?',
    author: 'DogDad_007',
    answers: 3,
    likes: 7,
    tags: ['anxiety', 'behavior', 'storms']
  }
];

export function QASection() {
  return (
    <Card className="card-warm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-inter">Community Q&A</span>
          <Button size="sm" className="btn-secondary h-8">
            <Plus className="h-4 w-4 mr-1" />
            Ask Question
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sampleQuestions.map((qa) => (
          <div key={qa.id} className="p-4 rounded-xl border border-border bg-muted/30">
            <p className="font-medium text-foreground mb-2 line-clamp-2">
              {qa.question}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {qa.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>by {qa.author}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{qa.answers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{qa.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}