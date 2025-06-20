import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, moduleAPI, lessonAPI, fileAPI } from '@/lib/api';
import FileUploadComponent from '@/components/FileUpload/FileUploadComponent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Video,
  Upload,
  Save,
  X,
  BookOpen,
  PlayCircle,
  Clock,
  Users,
} from 'lucide-react';

const CourseContentManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order_index: 0
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    video_url: '',
    duration: '',
    is_free: false,
    attachments: []
  });

  // Fetch course and modules
  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseResponse, modulesResponse] = await Promise.all([
        courseAPI.getCourse(courseId),
        moduleAPI.getModules(courseId)
      ]);

      if (courseResponse.data.success) {
        setCourse(courseResponse.data.data);
      }

      if (modulesResponse.data.success) {
        setModules(modulesResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // Module handlers
  const handleCreateModule = async () => {
    try {
      const moduleData = {
        ...moduleForm,
        course_id: courseId,
        order_index: modules.length
      };

      const response = await moduleAPI.createModule(moduleData);
      if (response.data.success) {
        toast.success('Module created successfully');
        setModules([...modules, response.data.data]);
        setModuleForm({ title: '', description: '', order_index: 0 });
        setIsAddingModule(false);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    }
  };

  const handleUpdateModule = async () => {
    try {
      const response = await moduleAPI.updateModule(editingModule.id, moduleForm);
      if (response.data.success) {
        toast.success('Module updated successfully');
        setModules(modules.map(m => m.id === editingModule.id ? response.data.data : m));
        setEditingModule(null);
        setModuleForm({ title: '', description: '', order_index: 0 });
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons in this module.')) {
      return;
    }

    try {
      const response = await moduleAPI.deleteModule(moduleId);
      if (response.data.success) {
        toast.success('Module deleted successfully');
        setModules(modules.filter(m => m.id !== moduleId));
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  // Lesson handlers
  const handleCreateLesson = async () => {
    try {
      const lessonData = {
        ...lessonForm,
        module_id: selectedModuleId
      };

      const response = await lessonAPI.createLesson(lessonData);
      if (response.data.success) {
        toast.success('Lesson created successfully');
        // Refresh modules to get updated lessons
        fetchCourseData();
        setLessonForm({
          title: '',
          content: '',
          video_url: '',
          duration: '',
          is_free: false,
          attachments: []
        });
        setIsAddingLesson(false);
        setSelectedModuleId(null);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    }
  };

  const handleUpdateLesson = async () => {
    try {
      const response = await lessonAPI.updateLesson(editingLesson.id, lessonForm);
      if (response.data.success) {
        toast.success('Lesson updated successfully');
        fetchCourseData();
        setEditingLesson(null);
        setLessonForm({
          title: '',
          content: '',
          video_url: '',
          duration: '',
          is_free: false,
          attachments: []
        });
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await lessonAPI.deleteLesson(lessonId);
      if (response.data.success) {
        toast.success('Lesson deleted successfully');
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  // File upload handlers
  const handleFileUploadSuccess = (uploadedFiles) => {
    // Handle both single file (object) and multiple files (array) responses
    const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
    
    const newAttachments = filesArray.map(file => ({
      name: file.fileName || file.originalName || file.name,
      url: file.fileUrl || file.url,
      type: file.fileType || file.mimeType || file.type,
      size: file.fileSize || file.size
    }));
    
    setLessonForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    
    toast.success(`${filesArray.length} file(s) uploaded successfully`);
  };

  const handleFileUploadError = (error) => {
    console.error('File upload error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to upload file(s)';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Show specific error for file size issues
    if (errorMessage.includes('File size too large')) {
      toast.error('File is too large. Maximum file size is 10MB. Please compress your file or upgrade your Cloudinary plan.');
    } else if (errorMessage.includes('CLOUDINARY_NOT_CONFIGURED')) {
      toast.error('File upload service is not configured. Please contact administrator.');
    } else {
      toast.error(errorMessage);
    }
  };

  const removeAttachment = (index) => {
    setLessonForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course?.title}</h1>
          <p className="text-muted-foreground mt-2">Manage your course content</p>
        </div>
        <Button onClick={() => navigate('/instructor')} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-2xl font-bold">
                  {modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{course?.enrollment_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Module Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                Organize your course content into modules and lessons
              </CardDescription>
            </div>
            <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Module</DialogTitle>
                  <DialogDescription>
                    Create a new module to organize your lessons
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="module-title">Module Title</Label>
                    <Input
                      id="module-title"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter module title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-description">Description</Label>
                    <Textarea
                      id="module-description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter module description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateModule} disabled={!moduleForm.title.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Module
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first module to organize your course content
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons?.length || 0} lessons
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingModule(module);
                            setModuleForm({
                              title: module.title,
                              description: module.description || '',
                              order_index: module.order_index || 0
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </div>
                        <div
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {module.description && (
                        <p className="text-muted-foreground">{module.description}</p>
                      )}
                      
                      {/* Lessons */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Lessons</h4>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setIsAddingLesson(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                        
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-primary/10 p-1.5 rounded">
                                    {lesson.video_url ? (
                                      <Video className="h-4 w-4 text-primary" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{lesson.title}</p>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      {lesson.duration && (
                                        <span className="flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {lesson.duration}
                                        </span>
                                      )}
                                      {lesson.is_free && (
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                          Free
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingLesson(lesson);
                                      setLessonForm({
                                        title: lesson.title,
                                        content: lesson.content || '',
                                        video_url: lesson.video_url || '',
                                        duration: lesson.duration || '',
                                        is_free: lesson.is_free || false,
                                        attachments: lesson.attachments || []
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <PlayCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No lessons in this module yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update module information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-module-title">Module Title</Label>
              <Input
                id="edit-module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter module title"
              />
            </div>
            <div>
              <Label htmlFor="edit-module-description">Description</Label>
              <Textarea
                id="edit-module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingModule(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateModule} disabled={!moduleForm.title.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Update Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Lesson Dialog */}
      <Dialog open={isAddingLesson || !!editingLesson} onOpenChange={() => {
        setIsAddingLesson(false);
        setEditingLesson(null);
        setSelectedModuleId(null);
        setLessonForm({
          title: '',
          content: '',
          video_url: '',
          duration: '',
          is_free: false,
          attachments: []
        });
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update lesson information' : 'Create a new lesson with content and attachments'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                />
              </div>
              <div>
                <Label htmlFor="lesson-duration">Duration (optional)</Label>
                <Input
                  id="lesson-duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 15 minutes"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="lesson-content">Lesson Content</Label>
              <Textarea
                id="lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter lesson content, instructions, or description"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="lesson-video">Video URL (optional)</Label>
              <Input
                id="lesson-video"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lesson-free"
                checked={lessonForm.is_free}
                onChange={(e) => setLessonForm(prev => ({ ...prev, is_free: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="lesson-free">Make this lesson free for preview</Label>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <Label>Lesson Attachments</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload any files for this lesson (documents, videos, images, etc.)
                </p>
                <FileUploadComponent
              multiple={true}
              maxFileSize={10 * 1024 * 1024} // 10MB limit to match Cloudinary free plan
              onUploadSuccess={handleFileUploadSuccess}
              onUploadError={handleFileUploadError}
              acceptedTypes={[]} // Accept all file types
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                />
              </div>
              
              {/* Display current attachments */}
              {lessonForm.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Attachments</Label>
                  <div className="space-y-2">
                    {lessonForm.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddingLesson(false);
                setEditingLesson(null);
                setSelectedModuleId(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={editingLesson ? handleUpdateLesson : handleCreateLesson} 
                disabled={!lessonForm.title.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseContentManager;