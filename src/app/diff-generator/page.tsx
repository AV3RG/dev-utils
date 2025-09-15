'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import { AlertCircle, Download, Loader2, Plus, Trash2 } from "lucide-react";
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";
import { Button } from "@/components/shadcn/ui/button";
import debounce from "lodash.debounce";
import { createPatch } from "diff";

interface FilePair {
  id: string;
  fileName: string;
  originalContent: string;
  updatedContent: string;
}

interface GitHubRepo {
  owner: string;
  repo: string;
  branch: string;
  path?: string;
}

interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "removed";
  additions?: number;
  deletions?: number;
  changes?: number;
  patch?: string;
}

interface PullRequest {
  owner: string;
  repo: string;
  prNumber: number;
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
  const [githubOriginal, setGithubOriginal] = useState<GitHubRepo>({
    owner: "",
    repo: "",
    branch: "main",
    path: "",
  });
  const [githubUpdated, setGithubUpdated] = useState<GitHubRepo>({
    owner: "",
    repo: "",
    branch: "main",
    path: "",
  });
  const [isGithubMode, setIsGithubMode] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [changedFiles, setChangedFiles] = useState<ChangedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [pullRequest, setPullRequest] = useState<PullRequest>({
    owner: "",
    repo: "",
    prNumber: 0,
  });
  const [usePullRequest, setUsePullRequest] = useState(false);
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

  const fetchGithubContent = async (repo: GitHubRepo): Promise<string> => {
    try {
      // Validate required fields
      if (!repo.owner || !repo.repo) {
        throw new Error(
          `Invalid repository: owner="${repo.owner}", repo="${repo.repo}"`
        );
      }

      const url = `https://api.github.com/repos/${repo.owner}/${
        repo.repo
      }/contents/${repo.path || ""}?ref=${repo.branch}`;

      console.log("Fetching GitHub content from:", url);
      console.log("Repository object:", repo);

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          // Try to get more details about what's not found
          const errorData = await response.json().catch(() => ({}));
          console.log("404 Error details:", errorData);

          if (errorData.message) {
            throw new Error(`GitHub API: ${errorData.message}`);
          } else {
            throw new Error(
              `File not found: ${repo.path} in branch ${repo.branch}. The file may not exist at this path or the branch may be incorrect.`
            );
          }
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. The repository might be private or you've hit rate limits."
          );
        } else if (response.status === 401) {
          throw new Error("Unauthorized. The repository might be private.");
        } else if (response.status === 422) {
          throw new Error(
            "Invalid request. Please check your repository details."
          );
        } else {
          throw new Error(
            `GitHub API error: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();

      console.log("GitHub API response:", data);

      if (data.type === "file") {
        // Decode base64 content
        return atob(data.content);
      } else if (data.type === "dir") {
        // For directories, we'll need to handle multiple files
        throw new Error(
          "Directory comparison not yet supported. Please specify a file path."
        );
      } else if (data.message) {
        // GitHub API error message
        throw new Error(`GitHub API: ${data.message}`);
      } else {
        throw new Error(
          `Unknown content type from GitHub API: ${data.type || "undefined"}`
        );
      }
    } catch (error) {
      console.error("Error fetching GitHub content:", error);
      throw error;
    }
  };

  const fetchChangedFiles = async (
    original: GitHubRepo,
    updated: GitHubRepo
  ): Promise<ChangedFile[]> => {
    try {
      // Check if we're comparing the same repository or different ones
      const isSameRepo =
        original.owner === updated.owner && original.repo === updated.repo;

      if (isSameRepo) {
        // Same repository - use GitHub's Compare API
        const url = `https://api.github.com/repos/${original.owner}/${original.repo}/compare/${original.branch}...${updated.branch}`;

        console.log("GitHub Compare URL (same repo):", url);
        console.log("Original branch:", original.branch);
        console.log("Updated branch:", updated.branch);

        const response = await fetch(url);

        console.log("Response status:", response.status, response.statusText);

        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json().catch(() => ({}));
            console.log("404 Error details:", errorData);

            if (errorData.message) {
              throw new Error(`GitHub API: ${errorData.message}`);
            } else {
              throw new Error(
                "Repository or branches not found. Please check your inputs."
              );
            }
          } else if (response.status === 403) {
            throw new Error(
              "Access denied. The repository might be private or you've hit rate limits."
            );
          } else if (response.status === 401) {
            throw new Error("Unauthorized. The repository might be private.");
          } else {
            throw new Error(
              `GitHub API error: ${response.status} ${response.statusText}`
            );
          }
        }

