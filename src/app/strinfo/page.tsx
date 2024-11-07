'use client'

import { useState, useCallback, useMemo, ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/ui/tooltip"
import { Button } from "@/components/shadcn/ui/button"
import {AlertCircle, Upload} from "lucide-react"
import unitMaker from "@/lib/unitMaker"
import detectLineEndings from "@/lib/lineEndings"
import {Alert, AlertDescription, AlertTitle} from "@/components/shadcn/ui/alert";

export default function StrInfo() {
    const [text, setText] = useState('')

    const calculateStats = useCallback((input: string) => {
        const characterCount = input.length
        const wordCount = input.trim().split(/\s+/).filter(Boolean).length
        const lineCount = input.split('\n').filter(Boolean).length
        const byteSize = new Blob([input]).size
        const sentenceCount = input.split(/[.!?]+/).filter(Boolean).length
        const lineEndings = detectLineEndings(input)
        if (lineEndings.length === 0) lineEndings.push("N/A")

        return { characterCount, wordCount, lineCount, byteSize, sentenceCount, lineEndings }
    }, [])

    const stats = useMemo(() => calculateStats(text), [text, calculateStats])

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result as string
                setText(content)
            }
            reader.readAsText(file)
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">String Utility</CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-y-4"}>
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload File
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".*/*"
                        />
                        <Button variant="outline" onClick={() => setText('')}>Clear</Button>
                    </div>
                    <Textarea
                        placeholder="Enter your text here or upload a file..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        className="w-full p-2 border rounded"
                        aria-label="Input text"
                    />
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Line Endings</AlertTitle>
                        <AlertDescription>
                            Browsers will change line endings to LF when pasting text. Use the upload feature to preserve line endings.
                            Upon any modification to the file uploaded, the line endings will be converted to LF.
                        </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <NumStatCard title="Character Count" value={stats.characterCount} />
                        <NumStatCard title="Word Count" value={stats.wordCount} />
                        <NumStatCard title="Line Count" value={stats.lineCount} />
                        <NumStatCard title="Byte Size" value={stats.byteSize} unit="B" />
                        <NumStatCard title="Sentence Count" value={stats.sentenceCount} />
                        <StatCard title="Line Endings" value={stats.lineEndings.join(", ")} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    )
}

function NumStatCard({ title, value, unit }: { title: string; value: number; unit?: string }) {
    const [displayValue, additionalUnit] = unitMaker(value)
    const displayFormatted = useMemo(() => {
        if (additionalUnit) return displayValue.toFixed(2)
        return displayValue.toFixed(0)
    }, [displayValue, additionalUnit])

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                            <p className="text-2xl font-bold">{displayFormatted} {additionalUnit}{unit}</p>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm text-gray-500">Exact: {value} {unit}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}