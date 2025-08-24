'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import { AlertCircle, Download, Loader2, Plus, Trash2 } from "lucide-react";
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";
import { Button } from "@/components/shadcn/ui/button";
import debounce from "lodash.debounce";

interface FilePair {
  id: string;
  fileName: string;
  originalContent: string;
  updatedContent: string;
}

export default function DiffGenerator() {
  const [filePairs, setFilePairs] = useState<FilePair[]>([
    {
      id: "1",
      fileName: "file.txt",
      originalContent: "",
      updatedContent: "",
    },
  ]);
  const [patchOutput, setPatchOutput] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateDiff = useCallback(
    debounce(() => {
      // Check if any file pair has content
      const hasContent = filePairs.some(
        (pair) => pair.originalContent.trim() || pair.updatedContent.trim()
      );

      if (!hasContent) {
        setPatchOutput("");
        setError("");
        setIsGenerating(false);
        return;
      }

      // Validate all file pairs
      const invalidPairs = filePairs.filter(
        (pair) => !pair.originalContent.trim() || !pair.updatedContent.trim()
      );

      if (invalidPairs.length > 0) {
        setError("All file pairs must have both original and updated content");
        setPatchOutput("");
        setIsGenerating(false);
        return;
      }

      setIsGenerating(true);

      // Use setTimeout to allow UI to update before heavy computation
      setTimeout(() => {
        try {
          const diff = generateMultiFileDiff(filePairs);
          setPatchOutput(diff);
          setError("");
        } catch (e) {
          setError("Error generating diff. Please check your input.");
          setPatchOutput("");
          console.error(e);
        } finally {
          setIsGenerating(false);
        }
      }, 0);
    }, 300),
    [filePairs]
  );

  useEffect(() => {
    generateDiff();
  }, [generateDiff]);

  const addFilePair = () => {
    const newId = (
      Math.max(...filePairs.map((p) => parseInt(p.id))) + 1
    ).toString();
    setFilePairs([
      ...filePairs,
      {
        id: newId,
        fileName: `file${newId}.txt`,
        originalContent: "",
        updatedContent: "",
      },
    ]);
  };

  const removeFilePair = (id: string) => {
    if (filePairs.length > 1) {
      setFilePairs(filePairs.filter((pair) => pair.id !== id));
    }
  };

  const updateFilePair = (id: string, field: keyof FilePair, value: string) => {
    setFilePairs(
      filePairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const handleDownloadPatch = () => {
    if (!patchOutput) return;

    const blob = new Blob([patchOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi-file-patch.patch`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    setFilePairs([
      {
        id: "1",
        fileName: "sample.txt",
        originalContent:
          "Hello World\nThis is a sample file\nfor testing the diff generator.\nIt contains multiple lines\nof text content.",
        updatedContent:
          "Hello World\nThis is a sample file\nfor testing the diff generator.\nIt contains multiple lines\nof updated text content.\nAnd this is a new line.",
      },
      {
        id: "2",
        fileName: "config.json",
        originalContent: '{\n  "name": "app",\n  "version": "1.0.0"\n}',
        updatedContent:
          '{\n  "name": "app",\n  "version": "1.0.1",\n  "description": "Updated app"\n}',
      },
    ]);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Multi-File Diff Generator
        </h1>
      </div>
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How to use:</strong> Add multiple file pairs with their
          original and updated contents. The generator will create a unified
          patch file for all changes. The patch can be applied using{" "}
          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
            git apply patch-file.patch
          </code>{" "}
          or
          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
            patch -p1 &lt; patch-file.patch
          </code>
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={loadSampleData} variant="outline" size="sm">
          Load Sample Data
        </Button>
        <Button onClick={addFilePair} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add File Pair
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {filePairs.map((pair) => (
          <div
            key={pair.id}
            className="border border-border rounded-lg p-4 bg-card"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 mr-4">
                <label
                  htmlFor={`file-name-${pair.id}`}
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  File Name (for patch header)
                </label>
                <input
                  id={`file-name-${pair.id}`}
                  type="text"
                  value={pair.fileName}
                  onChange={(e) =>
                    updateFilePair(pair.id, "fileName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  placeholder="Enter file name (e.g., example.txt)"
                />
              </div>
              {filePairs.length > 1 && (
                <Button
                  onClick={() => removeFilePair(pair.id)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor={`original-file-${pair.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Original File
                  </label>
                  <UserInputControls
                    setInput={(content) =>
                      updateFilePair(pair.id, "originalContent", content)
                    }
                    setErrorMessage={setError}
                    overrideFileUploadId={`original-file-upload-${pair.id}`}
                  />
                </div>
                <Textarea
                  id={`original-file-${pair.id}`}
                  value={pair.originalContent}
                  onChange={(e) =>
                    updateFilePair(pair.id, "originalContent", e.target.value)
                  }
                  placeholder="Enter or paste the original file content..."
                  className="min-h-[200px] flex-1 resize-none"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor={`updated-file-${pair.id}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Updated File
                  </label>
                  <UserInputControls
                    setInput={(content) =>
                      updateFilePair(pair.id, "updatedContent", content)
                    }
                    setErrorMessage={setError}
                    overrideFileUploadId={`updated-file-upload-${pair.id}`}
                  />
                </div>
                <Textarea
                  id={`updated-file-${pair.id}`}
                  value={pair.updatedContent}
                  onChange={(e) =>
                    updateFilePair(pair.id, "updatedContent", e.target.value)
                  }
                  placeholder="Enter or paste the updated file content..."
                  className="min-h-[200px] flex-1 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-foreground">
            Generated Patch
          </h2>
          {patchOutput && !isGenerating && (
            <Button onClick={handleDownloadPatch} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Patch
            </Button>
          )}
        </div>
        <div className="bg-muted rounded-md border border-border">
          <pre className="p-4 overflow-auto max-h-[400px] relative text-foreground">
            <ClickToCopy
              toCopySupplier={() => patchOutput}
              buttonClassName="absolute right-4 top-4 z-10"
            />
            <code className="text-sm block">
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating diff...
                </div>
              ) : (
                patchOutput || "Patch will be generated here..."
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function generateMultiFileDiff(filePairs: FilePair[]): string {
  try {
    let combinedPatch = "";

    // Generate diff for each file pair
    filePairs.forEach((pair) => {
      if (pair.originalContent.trim() && pair.updatedContent.trim()) {
        const patch = generateGitStyleDiff(
          pair.fileName,
          pair.originalContent,
          pair.updatedContent
        );

        // Remove the Index: header line and the separator line if they exist
        const cleanPatch = patch
          .split("\n")
          .filter(
            (line) =>
              !line.startsWith("Index:") &&
              line !==
                "==================================================================="
          )
          .join("\n");

        // Add separator between multiple patches
        if (combinedPatch) {
          combinedPatch += "\n";
        }

        combinedPatch += cleanPatch;
      }
    });

    return combinedPatch;
  } catch (error) {
    console.error("Error generating multi-file diff:", error);
    return "";
  }
}

function generateGitStyleDiff(
  fileName: string,
  original: string,
  updated: string
): string {
  const originalLines = original.split("\n");
  const updatedLines = updated.split("\n");

  let diff = `--- a/${fileName}\n`;
  diff += `+++ b/${fileName}\n`;

  // Simple diff generation - you might want to use a more sophisticated algorithm
  // For now, just show the differences
  const maxLines = Math.max(originalLines.length, updatedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || "";
    const updatedLine = updatedLines[i] || "";

    if (originalLine !== updatedLine) {
      if (originalLine) {
        diff += `-${originalLine}\n`;
      }
      if (updatedLine) {
        diff += `+${updatedLine}\n`;
      }
    } else {
      diff += ` ${originalLine}\n`;
    }
  }

  return diff;
} 