'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import { AlertCircle, Download, Loader2 } from "lucide-react"
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";
import { Button } from "@/components/shadcn/ui/button";
import debounce from 'lodash.debounce';
import { createPatch } from 'diff';

export default function DiffGenerator() {
    const [originalFile, setOriginalFile] = useState('')
    const [updatedFile, setUpdatedFile] = useState('')
    const [patchOutput, setPatchOutput] = useState('')
    const [error, setError] = useState('')
    const [fileName, setFileName] = useState('file.txt')
    const [isGenerating, setIsGenerating] = useState(false)

    const generateDiff = useCallback(
        debounce(() => {
            if (!originalFile.trim() && !updatedFile.trim()) {
                setPatchOutput('')
                setError('')
                setIsGenerating(false)
                return
            }

            if (!originalFile.trim()) {
                setError('Original file content is required')
                setPatchOutput('')
                setIsGenerating(false)
                return
            }

            if (!updatedFile.trim()) {
                setError('Updated file content is required')
                setPatchOutput('')
                setIsGenerating(false)
                return
            }

            setIsGenerating(true)
            
            // Use setTimeout to allow UI to update before heavy computation
            setTimeout(() => {
                try {
                    const diff = generateUnifiedDiff(originalFile, updatedFile, fileName)
                    setPatchOutput(diff)
                    setError('')
                } catch (e) {
                    setError('Error generating diff. Please check your input.')
                    setPatchOutput('')
                } finally {
                    setIsGenerating(false)
                }
            }, 0)
        }, 300),
        [originalFile, updatedFile, fileName]
    )

    useEffect(() => {
        generateDiff()
    }, [generateDiff])

    const handleDownloadPatch = () => {
        if (!patchOutput) return
        
        const blob = new Blob([patchOutput], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.patch`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Diff Generator</h1>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                    <strong>How to use:</strong> Enter the original and updated file contents, then download the generated patch file. 
                    The patch can be applied using <code className="bg-blue-100 px-1 rounded">git apply patch-file.patch</code> or 
                    <code className="bg-blue-100 px-1 rounded">patch -p1 &lt; patch-file.patch</code>
                </p>
            </div>
            
            <div>
                <label htmlFor="file-name" className="block text-sm font-medium text-gray-700 mb-2">
                    File Name (for patch header)
                </label>
                <input
                    id="file-name"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter file name (e.g., example.txt)"
                />
                <Button 
                    onClick={() => {
                        setOriginalFile('Hello World\nThis is a sample file\nfor testing the diff generator.\nIt contains multiple lines\nof text content.')
                        setUpdatedFile('Hello World\nThis is a sample file\nfor testing the diff generator.\nIt contains multiple lines\nof updated text content.\nAnd this is a new line.')
                        setFileName('sample.txt')
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                >
                    Load Sample Data
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="original-file" className="block text-sm font-medium text-gray-700">
                            Original File
                        </label>
                        <UserInputControls 
                            setInput={setOriginalFile} 
                            setErrorMessage={setError}
                            overrideFileUploadId="original-file-upload"
                        />
                    </div>
                    <Textarea
                        id="original-file"
                        value={originalFile}
                        onChange={(e) => setOriginalFile(e.target.value)}
                        placeholder="Enter or paste the original file content..."
                        className="min-h-[300px] flex-1 resize-none"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="updated-file" className="block text-sm font-medium text-gray-700">
                            Updated File
                        </label>
                        <UserInputControls 
                            setInput={setUpdatedFile} 
                            setErrorMessage={setError}
                            overrideFileUploadId="updated-file-upload"
                        />
                    </div>
                    <Textarea
                        id="updated-file"
                        value={updatedFile}
                        onChange={(e) => setUpdatedFile(e.target.value)}
                        placeholder="Enter or paste the updated file content..."
                        className="min-h-[300px] flex-1 resize-none"
                    />
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-medium text-gray-700">Generated Patch</h2>
                    {patchOutput && !isGenerating && (
                        <Button onClick={handleDownloadPatch} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Patch
                        </Button>
                    )}
                </div>
                <div className="bg-gray-100 rounded-md border border-gray-200">
                    <pre className="p-4 overflow-auto max-h-[400px] relative">
                        <ClickToCopy toCopySupplier={() => patchOutput} buttonClassName="absolute right-4 top-4 z-10" />
                        <code className="text-sm block">
                            {isGenerating ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating diff...
                                </div>
                            ) : (
                                patchOutput || 'Patch will be generated here...'
                            )}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    )
}

function generateUnifiedDiff(original: string, updated: string, fileName: string): string {
    try {
        // Use the robust diff library to generate the patch
        const patch = createPatch(fileName, original, updated, 'Original', 'Updated', { context: 3 })
        return patch
    } catch (error) {
        console.error('Error generating diff:', error)
        return ''
    }
} 