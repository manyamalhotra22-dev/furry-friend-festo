import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityFeed } from "@/components/CommunityFeed";
import { QASection } from "@/components/QASection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin
} from "lucide-react";

export function Community() {
  const trendingTopics = [
    { id: '1', tag: '#puppytraining', posts: 245 },
    { id: '2', tag: '#healthtips', posts: 189 },
    { id: '3', tag: '#cutepets', posts: 567 },
    { id: '4', tag: '#vetadvice', posts: 123 }
  ];

  const localEvents = [
    {
      id: '1',
      title: 'Mumbai Pet Expo',
      date: 'Dec 15-17',
      location: 'BKC, Mumbai',
      attendees: 234
    },
    {
      id: '2',
      title: 'Dog Training Workshop',
      date: 'Dec 20',
      location: 'Bandra, Mumbai',
      attendees: 45
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm pb-20">
      {/* Header */}
      <div className="bg-gradient-community p-6 rounded-b-3xl">
        <h1 className="text-2xl font-inter font-bold text-white mb-2">
          Pet Community 🐾
        </h1>
        <p className="text-white/90">
          Connect with fellow pet parents in your area
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Trending Topics */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-lg font-inter">Trending Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <Badge 
                  key={topic.id}
                  variant="secondary"
                  className="bg-primary-light text-primary-foreground cursor-pointer hover:bg-primary/20"
                >
                  {topic.tag} ({topic.posts})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Local Events */}
        <Card className="card-warm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-lg font-inter">Local Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localEvents.map((event) => (
              <div 
                key={event.id}
                className="p-4 rounded-xl border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {event.date}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} going</span>
                  </div>
                </div>
                <Button size="sm" className="btn-primary mt-3">
                  Join Event
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Q&A Section */}
        <QASection />

        {/* Community Feed */}
        <div>
          <h2 className="text-xl font-inter font-semibold mb-4">
            Recent Posts
          </h2>
          <CommunityFeed />
        </div>
      </div>
    </div>
  );
}