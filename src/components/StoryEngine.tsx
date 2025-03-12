import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterText {
  text: string;
  delay: number;
  chaosLevel?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterText> = ({ text, delay, chaosLevel = 0, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [glitchText, setGlitchText] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  
  // Enhanced glitch characters including Unicode symbols and digital artifacts
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?¥€¢£∞§¶•ªº≠æ÷≈ç√∫˜µ≤≥╔╗╚╝║═╦╩╠╣╬○●□■△▲▼▽◄►◆◇○●◐◑◒◓◔◕';
  
  const getRandomGlitchChar = useCallback(() => {
    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }, []);

  const getTypingDelay = useCallback(() => {
    // Base delay varies with chaos level and adds random fluctuations
    const baseDelay = Math.random() * (80 - chaosLevel * 8) + (40 - chaosLevel * 4);
    const pauseProbability = 0.1 + (chaosLevel * 0.05);
    const glitchProbability = 0.05 + (chaosLevel * 0.1);
    
    if (Math.random() < glitchProbability) {
      setGlitchIntensity(prev => Math.min(prev + 0.2, 1));
    } else {
      setGlitchIntensity(prev => Math.max(prev - 0.1, 0));
    }
    
    return Math.random() < pauseProbability ? baseDelay * 3 : baseDelay;
  }, [chaosLevel]);

  useEffect(() => {
    let currentText = '';
    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        
        // Enhanced glitch effect based on chaos level and glitch intensity
        if (Math.random() < (chaosLevel * 0.15 + glitchIntensity * 0.2)) {
          const glitched = currentText.split('');
          const numGlitches = Math.floor((chaosLevel + glitchIntensity) * 3);
          
          for (let i = 0; i < numGlitches; i++) {
            const glitchPos = Math.floor(Math.random() * currentText.length);
            glitched[glitchPos] = getRandomGlitchChar();
          }
          
          setGlitchText(glitched.join(''));
          setGlitchActive(true);
          
          setTimeout(() => {
            setDisplayedText(currentText);
            setGlitchText('');
            setGlitchActive(false);
          }, 50 + (chaosLevel * 30));
        } else {
          setDisplayedText(currentText);
        }
        
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, getTypingDelay());
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    timeoutId = setTimeout(typeNextChar, delay);

    return () => clearTimeout(timeoutId);
  }, [text, delay, chaosLevel, getRandomGlitchChar, getTypingDelay, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
      className="leading-relaxed font-mono relative"
    >
      <motion.p
        style={{
          color: '#00ff00',
          textShadow: `0 0 ${2 + chaosLevel + glitchIntensity * 2}px #00ff00`,
          filter: glitchActive ? `hue-rotate(${glitchIntensity * 30}deg)` : 'none'
        }}
        animate={{
          textShadow: glitchActive ? [
            `0 0 ${4 + chaosLevel * 2}px #00ff00`,
            `0 0 ${2 + chaosLevel}px #00ff00`,
            `0 0 ${4 + chaosLevel * 2}px #00ff00`
          ] : `0 0 ${2 + chaosLevel}px #00ff00`,
          x: glitchActive ? [-1, 1, -1] : 0
        }}
        transition={{ duration: 0.1 }}
      >
        {glitchText || displayedText}
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scaleY: [1, 1.2, 1.2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              times: [0, 0.2, 0.8, 1],
              ease: "easeInOut"
            }}
            className="inline-block ml-1"
            style={{ 
              color: '#00ff00',
              textShadow: `0 0 ${3 + chaosLevel}px #00ff00`
            }}
          >
            ▂
          </motion.span>
        )}
      </motion.p>
    </motion.div>
  );
};

interface StoryEngineProps {
  storyContent: string;
  onChaosChange: (level: number) => void;
}

interface StoryNode {
  text: string[];
  chaosLevel: number;
  choices: {
    text: string;
    next: string;
  }[];
}

interface StoryData {
  [key: string]: StoryNode;
}

