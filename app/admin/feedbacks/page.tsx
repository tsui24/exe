"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  feedbackApi,
  type FeedbackResponse,
  type FeedbackStatsResponse,
} from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FeedbackStatsResponse | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackResponse[]>([]);
  const [likes, setLikes] = useState<FeedbackResponse[]>([]);
  const [dislikes, setDislikes] = useState<FeedbackResponse[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.is_admin) {
      router.push("/dashboard");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, allData, likesData, dislikesData] = await Promise.all([
        feedbackApi.getStats(),
        feedbackApi.listAll(0, 100),
        feedbackApi.listAll(0, 100, "like"),
        feedbackApi.listAll(0, 100, "dislike"),
      ]);

      setStats(statsData);
      setAllFeedbacks(allData);
      setLikes(likesData);
      setDislikes(dislikesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load feedback data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const FeedbackCard = ({ feedback }: { feedback: FeedbackResponse }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {feedback.feedback_type === "like" ? (
              <ThumbsUp className="h-4 w-4 text-green-600" />
            ) : (
              <ThumbsDown className="h-4 w-4 text-red-600" />
            )}
            <Badge
              variant={
                feedback.feedback_type === "like" ? "default" : "destructive"
              }
            >
              {feedback.feedback_type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              by {feedback.username}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(feedback.created_at).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">User Message:</p>
          <p className="text-sm text-muted-foreground">{feedback.message}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">AI Response:</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {feedback.ai_response}
          </p>
        </div>
        {feedback.comment && (
          <div>
            <p className="text-sm font-medium mb-1">User Comment:</p>
            <p className="text-sm text-red-600">{feedback.comment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">
            Manage and analyze user feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedbacks
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_feedbacks || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_likes || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dislikes</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.total_dislikes || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Like Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.like_percentage || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({allFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="likes">Likes ({likes.length})</TabsTrigger>
          <TabsTrigger value="dislikes">
            Dislikes ({dislikes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {allFeedbacks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No feedback yet
              </CardContent>
            </Card>
          ) : (
            allFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))
          )}
        </TabsContent>

        <TabsContent value="likes" className="space-y-4 mt-4">
          {likes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No likes yet
              </CardContent>
            </Card>
          ) : (
            likes.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))
          )}
        </TabsContent>

        <TabsContent value="dislikes" className="space-y-4 mt-4">
          {dislikes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No dislikes yet
              </CardContent>
            </Card>
          ) : (
            dislikes.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
