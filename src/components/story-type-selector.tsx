"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Sparkles, Sword, Heart, Ghost, Rocket, MapPin } from "lucide-react";

interface StoryTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: string) => void;
  isGenerating: boolean;
}

const storyTypes = [
  {
    id: "fantasy",
    name: "Fantasy Adventure",
    icon: Sword,
    prompt: "Create a fantasy adventure story with magic, mythical creatures, and epic quests"
  },
  {
    id: "scifi",
    name: "Science Fiction",
    icon: Rocket,
    prompt: "Write a science fiction story with advanced technology, space exploration, or futuristic concepts"
  },
  {
    id: "romance",
    name: "Romance",
    icon: Heart,
    prompt: "Tell a romantic story about love, relationships, and emotional connections"
  },
  {
    id: "mystery",
    name: "Mystery",
    icon: Ghost,
    prompt: "Create a mystery story with suspense, clues, and unexpected twists"
  },
  {
    id: "adventure",
    name: "Travel Adventure",
    icon: MapPin,
    prompt: "Write an adventure story about exploration, discovery, and exciting journeys"
  },
  {
    id: "random",
    name: "Surprise Me",
    icon: Sparkles,
    prompt: "Create an engaging story of any genre, with your creative freedom"
  }
];

export function StoryTypeSelector({ open, onOpenChange, onSelect, isGenerating }: StoryTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Story Type</DialogTitle>
          <DialogDescription>
            Select a genre to begin your storytelling journey
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {storyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center gap-2 p-4"
                  onClick={() => onSelect(type.prompt)}
                  disabled={isGenerating}
                >
                  <Icon className="h-8 w-8 mb-1" />
                  <span className="font-medium text-sm">{type.name}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
