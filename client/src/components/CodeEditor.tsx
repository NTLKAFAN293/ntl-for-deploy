import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, X, FileText, Settings } from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: 'javascript' | 'python' | 'json';
  isDirty: boolean;
}

interface CodeEditorProps {
  files?: CodeFile[];
  onFileChange?: (fileId: string, content: string) => void;
  onFileCreate?: (name: string, language: 'javascript' | 'python' | 'json') => void;
  onFileDelete?: (fileId: string) => void;
  onSave?: (fileId: string, content: string) => void;
}

export default function CodeEditor({ 
  files = [],
  onFileChange,
  onFileCreate,
  onFileDelete,
  onSave
}: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState(files[0]?.id || '');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [localContent, setLocalContent] = useState<{[key: string]: string}>({});

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'javascript': return '🟨';
      case 'python': return '🐍';
      case 'json': return '📄';
      default: return '📝';
    }
  };

  const handleContentChange = (content: string) => {
    if (activeTab) {
      // Update local content immediately
      setLocalContent(prev => ({
        ...prev,
        [activeTab]: content
      }));
      
      // Notify parent component about the change
      onFileChange?.(activeTab, content);
    }
  };

  const handleSave = () => {
    if (activeTab && localContent[activeTab] !== undefined) {
      onSave?.(activeTab, localContent[activeTab]);
      console.log('تم حفظ الملف');
    } else if (activeTab) {
      const currentFile = files.find(f => f.id === activeTab);
      if (currentFile) {
        onSave?.(activeTab, currentFile.content);
      }
    }
  };

  // Get current content (local or from file)
  const getCurrentContent = (fileId: string) => {
    if (localContent[fileId] !== undefined) {
      return localContent[fileId];
    }
    const file = files.find(f => f.id === fileId);
    return file?.content || '';
  };

  const activeFile = files.find(f => f.id === activeTab);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">محرر الأكواد</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFileDialog(true)}
              data-testid="button-new-file"
            >
              <Plus className="h-4 w-4 ml-1" />
              ملف جديد
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!activeFile?.isDirty}
              data-testid="button-save-file"
            >
              <Save className="h-4 w-4 ml-1" />
              حفظ
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {files.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-background">
              {files.map((file) => (
                <TabsTrigger 
                  key={file.id} 
                  value={file.id}
                  className="relative group"
                  data-testid={`tab-file-${file.id}`}
                >
                  <span className="ml-2">{getLanguageIcon(file.language)}</span>
                  {file.name}
                  {file.isDirty && <span className="text-blue-500 mr-1">●</span>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 mr-1 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileDelete?.(file.id);
                    }}
                    data-testid={`button-close-file-${file.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TabsTrigger>
              ))}
            </TabsList>

            {files.map((file) => (
              <TabsContent key={file.id} value={file.id} className="flex-1 p-4">
                <Textarea
                  value={getCurrentContent(file.id)}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="اكتب الكود هنا..."
                  className="min-h-[400px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
                  dir="ltr"
                  data-testid={`textarea-code-${file.id}`}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h4 className="text-lg font-medium">لا توجد ملفات</h4>
                <p className="text-muted-foreground">ابدأ بإنشاء ملف جديد لكتابة الكود</p>
              </div>
              <Button 
                onClick={() => setShowNewFileDialog(true)}
                data-testid="button-create-first-file"
              >
                <Plus className="h-4 w-4 ml-1" />
                إنشاء ملف جديد
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}