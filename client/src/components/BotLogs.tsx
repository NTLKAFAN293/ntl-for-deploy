import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Download, 
  Filter,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { BotLog } from '@shared/schema';

interface BotLogsProps {
  botId: string;
  onClearLogs?: () => void;
}

export default function BotLogs({ botId, onClearLogs }: BotLogsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'error' | 'warn' | 'debug'>('all');

  const { data: logs = [], refetch, isLoading } = useQuery({
    queryKey: ['/api/bots', botId, 'logs'],
    queryFn: () => apiClient.getBotLogs(botId, 200),
    enabled: !!botId,
    refetchInterval: autoRefresh ? 3000 : false, // Auto-refresh every 3 seconds
  });

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'debug': return <Bug className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const downloadLogs = () => {
    const logText = logs
      .map(log => `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-${botId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">سجلات البوت</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              data-testid="button-toggle-auto-refresh"
            >
              <RotateCcw className={`h-4 w-4 ml-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'إيقاف التحديث' : 'تحديث تلقائي'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={logs.length === 0}
              data-testid="button-download-logs"
            >
              <Download className="h-4 w-4 ml-1" />
              تحميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              data-testid="button-clear-logs"
            >
              مسح السجلات
            </Button>
          </div>
        </div>

        {/* Log level filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">المستوى:</span>
          {(['all', 'info', 'error', 'warn', 'debug'] as const).map((level) => (
            <Button
              key={level}
              variant={filter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(level)}
              className="h-7"
              data-testid={`button-filter-${level}`}
            >
              {level === 'all' ? 'الكل' : level}
              {level !== 'all' && logCounts[level] && (
                <Badge variant="secondary" className="mr-1 text-xs">
                  {logCounts[level]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">جاري تحميل السجلات...</div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-1 p-4">
              {filteredLogs.map((log, index) => (
                <div
                  key={`${log.id}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`log-entry-${log.id}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={getLogBadgeVariant(log.level)}
                        className="text-xs"
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm break-words">
                      {log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Info className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-muted-foreground">
                {filter === 'all' ? 'لا توجد سجلات' : `لا توجد سجلات من نوع ${filter}`}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}