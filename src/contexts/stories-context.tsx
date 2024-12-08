"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface Story {
  id: string;
  content: string;
  createdAt: string;
  preview: string;
}

interface StoriesContextType {
  stories: Story[];
  addStory: (content: string) => void;
  getStory: (id: string) => Story | undefined;
  deleteStory: (id: string) => void;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export function StoriesProvider({ children }: { children: React.ReactNode }) {
  const [stories, setStories] = useState<Story[]>([]);

  // Load stories from localStorage on mount
  useEffect(() => {
    const savedStories = localStorage.getItem("stories");
    if (savedStories) {
      setStories(JSON.parse(savedStories));
    }
  }, []);

  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("stories", JSON.stringify(stories));
  }, [stories]);

  const addStory = (content: string) => {
    const preview = content.split('\n')[0].slice(0, 100) + "...";
    
    setStories(prev => {
      // Check if a story with similar content exists
      const existingStoryIndex = prev.findIndex(s => 
        s.content === content || content.startsWith(s.content)
      );

      if (existingStoryIndex !== -1) {
        // Update existing story
        const updatedStories = [...prev];
        updatedStories[existingStoryIndex] = {
          ...updatedStories[existingStoryIndex],
          content,
          preview
        };
        return updatedStories;
      }

      // Add new story
      const newStory: Story = {
        id: Date.now().toString(),
        content,
        createdAt: new Date().toISOString(),
        preview
      };
      return [newStory, ...prev];
    });
  };

  const getStory = (id: string) => {
    return stories.find(story => story.id === id);
  };

  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(story => story.id !== id));
  };

  return (
    <StoriesContext.Provider value={{ stories, addStory, getStory, deleteStory }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error("useStories must be used within a StoriesProvider");
  }
  return context;
}
