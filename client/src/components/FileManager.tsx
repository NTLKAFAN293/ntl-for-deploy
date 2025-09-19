import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Folder, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Edit,
  Plus,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  lastModified: string;
  extension?: string;
}

interface FileManagerProps {
  files: FileItem[];
  onFileUpload?: (files: FileList) => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, currentName: string) => void;
  onFileDownload?: (fileId: string) => void;
  onFileEdit?: (fileId: string) => void;
  onFolderCreate?: (name: string, language?: string) => void;
  onFileCreate?: (name: string, language: string) => void;
}

export default function FileManager({
  files = [],
  onFileUpload,
  onFileDelete,
  onFileRename,
  onFileDownload,
  onFileEdit,
  onFolderCreate,
  onFileCreate
}: FileManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="h-4 w-4 text-blue-500" />;

    switch (file.extension) {
      case 'js':
      case 'ts':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'py':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'json':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload?.(files);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">مدير الملفات</CardTitle>
          <Badge variant="secondary">{files.length} ملف</Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث في الملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search-files"
            />
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && onFileUpload?.(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            data-testid="button-upload-files"
          >
            <Upload className="h-4 w-4 ml-1" />
            رفع
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const fileName = prompt('اسم الملف:', 'new-file.js');
              if (fileName) {
                const extension = fileName.split('.').pop()?.toLowerCase() || 'js';
                const language = extension === 'py' ? 'python' : 
                              extension === 'json' ? 'json' : 'javascript';
                onFileCreate?.(fileName, language);
              }
            }}
            data-testid="button-create-file"
          >
            <Plus className="h-4 w-4 ml-1" />
            ملف جديد
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={`min-h-[300px] rounded-lg border-2 border-dashed transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filteredFiles.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 group"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.size && `${file.size} • `}{file.lastModified}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        data-testid={`button-file-menu-${file.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" side="left" sideOffset={5}>
                      <DropdownMenuItem 
                        onClick={() => onFileEdit?.(file.id)}
                        className="cursor-pointer"
                      >
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل المحتوى
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onFileRename?.(file.id, file.name)}
                        className="cursor-pointer"
                      >
                        <FileText className="ml-2 h-4 w-4" />
                        إعادة تسمية
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onFileDownload?.(file.id)}
                        className="cursor-pointer"
                      >
                        <Download className="ml-2 h-4 w-4" />
                        تحميل
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onFileDelete?.(file.id)}
                        className="cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">ارفع الملفات هنا</h4>
              <p className="text-muted-foreground mb-4">
                اسحب الملفات وأفلتها هنا أو انقر على زر الرفع
              </p>
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                data-testid="button-upload-files-empty"
              >
                <Upload className="h-4 w-4 ml-1" />
                اختيار الملفات
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}