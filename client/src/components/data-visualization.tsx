import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download } from "lucide-react";
import type { ScrapedData } from "@shared/schema";

export default function DataVisualization() {
  const { data: scrapedData = [], isLoading } = useQuery<ScrapedData[]>({
    queryKey: ["/api/scraped-data"],
  });

  const successRate = scrapedData.length > 0 
    ? Math.round((scrapedData.filter(item => item.status === 'complete').length / scrapedData.length) * 100)
    : 0;

  const avgDataPoints = scrapedData.length > 0
    ? Math.round(scrapedData.reduce((sum, item) => sum + (item.dataPoints || 0), 0) / scrapedData.length)
    : 0;

  const totalRecords = scrapedData.reduce((sum, item) => sum + (item.dataPoints || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-muted/20 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Data Insights</CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue="7days">
              <SelectTrigger className="w-32" data-testid="select-time-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" data-testid="button-export-chart">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Placeholder */}
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border border-border">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-2 mx-auto" />
            <p className="text-muted-foreground">Data collection trend visualization</p>
            <p className="text-xs text-muted-foreground mt-1">
              {scrapedData.length > 0 ? `${scrapedData.length} data sources tracked` : 'No data available yet'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-muted/20 rounded-lg" data-testid="stat-success-rate">
            <p className="text-2xl font-bold text-foreground">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg" data-testid="stat-avg-response">
            <p className="text-2xl font-bold text-foreground">{avgDataPoints}</p>
            <p className="text-xs text-muted-foreground">Avg Data Points</p>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg" data-testid="stat-total-records">
            <p className="text-2xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
