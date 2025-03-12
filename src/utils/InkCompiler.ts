import { Story } from 'inkjs';

interface StoryNode {
  type: string;
  name?: string;
  value?: string | number;
  content?: StoryNode[];
  target?: string;
  text?: string;
}

interface CompiledStory {
  inkVersion: number;
  root: StoryNode[];
  listDefs: Record<string, any>;
}

export function compileInkStory(storyContent: string): string {
  // Convert the raw Ink story into a JSON format that inkjs can understand
  const story: CompiledStory = {
    inkVersion: 21,
    root: [],
    listDefs: {},
  };

  const lines = storyContent.split('\n');
  let currentKnot = '';
  let currentStitch = '';
  let currentChoices: StoryNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Handle variables
    if (line.startsWith('VAR')) {
      const [_, name, value] = line.match(/VAR\s+(\w+)\s*=\s*(.+)/) || [];
      if (name && value) {
        story.root.push({
          type: 'var',
          name,
          value: parseFloat(value) || value,
        });
      }
      continue;
    }

    // Handle knots
    if (line.startsWith('===')) {
      const knotName = line.match(/===\s*(\w+)\s*===?/)?.[1];
      if (knotName) {
        currentKnot = knotName;
        story.root.push({
          type: 'knot',
          name: knotName,
          content: [],
        });
      }
      continue;
    }

    // Handle choices
    if (line.startsWith('*')) {
      const choiceMatch = line.match(/\*\s*\[(.*?)\]/);
      if (choiceMatch) {
        const choiceText = choiceMatch[1];
        currentChoices.push({
          type: 'choice',
          text: choiceText,
          content: [],
        });
      }
      continue;
    }

    // Handle divert
    if (line.startsWith('->')) {
      const targetMatch = line.match(/->(?:\s+)?(\w+)/);
      if (targetMatch) {
        const target = targetMatch[1];
        if (currentChoices.length > 0) {
          currentChoices[currentChoices.length - 1].content?.push({
            type: 'divert',
            target,
          });
        } else {
          story.root.push({
            type: 'divert',
            target,
          });
        }
      }
      continue;
    }

    // Handle regular text
    if (currentChoices.length > 0) {
      currentChoices[currentChoices.length - 1].content?.push({
        type: 'text',
        value: line,
      });
    } else {
      story.root.push({
        type: 'text',
        value: line,
      });
    }
  }

  return JSON.stringify(story);
} 