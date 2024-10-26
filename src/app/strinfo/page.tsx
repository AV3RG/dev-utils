'use client'

import {useState, useCallback, useMemo} from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import unitMaker from "@/lib/unitMaker";
import detectLineEndings from "@/lib/lineEndings";

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

    const stats = calculateStats(text)

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">String Utility</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Enter your text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        className="w-full mb-4 p-2 border rounded"
                        aria-label="Input text"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <NumStatCard title="Character Count" value={stats.characterCount} />
                        <NumStatCard title="Word Count" value={stats.wordCount} />
                        <NumStatCard title="Line Count" value={stats.lineCount} />
                        <NumStatCard title="Byte Size" value={stats.byteSize} unit={"B"} />
                        <NumStatCard title="Sentence Count" value={stats.sentenceCount} />
                        <StatCard title={"Line Endings"} value={stats.lineEndings.join(", ")} />
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

function NumStatCard({ title, value, unit }: { title: string; value: number, unit?: string }) {

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