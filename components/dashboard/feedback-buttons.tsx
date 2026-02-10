"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { feedbackApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackButtonsProps {
  message: string;
  aiResponse: string;
}

export function FeedbackButtons({ message, aiResponse }: FeedbackButtonsProps) {
  const [showDislikeDialog, setShowDislikeDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"like" | "dislike" | null>(
    null,
  );
  const { toast } = useToast();

  const handleLike = async () => {
    if (feedbackGiven) return;

    setLoading(true);
    try {
      await feedbackApi.create({
        message,
        feedback_type: "like",
      });

      setFeedbackGiven("like");
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = () => {
    if (feedbackGiven) return;
    setShowDislikeDialog(true);
  };

  const submitDislike = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please tell us what went wrong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await feedbackApi.create({
        message,
        feedback_type: "dislike",
        comment,
      });

      setFeedbackGiven("dislike");
      setShowDislikeDialog(false);
      setComment("");
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-2 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLike}
          disabled={loading || feedbackGiven !== null}
          className={`hover:bg-green-50 hover:text-green-600 hover:border-green-600 ${feedbackGiven === "like" ? "bg-green-50 text-green-600 border-green-600" : ""}`}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span className="text-xs">Hữu ích</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDislike}
          disabled={loading || feedbackGiven !== null}
          className={`hover:bg-red-50 hover:text-red-600 hover:border-red-600 ${feedbackGiven === "dislike" ? "bg-red-50 text-red-600 border-red-600" : ""}`}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          <span className="text-xs">Không hữu ích</span>
        </Button>
      </div>

      <Dialog open={showDislikeDialog} onOpenChange={setShowDislikeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What went wrong?</DialogTitle>
            <DialogDescription>
              Please help us improve by telling us what was wrong with this
              response.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Your feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDislikeDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={submitDislike} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
