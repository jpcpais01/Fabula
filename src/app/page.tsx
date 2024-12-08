"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Moon, Sun, Palette } from "lucide-react";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export default function Home() {
  const [story, setStory] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const calculatePages = useCallback(() => {
    if (!story || !contentRef.current) return;

    const contentArea = contentRef.current.querySelector('.content-area');
    if (!contentArea) return;

    const SAFETY_PADDING = 64;
    const maxHeight = contentArea.clientHeight - SAFETY_PADDING;
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: ${contentArea.clientWidth}px;
      font-size: ${window.innerWidth < 640 ? '14px' : '16px'};
      line-height: 1.75;
      font-family: serif;
      padding: ${SAFETY_PADDING / 2}px 0;
    `;
    document.body.appendChild(tempDiv);

    const paragraphs = story.split('\n').filter(p => p.trim());
    const newPages: string[] = [];
    let currentPage: string[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const testPage = [...currentPage, paragraphs[i]];
      tempDiv.innerHTML = testPage.map(p => `
        <p class="mb-4 font-serif">
          ${p}
        </p>
      `).join('');

      if (tempDiv.offsetHeight - SAFETY_PADDING > maxHeight - 10 && currentPage.length > 0) {
        newPages.push(currentPage.join('\n'));
        currentPage = [paragraphs[i]];
      } else {
        currentPage = testPage;
      }
    }

    if (currentPage.length > 0) {
      newPages.push(currentPage.join('\n'));
    }

    document.body.removeChild(tempDiv);
    setPages(newPages);
  }, [story]);

  useEffect(() => {
    calculatePages();
    window.addEventListener('resize', calculatePages);
    return () => window.removeEventListener('resize', calculatePages);
  }, [story, calculatePages]);

  const generateStory = async (continueStory = false) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: continueStory ? story : undefined 
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const { story: newStoryPart } = await response.json();
      
      if (continueStory && story) {
        setStory(story + '\n\n' + newStoryPart);
      } else {
        setStory(newStoryPart);
        setCurrentPage(0);
      }
      
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none w-full flex justify-between items-center px-4 sm:px-6 h-14 border-b border-border">
        <h1 className="font-serif text-xl sm:text-2xl font-semibold">
          Fabula
        </h1>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 sepia:-rotate-90 sepia:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all sepia:rotate-0 sepia:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("sepia")}>
                Sepia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden" ref={contentRef}>
        {story ? (
          <div className="h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -200 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col p-4 sm:p-6"
              >
                <div className="content-area flex-1 flex flex-col justify-center">
                  <div className="prose dark:prose-invert max-w-none">
                    {pages[currentPage]?.split('\n').map((paragraph, index) => (
                      <p 
                        key={index} 
                        className="mb-4 font-serif text-sm sm:text-base leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Page Navigation */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm font-serif text-muted-foreground">
                {currentPage + 1} / {pages.length}
              </span>
              {currentPage === pages.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={() => generateStory(true)}
                  disabled={isGenerating}
                  className="w-24 font-serif text-sm"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
            <h2 className="font-serif text-xl sm:text-2xl text-center">
              Welcome to Fabula
            </h2>
            <p className="text-center max-w-md text-muted-foreground">
              Your personal AI storyteller. Click below to start your journey into a world of endless stories.
            </p>
            <Button 
              onClick={() => generateStory()} 
              disabled={isGenerating}
              className="font-serif"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crafting your story...
                </>
              ) : (
                'Begin Your Journey'
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Menu Bar */}
      <div className="flex-none w-full h-14 border-t border-border bg-background/80 backdrop-blur-sm flex items-center justify-around px-4">
        {/* Menu items will go here */}
        <div className="text-sm text-muted-foreground">Menu coming soon...</div>
      </div>
    </div>
  );
}
