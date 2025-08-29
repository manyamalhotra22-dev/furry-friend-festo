import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Camera,
  Plus
} from "lucide-react";

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    petName: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      user: {
        name: 'Priya Sharma',
        avatar: '/placeholder.svg',
        petName: 'Buddy'
      },
      content: 'Buddy completed his first agility training today! So proud of my little champion 🏆',
      image: '/placeholder.svg',
      timestamp: '2h ago',
      likes: 24,
      comments: 8,
      liked: false
    },
    {
      id: '2',
      user: {
        name: 'Raj Patel',
        avatar: '/placeholder.svg',
        petName: 'Mittens'
      },
      content: 'Morning walk vibes with Mittens ☀️ She discovered a new favorite spot at the park!',
      timestamp: '4h ago',
      likes: 15,
      comments: 3,
      liked: true
    }
  ]);

  const toggleLike = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId
          ? { 
              ...post, 
              liked: !post.liked, 
              likes: post.liked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Create Post Card */}
      <Card className="card-warm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-muted-foreground"
            >
              Share your pet's moment...
            </Button>
            <Button size="icon" className="btn-primary">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="card-warm">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.user.petName} • {post.timestamp}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm mb-3">{post.content}</p>

            {/* Image */}
            {post.image && (
              <div className="mb-3 rounded-xl overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Post content"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 ${
                    post.liked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} 
                  />
                  <span className="text-xs">{post.likes}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{post.comments}</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}