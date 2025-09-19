import { useState } from 'react';
import FileManager from '../FileManager';

export default function FileManagerExample() {
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'index.js',
      type: 'file' as const,
      size: '2.3 KB',
      lastModified: 'منذ ساعتين',
      extension: 'js',
    },
    {
      id: '2',
      name: 'config.json',
      type: 'file' as const,
      size: '892 B',
      lastModified: 'منذ 30 دقيقة',
      extension: 'json',
    },
    {
      id: '3',
      name: 'commands',
      type: 'folder' as const,
      lastModified: 'منذ يوم واحد',
    },
    {
      id: '4',
      name: 'bot.py',
      type: 'file' as const,
      size: '4.1 KB',
      lastModified: 'منذ 3 أيام',
      extension: 'py',
    },
  ]);

  const handleFileUpload = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file, index) => ({
      id: (Date.now() + index).toString(),
      name: file.name,
      type: 'file' as const,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      lastModified: 'الآن',
      extension: file.name.split('.').pop() || '',
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    console.log('تم رفع الملفات:', newFiles.map(f => f.name));
  };

  const handleFileDelete = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    console.log('تم حذف الملف:', file?.name);
  };

  const handleFileRename = (fileId: string, currentName: string) => {
    const newName = prompt('الاسم الجديد:', currentName);
    if (newName && newName !== currentName) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, name: newName } : f
      ));
      console.log('تم تغيير الاسم إلى:', newName);
    }
  };

  const handleFolderCreate = (name: string) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      type: 'folder' as const,
      lastModified: 'الآن',
    };
    setFiles(prev => [...prev, newFolder]);
    console.log('تم إنشاء مجلد:', name);
  };

  return (
    <FileManager
      files={files}
      onFileUpload={handleFileUpload}
      onFileDelete={handleFileDelete}
      onFileRename={handleFileRename}
      onFileDownload={(fileId) => {
        const file = files.find(f => f.id === fileId);
        console.log('تحميل الملف:', file?.name);
      }}
      onFolderCreate={handleFolderCreate}
    />
  );
}