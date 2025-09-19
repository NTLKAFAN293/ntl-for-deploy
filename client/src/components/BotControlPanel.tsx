import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Eye, EyeOff } from 'lucide-react';

interface BotControlPanelProps {
  botName?: string;
  isOnline?: boolean;
  onStartBot?: () => void;
  onStopBot?: () => void;
  onTokenChange?: (token: string) => void;
}

export default function BotControlPanel({ 
  botName = "البوت الخاص بي", 
  isOnline = false,
  onStartBot,
  onStopBot,
  onTokenChange 
}: BotControlPanelProps) {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!token.trim()) {
      console.log('يرجى إدخال التوكن أولاً');
      return;
    }
    setLoading(true);
    console.log('بدء تشغيل البوت...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // محاكاة التحميل
    onStartBot?.();
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    console.log('إيقاف البوت...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    onStopBot?.();
    setLoading(false);
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    onTokenChange?.(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{botName}</CardTitle>
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className={`${isOnline 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isOnline ? 'متصل' : 'غير متصل'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bot-token">توكن البوت</Label>
          <div className="relative">
            <Input
              id="bot-token"
              type={showToken ? "text" : "password"}
              placeholder="أدخل توكن الديسكورد هنا..."
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="pr-10"
              dir="ltr"
              data-testid="input-bot-token"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setShowToken(!showToken)}
              data-testid="button-toggle-token-visibility"
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          {!isOnline ? (
            <Button 
              onClick={handleStart} 
              disabled={loading || !token.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-start-bot"
            >
              <Play className="ml-2 h-4 w-4" />
              {loading ? 'جاري التشغيل...' : 'تشغيل البوت'}
            </Button>
          ) : (
            <Button 
              onClick={handleStop} 
              disabled={loading}
              variant="destructive"
              className="flex-1"
              data-testid="button-stop-bot"
            >
              <Square className="ml-2 h-4 w-4" />
              {loading ? 'جاري الإيقاف...' : 'إيقاف البوت'}
            </Button>
          )}
        </div>

        {isOnline && (
          <div className="text-sm text-muted-foreground">
            ✅ البوت يعمل بشكل طبيعي
          </div>
        )}
      </CardContent>
    </Card>
  );
}