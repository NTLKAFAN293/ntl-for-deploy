import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WebScrapingTool() {
  const [url, setUrl] = useState("");
  const [scrapingType, setScrapingType] = useState("Full Page Content");
  const [updateFrequency, setUpdateFrequency] = useState("One-time");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/scrape", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scraping Started",
        description: "Your scraping job has been queued successfully.",
      });
      setUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/scraped-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    scrapeMutation.mutate({
      source: new URL(url).hostname,
      type: "web",
      url,
      metadata: {
        scrapingType,
        updateFrequency,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Web Scraping Tool</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-scraping-history">
            <History className="mr-1 h-4 w-4" />
            History
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
              Target URL
            </Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                data-testid="input-scrape-url"
              />
              <Button 
                type="submit" 
                disabled={scrapeMutation.isPending}
                data-testid="button-start-scrape"
              >
                {scrapeMutation.isPending ? (
                  "Scraping..."
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Scrape
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Scraping Type
              </Label>
              <Select value={scrapingType} onValueChange={setScrapingType}>
                <SelectTrigger data-testid="select-scraping-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Page Content">Full Page Content</SelectItem>
                  <SelectItem value="Text Only">Text Only</SelectItem>
                  <SelectItem value="Links & Images">Links & Images</SelectItem>
                  <SelectItem value="Product Data">Product Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Update Frequency
              </Label>
              <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                <SelectTrigger data-testid="select-update-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        {/* Recent Jobs Section would go here */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Recent Jobs</h4>
          <div className="text-sm text-muted-foreground">
            Recent scraping jobs will appear here
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
