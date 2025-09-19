import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BotControlPanel from '@/components/BotControlPanel';
import BotStatusCard from '@/components/BotStatusCard';
import CodeEditor from '@/components/CodeEditor';
import FileManager from '@/components/FileManager';
import BotLogs from '@/components/BotLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, MessageCircle, Server } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import type { BotFile } from '@shared/schema';

export default function Home() {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch bots
  const { data: bots = [], isLoading: botsLoading } = useQuery({
    queryKey: ['/api/bots'],
    queryFn: () => apiClient.getBots(),
  });

  // Set first bot as selected by default
  useEffect(() => {
    if (bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  const selectedBot = bots.find(bot => bot.id === selectedBotId) || bots[0];

  // Fetch files for selected bot
  const { data: files = [], isLoading: filesLoading } = useQuery<BotFile[]>({
    queryKey: ['/api/bots', selectedBotId, 'files'],
    queryFn: () => apiClient.getBotFiles(selectedBotId),
    enabled: !!selectedBotId,
  });

  // Bot control mutations
  const startBotMutation = useMutation({
    mutationFn: (botId: string) => apiClient.startBot(botId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({ title: 'تم تشغيل البوت بنجاح' });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في تشغيل البوت',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: (botId: string) => apiClient.stopBot(botId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({ title: 'تم إيقاف البوت بنجاح' });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في إيقاف البوت',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const updateTokenMutation = useMutation({
    mutationFn: ({ botId, token }: { botId: string; token: string }) =>
      apiClient.updateBotToken(botId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      toast({ title: 'تم تحديث التوكن بنجاح' });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في تحديث التوكن',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // File mutations
  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, content, isDirty }: { fileId: string; content: string; isDirty?: boolean }) =>
      apiClient.updateBotFile(fileId, { content, isDirty }),
    onSuccess: (updatedFile) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBotId, 'files'] });
      toast({ title: 'تم حفظ الملف بنجاح' });
    },
    onError: (error) => {
      console.error('Error updating file:', error);
      toast({
        title: 'خطأ في حفظ الملف',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => apiClient.deleteBotFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBotId, 'files'] });
      toast({ title: 'تم حذف الملف بنجاح' });
      setSelectedFileId(null); // Deselect file after deletion
    },
    onError: (error) => {
      toast({
        title: 'خطأ في حذف الملف',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: ({ botId, name, language }: { botId: string; name: string; language: string }) =>
      apiClient.createBotFile(botId, { name, language, content: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBotId, 'files'] });
      toast({ title: 'تم إنشاء الملف بنجاح' });
    },
    onError: (error) => {
      console.error('Error creating file:', error);
      toast({
        title: 'خطأ في إنشاء الملف',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleFileCreate = (name: string, language: string) => {
    if (!selectedBotId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار بوت أولاً',
        variant: 'destructive'
      });
      return;
    }

    createFileMutation.mutate({ botId: selectedBotId, name, language });
  };

  const clearLogsMutation = useMutation({
    mutationFn: (botId: string) => apiClient.clearBotLogs(botId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBotId, 'logs'] });
      toast({ title: 'تم مسح السجلات بنجاح' });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في مسح السجلات',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Socket.IO for real-time updates
  useSocket({
    botStatusChanged: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      const statusText = data.isOnline ? 'متصل' : 'غير متصل';
      toast({
        title: `تغيرت حالة البوت`,
        description: `البوت الآن ${statusText}`
      });
    },
  });

  // Transform files for CodeEditor component
  const editorFiles: BotFile[] = files.map(file => ({
    ...file,
    isDirty: false, // Reset dirty state since we're fetching from server
  }));

  // Mock stats for now - todo: replace with real data
  const mockStats = [
    {
      title: 'إجمالي البوتات',
      value: bots.length.toString(),
      change: '+1 هذا الأسبوع',
      icon: Activity,
    },
    {
      title: 'الخوادم المتصلة',
      value: '23',
      change: '+5 هذا الشهر',
      icon: Server,
    },
    {
      title: 'المستخدمين النشطين',
      value: '1,670',
      change: '+12% من الشهر الماضي',
      icon: Users,
    },
    {
      title: 'الرسائل المعالجة',
      value: '9,672',
      change: '+8% من الأمس',
      icon: MessageCircle,
    },
  ];

  if (botsLoading) {
    return <div className="flex items-center justify-center h-64">جاري التحميل...</div>;
  }

  if (!selectedBot) {
    return <div className="text-center py-8">لا توجد بوتات متاحة</div>;
  }

  const formatUptime = (startedAt: string | null) => {
    if (!startedAt) return "00:00:00";
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">مرحباً بك في مركز تحكم البوتات</h1>
        <p className="text-muted-foreground">
          إدارة بوتات الديسكورد الخاصة بك بسهولة ومرونة
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bot Control */}
        <div className="space-y-4">
          <BotControlPanel
            botName={selectedBot.name}
            isOnline={selectedBot.isOnline}
            onStartBot={() => startBotMutation.mutate(selectedBot.id)}
            onStopBot={() => stopBotMutation.mutate(selectedBot.id)}
            onTokenChange={(token) => updateTokenMutation.mutate({ botId: selectedBot.id, token })}
          />

          <BotStatusCard
            botName={selectedBot.name}
            isOnline={selectedBot.isOnline}
            uptime={formatUptime(selectedBot.startedAt)}
            serversCount={23} // todo: get real data
            usersCount={1670} // todo: get real data
            messagesCount={9672} // todo: get real data
            lastActivity={selectedBot.isOnline ? "منذ دقيقة واحدة" : "منذ ساعتين"} // todo: get real data
          />
        </div>

        {/* Code Editor */}
        {filesLoading ? (
          <div className="flex items-center justify-center h-64">جاري تحميل الملفات...</div>
        ) : (
          files.length > 0 && (
            <CodeEditor
              files={files.map(f => ({
                id: f.id,
                name: f.name,
                content: f.content || '',
                language: f.language as 'javascript' | 'python' | 'json',
                isDirty: f.isDirty || false
              }))}
              onFileChange={(fileId, content) => {
                // Just mark file as dirty locally - don't save on every keystroke
                console.log('File content changed:', fileId, content.substring(0, 50));

                // Use debounced update to mark as dirty without excessive API calls
                const timeoutId = setTimeout(() => {
                  updateFileMutation.mutate({
                    fileId,
                    content,
                    isDirty: true
                  });
                }, 1000); // Wait 1 second before marking as dirty

                // Clean up timeout on next change
                return () => clearTimeout(timeoutId);
              }}
              onSave={(fileId, content) => {
                // Save the file with the current content and mark as not dirty
                updateFileMutation.mutate({
                  fileId,
                  content,
                  isDirty: false
                });
              }}
              onFileCreate={handleFileCreate}
              onFileDelete={(fileId) => deleteFileMutation.mutate(fileId)}
            />
          )
        )}
      </div>

      {/* File Manager */}
      <FileManager
        files={files.map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size || 'غير محدد',
          lastModified: file.lastModified ?
            new Date(file.lastModified).toLocaleString('ar-SA') :
            'غير محدد',
          extension: file.language === 'javascript' ? 'js' :
                    file.language === 'python' ? 'py' :
                    file.language === 'json' ? 'json' : 'txt',
        }))}
        onFileUpload={(fileList) => {
          // todo: implement file upload
          Array.from(fileList).forEach(file => {
            console.log('رفع ملف:', file.name);
            // For now, create a new file with the uploaded content
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result as string;
              const extension = file.name.split('.').pop()?.toLowerCase();
              const language = extension === 'py' ? 'python' : 
                              extension === 'json' ? 'json' : 'javascript';

              createFileMutation.mutate({ 
                botId: selectedBotId, 
                name: file.name, 
                language: language as 'javascript' | 'python' | 'json'
              });
            };
            reader.readAsText(file);
          });
        }}
        onFileDelete={(fileId) => deleteFileMutation.mutate(fileId)}
        onFileEdit={(fileId) => {
          const file = files.find(f => f.id === fileId);
          if (file) {
            setSelectedFileId(fileId);
          }
        }}
        onFileRename={(fileId, currentName) => {
          const newName = prompt('الاسم الجديد:', currentName);
          if (newName && newName !== currentName) {
            console.log('Renaming file:', fileId, 'to:', newName);
            // TODO: Implement actual rename API call
          }
        }}
        onFileDownload={(fileId) => {
          const file = files.find(f => f.id === fileId);
          if (file) {
            const blob = new Blob([file.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onFolderCreate={(name) => {
          // todo: implement folder creation
          console.log('إنشاء مجلد:', name);
        }}
      />

      {/* Bot Logs */}
      <BotLogs
        botId={selectedBotId}
        onClearLogs={() => clearLogsMutation.mutate(selectedBotId)}
      />
    </div>
  );
}