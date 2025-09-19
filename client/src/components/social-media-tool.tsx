import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { ScrapedData } from "@shared/schema";

const platforms = [
  { name: "Twitter", icon: "fab fa-twitter", value: "twitter" },
  { name: "LinkedIn", icon: "fab fa-linkedin", value: "linkedin" },
  { name: "Reddit", icon: "fab fa-reddit", value: "reddit" },
  { name: "YouTube", icon: "fab fa-youtube", value: "youtube" },
];

export default function SocialMediaTool() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: scrapedData = [] } = useQuery<ScrapedData[]>({
    queryKey: ["/api/scraped-data"],
  });

  const socialStats = scrapedData
    .filter(item => item.type === "social")
    .reduce((acc, item) => {
      const today = new Date().toDateString();
      const itemDate = item.timestamp ? new Date(item.timestamp).toDateString() : "";
      
      if (itemDate === today) {
        if (item.source.includes("twitter")) acc.twitter += item.dataPoints || 0;
        if (item.source.includes("linkedin")) acc.linkedin += item.dataPoints || 0;
        if (item.source.includes("reddit")) acc.reddit += item.dataPoints || 0;
      }
      return acc;
    }, { twitter: 0, linkedin: 0, reddit: 0 });

  const collectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/scrape", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Collection Started",
        description: `Started collecting data from ${selectedPlatform}.`,
      });
      setSearchTerms("");
      setSelectedPlatform(null);
      queryClient.invalidateQueries({ queryKey: ["/api/scraped-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Collection Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCollect = () => {
    if (!selectedPlatform) {
      toast({
        title: "Platform Required",
        description: "Please select a social media platform.",
        variant: "destructive",
      });
      return;
    }

    if (!searchTerms.trim()) {
      toast({
        title: "Search Terms Required",
        description: "Please enter keywords or hashtags to search for.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll create a mock social media scraping job
    collectMutation.mutate({
      source: `${selectedPlatform}.com`,
      type: "social",
      url: `https://${selectedPlatform}.com/search?q=${encodeURIComponent(searchTerms)}`,
      metadata: {
        platform: selectedPlatform,
        searchTerms: searchTerms.trim(),
        scrapingType: "Social Media Posts",
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Social Media Collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">Platform</Label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((platform) => (
              <Button
                key={platform.value}
                variant="outline"
                className={cn(
                  "p-3 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center",
                  selectedPlatform === platform.value && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedPlatform(platform.value)}
                data-testid={`button-platform-${platform.value}`}
              >
                <i className={`${platform.icon} text-lg mr-2`}></i>
                <span className="text-sm">{platform.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="searchTerms" className="block text-sm font-medium text-foreground mb-2">
            Search Terms
          </Label>
          <Input
            id="searchTerms"
            type="text"
            placeholder="Enter keywords or hashtags"
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            data-testid="input-social-search-terms"
          />
        </div>

        <Button 
          className="w-full"
          variant="secondary"
          onClick={handleCollect}
          disabled={collectMutation.isPending}
          data-testid="button-start-social-collection"
        >
          {collectMutation.isPending ? (
            "Collecting..."
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Start Collection
            </>
          )}
        </Button>

        {/* Social Media Stats */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Today's Collection</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Twitter Posts</span>
              <span className="font-medium text-foreground" data-testid="stat-twitter-posts">
                {socialStats.twitter}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">LinkedIn Articles</span>
              <span className="font-medium text-foreground" data-testid="stat-linkedin-articles">
                {socialStats.linkedin}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reddit Comments</span>
              <span className="font-medium text-foreground" data-testid="stat-reddit-comments">
                {socialStats.reddit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
