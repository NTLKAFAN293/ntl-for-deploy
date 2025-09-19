
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Download, Star, Shield, Tag, Filter, Plus, Code, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@shared/projectSchema";

export default function ProjectLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "utility" as const,
    files: { "index.js": "" },
    author: "",
    tags: [] as string[]
  });
  
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", { 
      query: searchQuery || undefined, 
      category: selectedCategory === "all" ? undefined : selectedCategory, 
      verified: showVerifiedOnly || undefined 
    }],
  });

  const downloadMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/download`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('فشل في التحميل');
      return response.json();
    },
    onSuccess: (data, projectId) => {
      // إنشاء بوت جديد بالكود المحمل
      const mainFile = data.files["index.js"] || "";
      const project = projects.find(p => p.id === projectId);
      if (project) {
        window.location.href = `/bot/new?name=${encodeURIComponent(project.name)}&code=${encodeURIComponent(mainFile)}`;
      }
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof newProject) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في إنشاء المشروع');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewProject({
        name: "",
        description: "",
        category: "utility",
        files: { "index.js": "" },
        author: "",
        tags: []
      });
    }
  });

  const categories = [
    { value: "all", label: "جميع الفئات" },
    { value: "utility", label: "أدوات مساعدة" },
    { value: "moderation", label: "إدارة" },
    { value: "music", label: "موسيقى" },
    { value: "game", label: "ألعاب" },
    { value: "other", label: "أخرى" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b-4 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center hand-drawn">
                <Code className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">مكتبة المشاريع</h1>
                <p className="text-sm text-muted-foreground">مشاريع بوتات جاهزة للاستخدام</p>
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 ml-2" />
                  مشاركة مشروع
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>مشاركة مشروع جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم المشروع"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Textarea
                    placeholder="وصف المشروع"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Select value={newProject.category} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="اسم المؤلف"
                    value={newProject.author}
                    onChange={(e) => setNewProject(prev => ({ ...prev, author: e.target.value }))}
                  />
                  <Textarea
                    placeholder="كود البوت (index.js)"
                    value={newProject.files["index.js"]}
                    onChange={(e) => setNewProject(prev => ({ 
                      ...prev, 
                      files: { ...prev.files, "index.js": e.target.value }
                    }))}
                    rows={10}
                  />
                  <Button 
                    onClick={() => createProjectMutation.mutate(newProject)}
                    disabled={createProjectMutation.isPending}
                    className="w-full"
                  >
                    {createProjectMutation.isPending ? "جاري النشر..." : "نشر المشروع"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ابحث عن مشروع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showVerifiedOnly ? "default" : "outline"}
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className="md:w-auto"
            >
              <Shield className="w-4 h-4 ml-2" />
              موثق فقط
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="puzzle-card hand-drawn-border cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {project.verified && <Shield className="w-4 h-4 text-green-500" />}
                        {project.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span>{project.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{project.downloads}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{project.author}</span>
                      </div>
                      <Badge variant="secondary">{categories.find(c => c.value === project.category)?.label}</Badge>
                    </div>
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 ml-1" />
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{project.tags.length - 3}</Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedProject(project)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Code className="w-4 h-4 ml-2" />
                        عرض الكود
                      </Button>
                      
                      <Button
                        onClick={() => downloadMutation.mutate(project.id)}
                        disabled={downloadMutation.isPending}
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 ml-2" />
                        {downloadMutation.isPending ? "جاري..." : "استخدام"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Project Preview Modal */}
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedProject.verified && <Shield className="w-5 h-5 text-green-500" />}
                  {selectedProject.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedProject.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedProject.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedProject.rating.toFixed(1)} ({selectedProject.ratingCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{selectedProject.downloads} تحميل</span>
                  </div>
                </div>

                {selectedProject.tags && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        <Tag className="w-3 h-3 ml-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">الكود:</h4>
                  <pre className="text-sm overflow-x-auto bg-background p-3 rounded border">
                    <code>{selectedProject.files["index.js"]}</code>
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadMutation.mutate(selectedProject.id)}
                    disabled={downloadMutation.isPending}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    {downloadMutation.isPending ? "جاري التحميل..." : "استخدام في بوت جديد"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
