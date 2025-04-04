'use client';

import React, { useState } from 'react';
import { MarkdownVisualizer } from '@/components/commons/MarkdownVisualizer';

const defaultMarkdown = `# Welcome to Markdown Visualizer

This is a **markdown** preview tool. Type your markdown on the left and see the rendered output on the right.

## Features
- Real-time preview
- GitHub Flavored Markdown support
- Code highlighting
- Dark mode support

\`\`\`javascript
// Example code block
function hello() {
  console.log('Hello, world!');
}
\`\`\`

> This is a blockquote
`;

export default function MarkdownVisualizerPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  return (
    <div className="flex flex-col min-h-[80vh]">
      <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 pt-4 overflow-hidden">
        <div className="flex-1 flex flex-col p-1 w-1/2">
          <label htmlFor="markdown-input" className="text-lg font-medium mb-2">
            Markdown Input
          </label>
          <textarea
            id="markdown-input"
            className="flex-1 w-full p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
          />
        </div>

        <div className="flex-1 flex flex-col p-1 w-1/2">
          <label className="text-lg font-medium mb-2">
            Preview
          </label>
          <div className="flex-1 overflow-auto p-4 border rounded-lg dark:border-gray-700">
            <MarkdownVisualizer content={markdown} />
          </div>
        </div>
      </div>
    </div>
  );
} 