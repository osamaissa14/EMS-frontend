import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Settings,
  Maximize,
  CheckCircle,
  Circle,
  FileText,
  Download,
  MessageSquare,
  Clock,
  BookOpen,
} from "lucide-react";
import { useCourse, useLessonsByCourse, useAssignments } from "@/hooks/useApi";

const CoursePlayer = () => {
  const { id: courseId } = useParams();
  
  const { data: courseData, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useLessonsByCourse(courseId);
  const { data: assignmentsData, isLoading: assignmentsLoading, error: assignmentsError } = useAssignments(courseId);

  const course = courseData?.data || {};
  const lessons = Array.isArray(lessonsData?.data) ? lessonsData.data : [];
  const assignments = Array.isArray(assignmentsData?.data) ? assignmentsData.data : [];

  // Calculate progress based on completed lessons
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  
  // Find current lesson
  const currentLesson = lessons.find(lesson => lesson.current) || lessons[0];
  const currentLessonIndex = lessons.findIndex(lesson => lesson.current) + 1;

  const isLoading = courseLoading || lessonsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle errors
  if (courseError) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{course.title || 'Course Title'}</h1>
              <p className="text-muted-foreground">
                by {course.instructor_name || 'Instructor'}
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  Lesson {currentLessonIndex} of{" "}
                  {lessons.length}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Progress: {progress}%</span>
                </div>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                {/* Video Player Mockup */}
                <div className="aspect-video bg-black relative rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center space-y-4">
                      <div className="text-6xl">▶️</div>
                      <h3 className="text-xl font-semibold">
                        {currentLesson?.title || 'No lesson selected'}
                      </h3>
                      <p className="text-gray-300">Click to play video</p>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-white text-sm">
                          <span>12:30</span>
                          <span>/</span>
                          <span>25:10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={50} className="h-1 bg-white/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="discussions">Discussions</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Lesson Overview
                      </h3>
                      <p className="text-muted-foreground">
                        In this lesson, we'll explore custom hooks and how they
                        can improve performance in React applications. We'll
                        cover best practices for creating reusable logic and
                        optimizing component re-renders.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">
                        Learning Objectives
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Create custom hooks for state management</li>
                        <li>• Implement performance optimizations</li>
                        <li>• Use React DevTools for profiling</li>
                        <li>• Apply memoization techniques</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">
                              Custom Hooks Cheat Sheet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF • 2.1 MB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Code Examples</p>
                            <p className="text-sm text-muted-foreground">
                              ZIP • 856 KB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="discussions" className="p-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">
                        Join the Discussion
                      </h3>
                      <p className="text-muted-foreground">
                        Connect with fellow students and ask questions about
                        this lesson.
                      </p>
                      <Button className="mt-4">Start Discussion</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="p-6 space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {assignment.due}
                          </p>
                        </div>
                        <Button
                          variant={assignment.submitted ? "outline" : "default"}
                        >
                          {assignment.submitted
                            ? "View Submission"
                            : "Submit Assignment"}
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Content
                </CardTitle>
                <CardDescription>
                  {lessons.filter((l) => l.completed).length} of{" "}
                  {lessons.length} lessons completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      lesson.current
                        ? "bg-primary/10 border-primary/20 border"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          lesson.current ? "text-primary" : ""
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Resources
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Instructor
                </Button>
                <Button className="w-full" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePlayer;
