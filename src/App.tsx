import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { StoryEngine } from './components/StoryEngine';
import { audioManager } from './utils/AudioManager';

function App() {
  const [storyContent, setStoryContent] = useState<string>('');
  const [chaosLevel, setChaosLevel] = useState(() => {
    return parseFloat(localStorage.getItem('chaosLevel') || '0');
  });
  const [audioStarted, setAudioStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStory = async () => {
      try {
        const response = await fetch('/stories/intro.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load story: ${response.statusText}`);
        }
        
        const data = await response.json();
        const stringifiedContent = JSON.stringify(data);
        setStoryContent(stringifiedContent);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading story:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
        setIsLoading(false);
      }
    };

    loadStory();
  }, []);

  useEffect(() => {
    audioManager.setChaosLevel(chaosLevel);
  }, [chaosLevel]);

  const handleChaosChange = (newLevel: number) => {
    setChaosLevel(newLevel);
    localStorage.setItem('chaosLevel', newLevel.toString());
  };

  const handleStartAudio = async () => {
    if (!audioStarted) {
      try {
        await audioManager.startAmbient();
        setAudioStarted(true);
      } catch (err) {
        console.error('Error starting audio:', err);
      }
    }
  };

  return (
    <div 
      onClick={handleStartAudio} 
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black"
    >
      <Terminal chaosMeter={chaosLevel}>
        {error ? (
          <div className="text-red-500 font-mono">
            SYSTEM ERROR: {error}
          </div>
        ) : isLoading ? (
          <div className="animate-pulse font-mono text-[#00ff00]">
            Loading narrative matrices...
          </div>
        ) : storyContent ? (
          <StoryEngine
            storyContent={storyContent}
            onChaosChange={handleChaosChange}
          />
        ) : (
          <div className="text-red-500 font-mono">
            SYSTEM ERROR_002: Story data corruption detected.
          </div>
        )}
      </Terminal>
    </div>
  );
}

export default App; 