import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Link, MessageSquare, Share2 } from "lucide-react";

interface Stats {
  totalUrls: number;
  socialPosts: number;
  dataPoints: number;
  chatQueries: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const cards = [
    {
      title: "Total Scraped URLs",
      value: stats?.totalUrls?.toLocaleString() || "0",
      change: "↗ 12%",
      changeType: "positive",
      icon: Link,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Social Posts",
      value: stats?.socialPosts?.toLocaleString() || "0",
      change: "↗ 8%", 
      changeType: "positive",
      icon: Share2,
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      title: "Data Points",
      value: stats?.dataPoints ? `${(stats.dataPoints / 1000).toFixed(1)}K` : "0",
      change: "↗ 24%",
      changeType: "positive", 
      icon: Database,
      color: "bg-secondary/20 text-secondary-foreground",
    },
    {
      title: "Chat Queries",
      value: stats?.chatQueries?.toLocaleString() || "0",
      change: "↗ 18%",
      changeType: "positive",
      icon: MessageSquare,
      color: "bg-muted/20 text-muted-foreground",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="text-lg h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-green-600 text-sm font-medium">{card.change}</span>
                <span className="text-muted-foreground text-sm">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
