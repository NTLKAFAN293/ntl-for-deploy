import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (content: string) => void;
  children?: React.ReactNode;
}

export default function FileUpload({ onFileUploaded, children }: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('botFile', file);
      
      const response = await fetch('/api/bots/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('فشل في رفع الملف');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onFileUploaded(data.content);
      toast({ title: "تم رفع الملف بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في رفع الملف", variant: "destructive" });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.js') && !file.name.endsWith('.ts')) {
      toast({ 
        title: "نوع ملف غير مدعوم", 
        description: "يرجى اختيار ملف JavaScript (.js) أو TypeScript (.ts)",
        variant: "destructive" 
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "الملف كبير جداً", 
        description: "يجب أن يكون حجم الملف أقل من 5 ميجابايت",
        variant: "destructive" 
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.ts"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input"
      />
      
      {children ? (
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          onClick={handleClick}
          disabled={uploadMutation.isPending}
          variant="outline"
          className="flex items-center space-x-2 space-x-reverse"
          data-testid="upload-file-button"
        >
          {uploadMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>رفع ملف بوت</span>
        </Button>
      )}
    </>
  );
}
