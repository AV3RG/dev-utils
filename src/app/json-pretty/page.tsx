'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import {AlertCircle} from "lucide-react"
import debounce from 'lodash.debounce'
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";

export default function JsonPretty() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')

    const parseJSON = (value: string) => {
        if (!value.trim()) {
            return { parsed: null, error: null }
        }
        try {
            return { parsed: JSON.parse(value), error: null }
        } catch (e) {
            console.error("Error while parsing JSON:", e)
            return { parsed: null, error: 'Invalid JSON: Please check your input.' }
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const prettifyJSON = useCallback(
        debounce(() => {
            const { parsed, error } = parseJSON(input)
            if (error) {
                setError(error)
            } else {
                setOutput(JSON.stringify(parsed, null, 2))
                setError('')
            }
        }, 300),
        [parseJSON, input]
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setInput(value)
    }

    useEffect(() => {
        if (input) {
            prettifyJSON()
        }
    }, [input, prettifyJSON])

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">JSON Prettifier</h1>
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
                <UserInputControls setInput={setInput} setErrorMessage={setError} />
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
                        <ClickToCopy toCopySupplier={() => output} buttonClassName={"absolute right-4 top-4"} />
                        <code>{output}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}