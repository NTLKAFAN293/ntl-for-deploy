import { useState } from 'react';
import { 
  Bot, 
  FileText, 
  Settings, 
  Activity, 
  FolderOpen,
  Home,
  Plus,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  {
    title: 'الرئيسية',
    url: '/',
    icon: Home,
    id: 'home'
  },
  {
    title: 'إدارة البوت',
    url: '/bot-control',
    icon: Bot,
    id: 'bot-control'
  },
  {
    title: 'محرر الأكواد',
    url: '/code-editor',
    icon: FileText,
    id: 'code-editor'
  },
  {
    title: 'مدير الملفات',
    url: '/file-manager',
    icon: FolderOpen,
    id: 'file-manager'
  },
  {
    title: 'السجلات والتقارير',
    url: '/logs',
    icon: Activity,
    id: 'logs'
  },
  {
    title: 'الإعدادات',
    url: '/settings',
    icon: Settings,
    id: 'settings'
  },
];

interface AppSidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export default function AppSidebar({ activeItem = 'home', onItemClick }: AppSidebarProps) {
  const [botStatus] = useState(true); // todo: remove mock functionality

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">مركز تحكم البوتات</h2>
            <p className="text-sm text-muted-foreground">إدارة بوتات الديسكورد</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeItem === item.id}
                    onClick={() => onItemClick?.(item.id)}
                    data-testid={`sidebar-item-${item.id}`}
                  >
                    <button className="w-full">
                      <item.icon className="ml-2" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>البوتات النشطة</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${botStatus ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-sm">البوت الرئيسي</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {botStatus ? 'متصل' : 'غير متصل'}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="button-add-bot"
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة بوت جديد
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 ml-2" />
          تسجيل خروج
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}