        const data = await response.json();
        console.log("GitHub Compare API response:", data);

        if (data.files) {
          return data.files.map(
            (file: {
              filename: string;
              status: string;
              additions?: number;
              deletions?: number;
              changes?: number;
              patch?: string;
            }) => ({
              filename: file.filename,
              status: file.status as "added" | "modified" | "removed",
              additions: file.additions,
              deletions: file.deletions,
              changes: file.changes,
              patch: file.patch,
            })
          );
        }

        return [];
      } else {
        // Different repositories - we can't use the Compare API
        // Instead, we'll need to manually specify files to compare
        throw new Error(
          "Cross-repository comparison requires manual file specification. Please use the file input fields below."
        );
      }
    } catch (error) {
      console.error("Error fetching changed files:", error);
      throw error;
    }
  };

  const fetchChangedFilesFromPR = async (
    pr: PullRequest
  ): Promise<ChangedFile[]> => {
    try {
      // Use GitHub's PR API to get changed files
      const url = `https://api.github.com/repos/${pr.owner}/${pr.repo}/pulls/${pr.prNumber}/files`;
      const response = await fetch(url);

      console.log(
        "GitHub PR API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Pull request not found. Please check the PR number and repository."
          );
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. The repository might be private or you've hit rate limits."
          );
        } else if (response.status === 401) {
          throw new Error("Unauthorized. The repository might be private.");
        } else {
          throw new Error(
            `GitHub API error: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      console.log("GitHub PR API response:", data);

      if (Array.isArray(data)) {
        return data.map(
          (file: {
            filename: string;
            status: string;
            additions?: number;
            deletions?: number;
            changes?: number;
            patch?: string;
          }) => ({
            filename: file.filename,
            status: file.status as "added" | "modified" | "removed",
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            patch: file.patch,
          })
        );
      }

      return [];
    } catch (error) {
      console.error("Error fetching PR files:", error);
      throw error;
    }
  };

  const fetchPRDetails = async (
    pr: PullRequest
  ): Promise<{ base: string; head: string }> => {
    try {
      // Use GitHub's PR API to get PR details including base and head branches
      const url = `https://api.github.com/repos/${pr.owner}/${pr.repo}/pulls/${pr.prNumber}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PR details: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("PR details:", data);

      return {
        base: data.base.ref, // e.g., "main"
        head: data.head.ref, // e.g., "feature-branch"
      };
    } catch (error) {
      console.error("Error fetching PR details:", error);
      throw error;
    }
  };

  const handleGithubCompare = async () => {
    if (usePullRequest) {
      // PR-based comparison
      if (!pullRequest.owner || !pullRequest.repo || !pullRequest.prNumber) {
        setError("Please fill in all required PR fields");
        return;
      }

      setIsLoadingGithub(true);
      setError("");

      try {
        const files = await fetchChangedFilesFromPR(pullRequest);

        if (files.length === 0) {
          setError("No changes found in the pull request");
          return;
        }

        setChangedFiles(files);
        setSelectedFiles([]); // Reset selected files
      } catch (error) {
        setError(
          `Error fetching PR files: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingGithub(false);
      }
      return;
    }

    // Regular repository comparison
    if (
      !githubOriginal.owner ||
      !githubOriginal.repo ||
      !githubUpdated.owner ||
      !githubUpdated.repo
    ) {
      setError("Please fill in all required GitHub repository fields");
      return;
    }

    const isSameRepo =
      githubOriginal.owner === githubUpdated.owner &&
      githubOriginal.repo === githubUpdated.repo;

    if (isSameRepo) {
      // Same repository - try to fetch changed files automatically
      setIsLoadingGithub(true);
      setError("");

      try {
        const files = await fetchChangedFiles(githubOriginal, githubUpdated);

        if (files.length === 0) {
          setError("No changes found between the specified branches");
          return;
        }

        setChangedFiles(files);
        setSelectedFiles([]); // Reset selected files
      } catch (error) {
        setError(
          `Error comparing GitHub repositories: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingGithub(false);
      }
    } else {
      // Cross-repository comparison - try to auto-detect common files
      setIsLoadingGithub(true);
      setError("");

      try {
        // Common files that are likely to exist in most repositories
        const commonFiles = [
          "package.json",
          "README.md",
          "LICENSE",
          "CHANGELOG.md",
          "Dockerfile",
          ".gitignore",
          "Makefile",
          "requirements.txt",
          "pom.xml",
          "build.gradle",
          "Cargo.toml",
          "go.mod",
        ];

        console.log("Checking for common files between repositories...");
        const availableFiles: string[] = [];

        // Check which common files exist in both repositories AND have differences
        for (const file of commonFiles) {
          try {
            const originalRepo = { ...githubOriginal, path: file };
            const updatedRepo = { ...githubUpdated, path: file };

            // Fetch both files
            const [originalContent, updatedContent] = await Promise.all([
              fetchGithubContent(originalRepo),
              fetchGithubContent(updatedRepo),
            ]);

            // Only add files that actually have differences
            if (originalContent !== updatedContent) {
              availableFiles.push(file);
              console.log(`Found differences in: ${file}`);
            } else {
              console.log(`No differences in: ${file}`);
            }
          } catch (error) {
            // File doesn't exist in one or both repos, skip it
            console.log(
              `File not found or error: ${file} - ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            continue;
          }
        }

        console.log(
          `Found ${availableFiles.length} files with differences:`,
          availableFiles
        );

        if (availableFiles.length === 0) {
          setError(
            "No files with differences found between the repositories. Please specify file paths manually."
          );
          return;
        }

        // Show available files for selection
        setChangedFiles(
          availableFiles.map((filename) => ({
            filename,
            status: "modified" as const,
            additions: 0,
            deletions: 0,
            changes: 0,
          }))
        );
        setSelectedFiles([]);
      } catch (error) {
        setError(
          `Error detecting common files: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingGithub(false);
      }
    }
  };

  const copyToUpdated = () => {
    setGithubUpdated({
      owner: githubOriginal.owner,
      repo: githubOriginal.repo,
      branch: githubOriginal.branch,
      path: githubOriginal.path,
    });
  };

  const handleFileSelection = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const generateDiffForSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to compare");
      return;
    }

    setIsLoadingGithub(true);
    setError("");

    try {
      const newFilePairs: FilePair[] = [];

      if (usePullRequest) {
        // PR mode - fetch content from the PR's base and head
        console.log("PR mode: fetching content for selected files");

        try {
          // First, get the PR details to know the base and head branches
          const { base: baseBranch, head: headBranch } = await fetchPRDetails(
            pullRequest
          );
          console.log(`PR branches: base=${baseBranch}, head=${headBranch}`);

          for (const filename of selectedFiles) {
            try {
              // Create repo objects for base and head branches
              const baseRepo = {
                owner: pullRequest.owner,
                repo: pullRequest.repo,
                branch: baseBranch,
                path: filename,
              };
              const headRepo = {
                owner: pullRequest.owner,
                repo: pullRequest.repo,
                branch: headBranch,
                path: filename,
              };

              console.log("Processing PR file:", filename);
              console.log("Base repo:", baseRepo);
              console.log("Head repo:", headRepo);

              const [baseContent, headContent] = await Promise.all([
                fetchGithubContent(baseRepo),
                fetchGithubContent(headRepo),
              ]);

              newFilePairs.push({
                id: Date.now().toString() + Math.random(),
                fileName: filename,
                originalContent: baseContent,
                updatedContent: headContent,
              });
            } catch (error) {
              console.error(`Error processing PR file ${filename}:`, error);
              // Continue with other files instead of failing completely
              continue;
            }
          }
        } catch (error) {
          throw new Error(
            `Failed to fetch PR details: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      } else {
        // Repository comparison mode
        console.log("Repository mode: fetching content for selected files");

        // Debug: Log the current state
        console.log("Current githubOriginal state:", githubOriginal);
        console.log("Current githubUpdated state:", githubUpdated);

        // Validate repository objects
        if (
          !githubOriginal.owner ||
          !githubOriginal.repo ||
          !githubUpdated.owner ||
          !githubUpdated.repo
        ) {
          setError(
            `Repository information is incomplete. Original: owner="${githubOriginal.owner}", repo="${githubOriginal.repo}". Updated: owner="${githubUpdated.owner}", repo="${githubUpdated.repo}"`
          );
          return;
        }

        for (const filename of selectedFiles) {
          // Create repo objects with the specific file path
          const originalRepo = { ...githubOriginal, path: filename };
          const updatedRepo = { ...githubUpdated, path: filename };

          console.log("Processing file:", filename);
          console.log("Original repo:", originalRepo);
          console.log("Updated repo:", updatedRepo);

          const [originalContent, updatedContent] = await Promise.all([
            fetchGithubContent(originalRepo),
            fetchGithubContent(updatedRepo),
          ]);

          newFilePairs.push({
            id: Date.now().toString() + Math.random(),
            fileName: filename,
            originalContent,
            updatedContent,
          });
        }
      }

      if (newFilePairs.length === 0) {
        setError("No files were successfully processed");
        return;
      }

      setFilePairs(newFilePairs);
      setIsGithubMode(false);
      setChangedFiles([]);
      setSelectedFiles([]);
    } catch (error) {
      setError(
        `Error generating diff for selected files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoadingGithub(false);
    }
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

      {/* GitHub Repository Comparison */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            GitHub Repository Comparison
          </h3>
          <Button
            onClick={() => setIsGithubMode(!isGithubMode)}
            variant="outline"
            size="sm"
          >
            {isGithubMode ? "Hide" : "Show"} GitHub Comparison
          </Button>
        </div>

        {isGithubMode && (
          <div className="space-y-4">
            {/* PR vs Repository Comparison Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-4 p-2 bg-muted rounded-lg">
                <button
                  onClick={() => {
                    setUsePullRequest(false);
                    // Reset form data when switching modes
                    setChangedFiles([]);
                    setSelectedFiles([]);
                    setError("");
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    !usePullRequest
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Repository Comparison
                </button>
                <button
                  onClick={() => {
                    setUsePullRequest(true);
                    // Reset form data when switching modes
                    setChangedFiles([]);
                    setSelectedFiles([]);
                    setError("");
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    usePullRequest
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pull Request
                </button>
              </div>
            </div>

            {usePullRequest ? (
              /* PR Input Fields */
              <div className="space-y-3">
                <h4 className="font-medium text-foreground text-center">
                  Pull Request Details
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Owner (e.g., facebook)"
                    value={pullRequest.owner}
                    onChange={(e) =>
                      setPullRequest((prev) => ({
                        ...prev,
                        owner: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Repository (e.g., react)"
                    value={pullRequest.repo}
                    onChange={(e) =>
                      setPullRequest((prev) => ({
                        ...prev,
                        repo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="PR Number (e.g., 123)"
                    value={pullRequest.prNumber || ""}
                    onChange={(e) =>
                      setPullRequest((prev) => ({
                        ...prev,
                        prNumber: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  <p>
                    Enter the repository details and PR number to get the diff
                  </p>
                  <p>
                    Example: <code>facebook/react</code> PR #123
                  </p>
                </div>
              </div>
            ) : (
              /* Repository Input Fields */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original Repository */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">
                    Original Repository
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Owner (e.g., facebook)"
                      value={githubOriginal.owner}
                      onChange={(e) => {
                        console.log(
                          "Setting githubOriginal.owner to:",
                          e.target.value
                        );
                        setGithubOriginal((prev) => ({
                          ...prev,
                          owner: e.target.value,
                        }));
                      }}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <div className="text-xs text-muted-foreground">
                      Current owner: &quot;{githubOriginal.owner}&quot;
                    </div>
                    <input
                      type="text"
                      placeholder="Repository (e.g., react)"
                      value={githubOriginal.repo}
                      onChange={(e) => {
                        console.log(
                          "Setting githubOriginal.repo to:",
                          e.target.value
                        );
                        setGithubOriginal((prev) => ({
                          ...prev,
                          repo: e.target.value,
                        }));
                      }}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <div className="text-xs text-muted-foreground">
                      Current repo: &quot;{githubOriginal.repo}&quot;
                    </div>
                    <input
                      type="text"
                      placeholder="Branch (e.g., main)"
                      value={githubOriginal.branch}
                      onChange={(e) =>
                        setGithubOriginal((prev) => ({
                          ...prev,
                          branch: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="File path (for cross-repo comparison)"
                      value={githubOriginal.path || ""}
                      onChange={(e) =>
                        setGithubOriginal((prev) => ({
                          ...prev,
                          path: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Updated Repository */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">
                    Updated Repository
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Owner (e.g., facebook)"
                      value={githubUpdated.owner}
                      onChange={(e) =>
                        setGithubUpdated((prev) => ({
                          ...prev,
                          owner: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Repository (e.g., react)"
                      value={githubUpdated.repo}
                      onChange={(e) =>
                        setGithubUpdated((prev) => ({
                          ...prev,
                          repo: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Branch (e.g., develop)"
                      value={githubUpdated.branch}
                      onChange={(e) =>
                        setGithubUpdated((prev) => ({
                          ...prev,
                          branch: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring bg-background text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="File path (for cross-repo comparison)"
                      value={githubUpdated.path || ""}
                      onChange={(e) =>
                        setGithubUpdated((prev) => ({
                          ...prev,
                          path: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-2">
              <Button onClick={copyToUpdated} variant="outline" size="sm">
                Copy to Updated
              </Button>
              <Button
                onClick={() => {
                  console.log("Test button clicked");
                  setGithubOriginal((prev) => ({
                    ...prev,
                    owner: "test-owner",
                    repo: "test-repo",
                  }));
                  setGithubUpdated((prev) => ({
                    ...prev,
                    owner: "test-owner",
                    repo: "test-repo",
                  }));
                  console.log("Test values set");
                }}
                variant="outline"
                size="sm"
              >
                Test Set Values
              </Button>
              <Button
                onClick={handleGithubCompare}
                disabled={isLoadingGithub}
                className="px-8"
              >
                {isLoadingGithub ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching from GitHub...
                  </>
                ) : usePullRequest ? (
                  "Fetch PR Files"
                ) : (
                  "Find Changed Files"
                )}
              </Button>
            </div>

            {/* Show changed files if available */}
            {changedFiles.length > 0 && (
              <div className="mt-4 p-4 border border-border rounded-md bg-muted/50">
                <h4 className="font-medium text-foreground mb-3">
                  Changed Files ({changedFiles.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {changedFiles.map((file) => (
                    <div
                      key={file.filename}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                        selectedFiles.includes(file.filename)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleFileSelection(file.filename)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.filename)}
                          onChange={() => handleFileSelection(file.filename)}
                          className="rounded"
                        />
                        <span className="font-mono text-sm">
                          {file.filename}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            file.status === "added"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                              : file.status === "modified"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          }`}
                        >
                          {file.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {file.changes &&
                          `+${file.additions} -${file.deletions}`}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={generateDiffForSelectedFiles}
                      disabled={isLoadingGithub}
                      className="px-6"
                    >
                      {isLoadingGithub ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Diff...
                        </>
                      ) : (
                        `Generate Diff for ${selectedFiles.length} File${
                          selectedFiles.length > 1 ? "s" : ""
                        }`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground text-center">
              <p>
                Compare files between different repositories, branches, or forks
              </p>
              <p>
                <strong>Smart file detection:</strong> Same repository?
                Automatically finds changed files. Different repositories?
                Automatically detects common files like package.json, README.md,
                etc.
              </p>
              <p className="text-xs">
                Examples: <code>facebook/react:main</code> vs{" "}
                <code>facebook/react:develop</code> (same repo),
                <br />
                <code>user1/repo:main</code> vs <code>user2/fork:main</code>{" "}
                (different repos)
              </p>
            </div>
          </div>
        )}
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
  // Use the proven diff library to generate a proper unified diff
  return createPatch(fileName, original, updated, "original", "updated", {
    context: 3,
  });
}