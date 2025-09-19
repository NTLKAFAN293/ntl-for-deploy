import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function QuickActions() {
  const { toast } = useToast();

  const exportCsvMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/csv");
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scraped_data.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Your data has been exported to CSV successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analyze/summary");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "AI-powered insights report has been generated.",
      });
      // You could open a modal or navigate to a report page here
      console.log("Generated report:", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Report Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const actions = [
    {
      title: "Export to CSV",
      description: "Download all data",
      icon: FileSpreadsheet,
      color: "text-primary",
      action: () => exportCsvMutation.mutate(),
      loading: exportCsvMutation.isPending,
      testId: "button-export-csv",
    },
    {
      title: "Generate Report",
      description: "AI-powered insights",
      icon: FileText,
      color: "text-primary",
      action: () => generateReportMutation.mutate(),
      loading: generateReportMutation.isPending,
      testId: "button-generate-report",
    },
    {
      title: "Schedule Scraping",
      description: "Automate collection",
      icon: Settings,
      color: "text-primary",
      action: () => {
        toast({
          title: "Feature Coming Soon",
          description: "Scheduled scraping will be available in a future update.",
        });
      },
      loading: false,
      testId: "button-schedule-scraping",
    },
    {
      title: "Clean Data",
      description: "Remove duplicates",
      icon: Trash2,
      color: "text-destructive",
      action: () => {
        toast({
          title: "Feature Coming Soon",
          description: "Data cleaning tools will be available in a future update.",
        });
      },
      loading: false,
      testId: "button-clean-data",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="flex items-center p-3 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors justify-start h-auto"
                onClick={action.action}
                disabled={action.loading}
                data-testid={action.testId}
              >
                <Icon className={`text-lg mr-3 h-5 w-5 ${action.color}`} />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {action.loading ? "Processing..." : action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
