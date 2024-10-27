'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {AlertCircle, Clipboard, Settings, Upload} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import debounce from 'lodash.debounce'
import useSettings from "@/store/settingsStorage";

export default function JsonPretty() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')
    const { jsonPretty, jsonPrettyFunctions } = useSettings()

    const parseJSON = (value: string, allowDuplicates: boolean) => {
        if (!value.trim()) {
            return { parsed: null, error: null }
        }

        try {
            const temp: { [key: string]: object } = {}
            JSON.parse(value, (key, value) => {
                console.log(key)
                if (key === '') return value
                console.log(temp[key])
                if (temp[key] && !allowDuplicates) {
                    return { error: 'Duplicate key found: Please enable "Allow duplicate keys" in settings.' }
                } else {
                    temp[key] = value
                }
                return value
            })
            return { parsed: temp, error: null }
        } catch (e) {
            console.error("Error while parsing JSON:", e)
            return { parsed: null, error: 'Invalid JSON: Please check your input.' }
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const prettifyJSON = useCallback(
        debounce((value: string, allowDuplicates: boolean) => {
            const { parsed, error } = parseJSON(value, allowDuplicates)
            if (error) {
                setError(error)
                setOutput('')
            } else {
                setOutput(JSON.stringify(parsed, null, 2))
                setError('')
            }
        }, 300),
        []
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setInput(value)
        prettifyJSON(value, jsonPretty.allowDuplicateObjectKeys)
    }

    useEffect(() => {
        prettifyJSON(input, jsonPretty.allowDuplicateObjectKeys)
    }, [jsonPretty.allowDuplicateObjectKeys, input, prettifyJSON])

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">JSON Prettifier</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={jsonPretty.allowDuplicateObjectKeys}
                            onCheckedChange={(checked) => jsonPrettyFunctions.setAllowDuplicateObjectKeys(checked)}
                        >
                            Allow duplicate keys
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    {error && (
                        <Alert variant="destructive" className={"p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className={"flex items-center justify-end gap-x-4"}>
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                        <Upload className="mr-2 h-4 w-4"/> Upload File
                    </Button>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={() => {}}
                        className="hidden"
                        accept=".*/*"
                    />
                    <Button variant="outline" onClick={() => setInput("")}>Clear</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Input JSON
                    </label>
                    <Textarea
                        id="json-input"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type or paste your JSON here..."
                        className="min-h-[300px] h-full"
                    />
                </div>
                <div>
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Prettified Output</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto h-full min-h-[300px] relative">
                            <Button
                                className={"absolute right-4 top-4 p-2 w-fit h-fit"}
                                size={"icon"}
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(output)
                                    } catch (e) {
                                        console.error("Error while copying to clipboard:", e)
                                    }
                                }}
                            >
                                <Clipboard className={"h-4 w-4"} />
                            </Button>
                            <code>{output}</code>
                        </pre>
                </div>
            </div>
        </div>
    )
}