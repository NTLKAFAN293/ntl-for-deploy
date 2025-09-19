import { useQuery } from "@tanstack/react-query";
import { Plus, Brain, Bot, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BotCard from "@/components/BotCard";
import FileUpload from "@/components/FileUpload";
import { Bot as BotType } from "@shared/schema";

export default function Dashboard() {
  const { data: bots = [], isLoading } = useQuery<BotType[]>({
    queryKey: ["/api/bots"],
  });

  const activeBots = bots.filter(bot => bot.isActive);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b-4 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hand-drawn">
                <Bot className="text-primary-foreground w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">إدارة البوتات</h1>
                <p className="text-sm text-muted-foreground">منصة لإدارة بوتات ديسكورد</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-secondary px-4 py-2 rounded-full hand-drawn-border">
                <Activity className="w-4 h-4 text-accent" />
                <span className="font-semibold text-secondary-foreground" data-testid="active-bots-count">
                  {activeBots.length} بوت نشط
                </span>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center border-3 border-primary hand-drawn">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-foreground">المطور</p>
                  <p className="text-sm text-muted-foreground">المستوى المتقدم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="bg-card rounded-2xl p-8 border-4 border-border hand-drawn-border shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0 text-right">
                <h2 className="text-3xl font-bold text-foreground mb-2">مرحباً بك! 🤖</h2>
                <p className="text-lg text-muted-foreground mb-4">جاهز لإدارة وتطوير بوتات ديسكورد الخاصة بك؟</p>
                <div className="flex items-center space-x-6 space-x-reverse justify-end">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-semibold text-foreground">
                      {bots.length} بوت إجمالي
                    </span>
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse adaptive-indicator">
                    <span className="font-semibold text-primary">مساعد ذكي متوفر</span>
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full progress-circle flex items-center justify-center mb-3" style={{"--progress": "216deg"} as any}>
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">{Math.round((activeBots.length / Math.max(bots.length, 1)) * 100)}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">البوتات النشطة</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">إجراءات سريعة</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/bot/new">
              <Card className="puzzle-card cursor-pointer hand-drawn-border" data-testid="create-new-bot">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto hand-drawn">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">إنشاء بوت جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">ابدأ في إنشاء بوت ديسكورد جديد من الصفر</p>
                </CardContent>
              </Card>
            </Link>

            <FileUpload onFileUploaded={(content) => {
              // Navigate to editor with uploaded content
              window.location.href = `/bot/new?code=${encodeURIComponent(content)}`;
            }}>
              <Card className="puzzle-card cursor-pointer hand-drawn-border" data-testid="upload-bot-file">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto hand-drawn">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">رفع ملف بوت</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">ارفع ملف JavaScript لبوت موجود</p>
                </CardContent>
              </Card>
            </FileUpload>

            <Link href="/projects">
              <Card className="puzzle-card cursor-pointer hand-drawn-border" data-testid="project-library">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto hand-drawn">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">مكتبة المشاريع</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">تصفح وحمل مشاريع بوتات جاهزة</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Bots Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">البوتات المتوفرة</h3>
            <span className="text-muted-foreground">{bots.length} بوت</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد بوتات حتى الآن</h3>
              <p className="text-muted-foreground mb-6">ابدأ بإنشاء أول بوت ديسكورد خاص بك</p>
              <Link href="/bot/new">
                <Button className="btn-primary" data-testid="create-first-bot">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء بوت جديد
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
