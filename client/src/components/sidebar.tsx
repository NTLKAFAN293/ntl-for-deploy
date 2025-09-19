import { BarChart3, Database, Download, Globe, Home, Share2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "#", icon: Home, current: true },
  { name: "Web Scraping", href: "#", icon: Globe, current: false },
  { name: "Social Media", href: "#", icon: Share2, current: false },
  { name: "Data Storage", href: "#", icon: Database, current: false },
  { name: "Analytics", href: "#", icon: TrendingUp, current: false },
  { name: "Export", href: "#", icon: Download, current: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="text-sidebar-primary-foreground text-sm h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">DataScrape Pro</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                item.current
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-muted-foreground text-sm">SJ</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">Sarah Johnson</p>
            <p className="text-xs text-muted-foreground">Product Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
