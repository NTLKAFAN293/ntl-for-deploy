import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  MessageCircle, 
  Clock,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

interface BotStatusCardProps {
  botName?: string;
  isOnline?: boolean;
  uptime?: string;
  serversCount?: number;
  usersCount?: number;
  messagesCount?: number;
  lastActivity?: string;
  onViewLogs?: () => void;
  onOpenSettings?: () => void;
}

export default function BotStatusCard({
  botName = "البوت الخاص بي",
  isOnline = false,
  uptime = "00:00:00",
  serversCount = 0,
  usersCount = 0,
  messagesCount = 0,
  lastActivity = "غير متاح",
  onViewLogs,
  onOpenSettings
}: BotStatusCardProps) {
  const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-500';
  const statusText = isOnline ? 'متصل' : 'غير متصل';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{botName}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className={`${isOnline 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${statusColor} ml-1`} />
            {statusText}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onOpenSettings}
            data-testid="button-bot-settings"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isOnline && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">مدة التشغيل</div>
                <div className="text-muted-foreground" dir="ltr">{uptime}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">آخر نشاط</div>
                <div className="text-muted-foreground">{lastActivity}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500 ml-1" />
            </div>
            <div className="text-xl font-bold" data-testid="text-servers-count">{serversCount}</div>
            <div className="text-xs text-muted-foreground">خادم</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Users className="h-4 w-4 text-green-500 ml-1" />
            </div>
            <div className="text-xl font-bold" data-testid="text-users-count">{usersCount}</div>
            <div className="text-xs text-muted-foreground">مستخدم</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-purple-500 ml-1" />
            </div>
            <div className="text-xl font-bold" data-testid="text-messages-count">{messagesCount}</div>
            <div className="text-xs text-muted-foreground">رسالة</div>
          </div>
        </div>

        {onViewLogs && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onViewLogs}
            data-testid="button-view-logs"
          >
            <ExternalLink className="h-4 w-4 ml-1" />
            عرض السجلات
          </Button>
        )}
      </CardContent>
    </Card>
  );
}