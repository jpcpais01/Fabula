"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStories, type Story } from "@/contexts/stories-context";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface HistoryViewProps {
  onSelectStory: (story: Story) => void;
}

export function HistoryView({ onSelectStory }: HistoryViewProps) {
  const { stories, deleteStory } = useStories();
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col p-4 sm:p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold">Story History</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence mode="popLayout">
          {stories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-muted-foreground"
            >
              <p>No stories yet. Start your journey by creating a new story!</p>
            </motion.div>
          ) : (
            stories.map((story) => (
              <motion.div
                key={story.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="group relative bg-card hover:bg-accent rounded-lg p-4 cursor-pointer transition-colors"
                onClick={() => onSelectStory(story)}
              >
                <p className="font-serif text-sm sm:text-base mb-2 line-clamp-2">
                  {story.preview}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStoryToDelete(story);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete story</span>
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={!!storyToDelete} onOpenChange={() => setStoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This story will be permanently deleted from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (storyToDelete) {
                  deleteStory(storyToDelete.id);
                }
                setStoryToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
