import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import WebScrapingTool from "@/components/web-scraping-tool";
import DataVisualization from "@/components/data-visualization";
import DataTable from "@/components/data-table";
import SocialMediaTool from "@/components/social-media-tool";
import QuickActions from "@/components/quick-actions";
import ChatInterface from "@/components/chat-interface";
import { Bell, Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Monitor and analyze your scraped data</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tools */}
            <div className="lg:col-span-2 space-y-6">
              <WebScrapingTool />
              <DataVisualization />
              <DataTable />
            </div>

            {/* Right Column - Social Tools (visible on mobile, hidden on desktop when chat is open) */}
            <div className={`space-y-6 ${!isMobile && isChatOpen ? 'hidden lg:hidden' : 'block'}`}>
              <SocialMediaTool />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Chat Interface */}
      {!isMobile && isChatOpen && (
        <ChatInterface onClose={() => setIsChatOpen(false)} />
      )}

      {/* Mobile Chat Toggle */}
      {isMobile && (
        <div className="fixed bottom-6 right-6">
          <Button 
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => setIsMobileChatOpen(true)}
            data-testid="button-mobile-chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Chat Overlay */}
      {isMobile && isMobileChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-xl max-h-[80vh] flex flex-col">
            <ChatInterface 
              onClose={() => setIsMobileChatOpen(false)} 
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
