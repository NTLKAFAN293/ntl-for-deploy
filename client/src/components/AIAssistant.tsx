import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Brain, Code, FileSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  codeSnippet?: string;
}

interface AIAssistantProps {
  currentCode: string;
  onCodeUpdate: (code: string) => void;
}

export default function AIAssistant({ currentCode, onCodeUpdate }: AIAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        currentCode,
        chatHistory: messages.slice(-10)
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        codeSnippet: data.codeSnippet
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({ title: "فشل في الحصول على الرد", variant: "destructive" });
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/ai/generate", { description });
      return response.json();
    },
    onSuccess: (data) => {
      onCodeUpdate(data.code);
      toast({ title: "تم توليد الكود بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في توليد الكود", variant: "destructive" });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/review", { code: currentCode });
      return response.json();
    },
    onSuccess: (data) => {
      const reviewMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        codeSnippet: data.codeSnippet
      };
      setMessages(prev => [...prev, reviewMessage]);
    },
    onError: () => {
      toast({ title: "فشل في مراجعة الكود", variant: "destructive" });
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleApplyCode = (code: string) => {
    onCodeUpdate(code);
    toast({ title: "تم تطبيق الكود" });
  };

  return (
    <Card className="hand-drawn-border h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Brain className="w-5 h-5 text-primary" />
          <span>المساعد الذكي</span>
        </CardTitle>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateMutation.mutate("بوت ديسكورد بسيط يرد على الرسائل")}
            disabled={generateMutation.isPending}
            data-testid="generate-basic-bot"
          >
            <Code className="w-3 h-3 ml-1" />
            إنشاء بوت أساسي
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending || !currentCode.trim()}
            data-testid="review-code"
          >
            <FileSearch className="w-3 h-3 ml-1" />
            مراجعة الكود
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages */}
        <ScrollArea className="flex-1 h-0" data-testid="ai-chat-messages">
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">اسأل المساعد الذكي عن أي شيء متعلق ببرمجة البوتات</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.suggestions && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-semibold">اقتراحات:</p>
                        {message.suggestions.map((suggestion, i) => (
                          <Badge key={i} variant="secondary" className="text-xs block mb-1">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {message.codeSnippet && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApplyCode(message.codeSnippet!)}
                          className="text-xs"
                          data-testid={`apply-code-${index}`}
                        >
                          <Sparkles className="w-3 h-3 ml-1" />
                          تطبيق الكود
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex space-x-2 space-x-reverse">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن البرمجة، طلب المساعدة في إصلاح خطأ، أو أي شيء آخر..."
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            data-testid="ai-chat-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatMutation.isPending}
            size="sm"
            data-testid="send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
