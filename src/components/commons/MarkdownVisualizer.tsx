import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/cn';

interface MarkdownVisualizerProps {
  content: string;
  className?: string;
}

type MarkdownComponentProps = {
  children?: React.ReactNode;
  className?: string;
};

export const MarkdownVisualizer: React.FC<MarkdownVisualizerProps> = ({
  content,
  className,
}) => {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }: MarkdownComponentProps) => (
            <h1 className="text-2xl font-bold mb-4" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: MarkdownComponentProps) => (
            <h2 className="text-xl font-semibold mb-3" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: MarkdownComponentProps) => (
            <h3 className="text-lg font-medium mb-2" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }: MarkdownComponentProps) => (
            <p className="mb-4 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }: MarkdownComponentProps) => (
            <ul className="list-disc pl-6 mb-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: MarkdownComponentProps) => (
            <ol className="list-decimal pl-6 mb-4" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: MarkdownComponentProps) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
          code: ({ inline, className, children, ...props }: MarkdownComponentProps & { inline?: boolean }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 mb-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ children, ...props }: MarkdownComponentProps) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noop noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          blockquote: ({ children, ...props }: MarkdownComponentProps) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4"
              {...props}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 