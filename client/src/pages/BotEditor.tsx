import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Play, Square, RotateCcw, Save, Brain, Plus, Trash2, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import { Bot } from "@shared/schema";

const defaultBotCode = `// بوت ديسكورد أساسي
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(\`تم تسجيل الدخول كـ \${readyClient.user.tag}!\`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
    
    if (message.content === '!hello') {
        message.reply('مرحباً! 👋');
    }
});`;

export default function BotEditor() {
  const [, params] = useRoute("/bot/:id");
  const { toast } = useToast();
  const [showAI, setShowAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    token: "",
    files: { "index.js": defaultBotCode } as Record<string, string>
  });
  
  const [selectedFile, setSelectedFile] = useState<string>("index.js");
  const [showCode, setShowCode] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const isNew = params?.id === "new";
  
  // Get bot data if editing existing bot
  const { data: bot, isLoading } = useQuery<Bot>({
    queryKey: ["/api/bots", params?.id],
    enabled: !isNew,
  });

  // Load URL params for new bot with uploaded code
  useEffect(() => {
    if (isNew) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        setFormData(prev => ({ 
          ...prev, 
          files: { "index.js": decodeURIComponent(code) }
        }));
      }
    }
  }, [isNew]);

  // Load bot data when editing
  useEffect(() => {
    if (bot) {
      const files = (bot.files as Record<string, string>) || { "index.js": defaultBotCode };
      setFormData({
        name: bot.name,
        description: bot.description || "",
        token: bot.token,
        files
      });
      // Set the first file as selected
      const firstFile = Object.keys(files)[0];
      if (firstFile) setSelectedFile(firstFile);
    }
  }, [bot]);

  // Save bot mutation
  const saveBotMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isNew ? `/api/bots` : `/api/bots/${params?.id}`;
      const method = isNew ? "POST" : "PATCH";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "نجح الحفظ",
        description: "تم حفظ البوت بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: () => {
      toast({
        title: "فشل الحفظ",
        description: "حدث خطأ أثناء حفظ البوت",
        variant: "destructive",
      });
    },
  });

  // Bot action mutations
  const startBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bots/${params?.id}/start`, { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "نجح", description: "تم تشغيل البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots", params?.id] });
    },
    onError: () => {
      toast({
        title: "فشل",
        description: "فشل في تشغيل البوت. تأكد من صحة الكود والتوكن",
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bots/${params?.id}/stop`, { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "نجح", description: "تم إيقاف البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots", params?.id] });
    },
    onError: () => {
      toast({
        title: "فشل",
        description: "فشل في إيقاف البوت",
        variant: "destructive",
      });
    },
  });

  const addFile = () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.endsWith('.js') ? newFileName : newFileName + '.js';
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileName]: "// ملف جديد"
      }
    }));
    setSelectedFile(fileName);
    setNewFileName("");
    setShowCode(true);
  };

  const deleteFile = (fileName: string) => {
    if (Object.keys(formData.files).length <= 1) {
      toast({
        title: "تحذير",
        description: "لا يمكن حذف الملف الوحيد",
        variant: "destructive",
      });
      return;
    }

    const newFiles = { ...formData.files };
    delete newFiles[fileName];
    
    setFormData(prev => ({ ...prev, files: newFiles }));
    
    // Select another file if the deleted one was selected
    if (selectedFile === fileName) {
      const remainingFiles = Object.keys(newFiles);
      if (remainingFiles.length > 0) {
        setSelectedFile(remainingFiles[0]);
      }
    }
  };

  const updateFileContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [selectedFile]: content
      }
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.token.trim()) {
      toast({
        title: "خطأ",
        description: "اسم البوت والتوكن مطلوبان",
        variant: "destructive",
      });
      return;
    }
    saveBotMutation.mutate(formData);
  };

  const handleAction = (action: "start" | "stop") => {
    if (action === "start") {
      startBotMutation.mutate();
    } else {
      stopBotMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <main className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? "بوت جديد" : "تحرير البوت"}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAI(!showAI)}
              variant={showAI ? "default" : "outline"}
              data-testid="button-toggle-ai"
            >
              <Brain className="h-4 w-4 ml-2" />
              المساعد الذكي
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bot Settings */}
          <div className="lg:col-span-1">
            <Card className="hand-drawn-border">
              <CardHeader>
                <CardTitle>إعدادات البوت</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم البوت</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم البوت"
                    data-testid="input-bot-name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف البوت"
                    data-testid="input-bot-description"
                  />
                </div>

                <div>
                  <Label htmlFor="token">توكن البوت</Label>
                  <Input
                    id="token"
                    value={formData.token}
                    onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="توكن ديسكورد"
                    type="password"
                    data-testid="input-bot-token"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveBotMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-bot"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {saveBotMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>

                {!isNew && bot && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">حالة البوت</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {bot.isActive ? "نشط" : "متوقف"}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {bot.isActive ? (
                        <Button
                          onClick={() => handleAction("stop")}
                          disabled={stopBotMutation.isPending}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          data-testid="button-stop-bot"
                        >
                          <Square className="h-4 w-4 ml-2" />
                          إيقاف
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAction("start")}
                          disabled={startBotMutation.isPending}
                          className="flex-1"
                          data-testid="button-start-bot"
                        >
                          <Play className="h-4 w-4 ml-2" />
                          تشغيل
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => {
                          stopBotMutation.mutate();
                          setTimeout(() => startBotMutation.mutate(), 1000);
                        }}
                        disabled={startBotMutation.isPending || stopBotMutation.isPending}
                        variant="outline"
                        size="sm"
                        data-testid="button-restart-bot"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* File Manager & Code Editor */}
          <div className={`${showAI ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {/* File Manager */}
            <Card className="hand-drawn-border mb-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>إدارة الملفات</span>
                  <Button
                    onClick={() => setShowCode(!showCode)}
                    variant="outline"
                    size="sm"
                    data-testid="button-toggle-code"
                  >
                    <FileText className="h-4 w-4 ml-2" />
                    {showCode ? "إخفاء الكود" : "إظهار الكود"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* File List */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(formData.files).map((fileName) => (
                    <div key={fileName} className="flex items-center">
                      <Button
                        onClick={() => {
                          setSelectedFile(fileName);
                          setShowCode(true);
                        }}
                        variant={selectedFile === fileName ? "default" : "outline"}
                        size="sm"
                        className="rounded-r-none"
                        data-testid={`button-file-${fileName}`}
                      >
                        {fileName}
                      </Button>
                      {Object.keys(formData.files).length > 1 && (
                        <Button
                          onClick={() => deleteFile(fileName)}
                          variant="destructive"
                          size="sm"
                          className="rounded-l-none px-2"
                          data-testid={`button-delete-${fileName}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New File */}
                <div className="flex gap-2">
                  <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="اسم الملف الجديد (مثل: commands.js)"
                    data-testid="input-new-filename"
                  />
                  <Button onClick={addFile} size="sm" data-testid="button-add-file">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة ملف
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            {showCode && (
              <Card className="hand-drawn-border h-[500px]">
                <CardHeader>
                  <CardTitle>محرر الكود - {selectedFile}</CardTitle>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <CodeEditor
                    value={formData.files[selectedFile] || ""}
                    onChange={updateFileContent}
                    language="javascript"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Assistant */}
          {showAI && (
            <div className="lg:col-span-1">
              <AIAssistant
                currentCode={formData.files[selectedFile] || ""}
                onCodeUpdate={updateFileContent}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}