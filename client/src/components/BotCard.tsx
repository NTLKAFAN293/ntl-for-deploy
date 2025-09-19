import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Play, Square, RotateCcw, Edit, Trash2, Bot } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot as BotType } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BotCardProps {
  bot: BotType;
}

export default function BotCard({ bot }: BotCardProps) {
  const { toast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/start`),
    onSuccess: () => {
      toast({ title: "تم تشغيل البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: () => {
      toast({ title: "فشل في تشغيل البوت", variant: "destructive" });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/stop`),
    onSuccess: () => {
      toast({ title: "تم إيقاف البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: () => {
      toast({ title: "فشل في إيقاف البوت", variant: "destructive" });
    }
  });

  const restartMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/restart`),
    onSuccess: () => {
      toast({ title: "تم إعادة تشغيل البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: () => {
      toast({ title: "فشل في إعادة تشغيل البوت", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/bots/${bot.id}`),
    onSuccess: () => {
      toast({ title: "تم حذف البوت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: () => {
      toast({ title: "فشل في حذف البوت", variant: "destructive" });
    }
  });

  return (
    <Card className="puzzle-card hand-drawn-border" data-testid={`bot-card-${bot.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center hand-drawn">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-right">
              <CardTitle className="text-lg" data-testid={`bot-name-${bot.id}`}>{bot.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{bot.description || "لا يوجد وصف"}</p>
            </div>
          </div>
          <Badge 
            variant={bot.isActive ? "default" : "secondary"}
            className={bot.isActive ? "bg-green-500 hover:bg-green-600" : ""}
            data-testid={`bot-status-${bot.id}`}
          >
            {bot.isActive ? "نشط" : "متوقف"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            {bot.isActive ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                  data-testid={`stop-bot-${bot.id}`}
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restartMutation.mutate()}
                  disabled={restartMutation.isPending}
                  data-testid={`restart-bot-${bot.id}`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="btn-primary"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                data-testid={`start-bot-${bot.id}`}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Link href={`/bot/${bot.id}`}>
              <Button size="sm" variant="outline" data-testid={`edit-bot-${bot.id}`}>
                <Edit className="w-4 h-4" />
              </Button>
            </Link>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" data-testid={`delete-bot-${bot.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف البوت "{bot.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteMutation.mutate();
                      setIsDeleteOpen(false);
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>تاريخ الإنشاء: {new Date(bot.createdAt!).toLocaleDateString('ar-SA')}</p>
          {bot.updatedAt && (
            <p>آخر تحديث: {new Date(bot.updatedAt).toLocaleDateString('ar-SA')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