export const StoryEngine: React.FC<StoryEngineProps> = ({ storyContent, onChaosChange }) => {
  // Load initial state from localStorage or use defaults
  const [currentNode, setCurrentNode] = useState<string>(() => {
    return localStorage.getItem('currentNode') || 'start';
  });
  const [currentText, setCurrentText] = useState<string[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<number>(() => {
    return parseInt(localStorage.getItem('history') || '0', 10);
  });
  const [chaosLevel, setChaosLevel] = useState<number>(() => {
    return parseFloat(localStorage.getItem('chaosLevel') || '0');
  });
  
  const [story, setStory] = useState<StoryData | null>(null);

  // Validate story structure
  const validateStoryStructure = useCallback((storyData: StoryData) => {
    const validatedNodes = new Set<string>();
    const invalidNodes = new Set<string>();
    
    const validateNode = (nodeId: string, path: string[] = []) => {
      if (validatedNodes.has(nodeId)) return true;
      if (invalidNodes.has(nodeId)) return false;
      if (path.includes(nodeId)) {
        console.warn(`Circular reference detected in path: ${path.join(' -> ')} -> ${nodeId}`);
        return true; // Allow circular references but warn about them
      }
      
      const node = storyData[nodeId];
      if (!node) {
        console.error(`Invalid node reference: ${nodeId}`);
        invalidNodes.add(nodeId);
        return false;
      }
      
      if (!Array.isArray(node.text)) {
        console.error(`Node ${nodeId} has invalid text format`);
        invalidNodes.add(nodeId);
        return false;
      }
      
      if (!Array.isArray(node.choices)) {
        console.error(`Node ${nodeId} has invalid choices format`);
        invalidNodes.add(nodeId);
        return false;
      }
      
      // Validate all choices lead to valid nodes
      const choicesValid = node.choices.every((choice, index) => {
        if (!choice.next) {
          console.error(`Node ${nodeId}, choice ${index} missing 'next' property`);
          return false;
        }
        return validateNode(choice.next, [...path, nodeId]);
      });
      
      if (choicesValid) {
        validatedNodes.add(nodeId);
        return true;
      } else {
        invalidNodes.add(nodeId);
        return false;
      }
    };
    
    // Start validation from the 'start' node
    const isValid = validateNode('start');
    
    console.log('Story validation results:', {
      isValid,
      validNodes: Array.from(validatedNodes),
      invalidNodes: Array.from(invalidNodes)
    });
    
    return isValid;
  }, []);

  // Parse story content and set up initial state
  useEffect(() => {
    try {
      console.log('Parsing story content...');
      const parsedStory = JSON.parse(storyContent) as StoryData;
      console.log('Story structure:', parsedStory);
      
      // Validate story structure
      validateStoryStructure(parsedStory);
      
      setStory(parsedStory);
      
      // Load the current node
      const node = parsedStory[currentNode];
      if (node) {
        console.log('Loading node:', currentNode, {
          text: node.text,
          choices: node.choices,
          chaosLevel: node.chaosLevel
        });
        setCurrentText(node.text || []);
        setChoices(node.choices || []);
        onChaosChange(chaosLevel);
      } else {
        console.error('Current node not found:', currentNode);
        // If current node is not found, reset to start
        setCurrentNode('start');
        const startNode = parsedStory['start'];
        if (startNode) {
          setCurrentText(startNode.text || []);
          setChoices(startNode.choices || []);
        }
      }
    } catch (error) {
      console.error('Error parsing story content:', error);
    }
  }, [storyContent, currentNode, chaosLevel, onChaosChange, validateStoryStructure]);

  // Handle node transitions
  const handleChoice = useCallback((nextNode: string) => {
    console.log('Handling choice transition to:', nextNode);
    if (!story) {
      console.error('Story not loaded');
      return;
    }

    const node = story[nextNode];
    if (!node) {
      console.error(`Node "${nextNode}" not found in story. Available nodes:`, Object.keys(story));
      // Try to recover by going back to start
      const startNode = story['start'];
      if (startNode) {
        console.log('Recovering by returning to start node');
        setCurrentNode('start');
        setCurrentText(startNode.text || []);
        setChoices(startNode.choices || []);
      }
      return;
    }

    console.log('Loading node data:', {
      node,
      text: node.text,
      choices: node.choices,
      chaosLevel: node.chaosLevel
    });

    // Reset typing state
    setIsTyping(true);
    
    // Update current node content
    setCurrentNode(nextNode);
    localStorage.setItem('currentNode', nextNode);
    
    // Ensure text and choices are arrays and validate their content
    const nodeText = Array.isArray(node.text) ? node.text : 
                    (typeof node.text === 'string' ? [node.text] : []);
    const nodeChoices = Array.isArray(node.choices) ? node.choices.filter(choice => 
      choice && typeof choice === 'object' && choice.text && choice.next
    ) : [];
    
    if (nodeChoices.length === 0) {
      console.warn(`Node ${nextNode} has no valid choices, may be a dead end`);
    }
    
    setCurrentText(nodeText);
    setChoices(nodeChoices);
    
    // Calculate new chaos level
    const baseIncrease = 1;
    const bonusIncrease = Math.floor(history / 3); // Bonus for every 3 choices
    const randomFactor = Math.random() * 0.5; // Random factor between 0 and 0.5
    
    const newChaosLevel = Math.min(
      10,
      chaosLevel + baseIncrease + bonusIncrease + randomFactor
    );
    
    console.log('Updating chaos level:', chaosLevel, '->', newChaosLevel);
    
    // Update chaos level
    setChaosLevel(newChaosLevel);
    localStorage.setItem('chaosLevel', newChaosLevel.toString());
    onChaosChange(newChaosLevel);
    
    // Increment history
    const newHistory = history + 1;
    setHistory(newHistory);
    localStorage.setItem('history', newHistory.toString());
  }, [story, history, chaosLevel, onChaosChange]);

  const handleTextComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  // Calculate visual effects based on chaos level
  const getButtonStyles = (index: number) => {
    const baseColor = '#00ff00';
    const glowIntensity = 8 + (chaosLevel * 2);
    const glitchAmount = Math.min(chaosLevel * 0.5, 3);
    
    return {
      borderColor: baseColor,
      color: baseColor,
      textShadow: `0 0 ${glowIntensity}px ${baseColor}`,
      backgroundColor: `rgba(0, 255, 0, ${0.05 + (chaosLevel * 0.01)})`,
      transform: chaosLevel > 5 ? `skew(${Math.sin(Date.now() * 0.01) * glitchAmount}deg)` : 'none',
      transition: 'all 0.3s ease'
    };
  };

  const getHoverStyles = (index: number) => {
    const baseColor = '#00ff00';
    const glowIntensity = 12 + (chaosLevel * 2);
    
    return {
      x: 10,
      backgroundColor: `rgba(0, 255, 0, ${0.1 + (chaosLevel * 0.02)})`,
      borderColor: baseColor,
      textShadow: `0 0 ${glowIntensity}px ${baseColor}`,
      scale: 1 + (chaosLevel * 0.01),
      transition: { duration: 0.2 }
    };
  };

  // Reset game function
  const resetGame = useCallback(() => {
    localStorage.removeItem('currentNode');
    localStorage.removeItem('chaosLevel');
    localStorage.removeItem('history');
    setCurrentNode('start');
    setChaosLevel(0);
    setHistory(0);
    onChaosChange(0);
  }, [onChaosChange]);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {currentText.map((text, index) => (
          <TypewriterText
            key={`${currentNode}-${index}-${history}`}
            text={text}
            delay={index * Math.max(100 - (chaosLevel * 5), 30)}
            chaosLevel={chaosLevel}
            onComplete={index === currentText.length - 1 ? handleTextComplete : undefined}
          />
        ))}
      </AnimatePresence>
      
      <AnimatePresence>
        {!isTyping && choices && choices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-3"
          >
            {choices.map((choice, index) => (
              <motion.button
                key={`${currentNode}-${index}-${history}`}
                className="block w-full text-left px-6 py-3 font-mono border-l-4 rounded-r 
                         transition-all duration-300 backdrop-blur-sm bg-opacity-20 bg-black"
                style={getButtonStyles(index)}
                onClick={() => {
                  console.log('Choice clicked:', choice);
                  handleChoice(choice.next);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileHover={getHoverStyles(index)}
              >
                <span className="opacity-50">{'>'}</span> {choice.text}
                {chaosLevel > 7 && (
                  <span className="ml-2 opacity-50">
                    [{Math.floor(Math.random() * 999).toString(16).padStart(3, '0')}]
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="fixed bottom-4 right-4 font-mono text-sm opacity-50"
        style={{ color: '#00ff00' }}
      >
        CHAOS LVL: {chaosLevel.toString().padStart(2, '0')}
      </motion.div>
      
      <motion.button
        className="block text-left px-6 py-3 font-mono border-l-4 rounded-r 
                  transition-all duration-300 backdrop-blur-sm bg-opacity-20 bg-black fixed bottom-4 left-4 w-auto"
        style={getButtonStyles(0)}
        onClick={resetGame}
        whileHover={getHoverStyles(0)}
      >
        <span className="opacity-50">{'>'}</span> RESET SYSTEM
      </motion.button>

      <motion.div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-sm"
        style={{
          color: '#00ff00',
          textShadow: `0 0 ${4 + chaosLevel}px #00ff00`,
          opacity: 0.7
        }}
        whileHover={{
          opacity: 1,
          textShadow: `0 0 ${8 + chaosLevel}px #00ff00`,
          transition: { duration: 0.2 }
        }}
      >
        <span className="opacity-50">[</span> Made by Hyu <span className="opacity-50">]</span>
      </motion.div>
    </div>
  );
};

export { TypewriterText };