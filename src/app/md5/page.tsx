'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import {AlertCircle} from "lucide-react"
import debounce from 'lodash.debounce'
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";
import CryptoJS from 'crypto-js'

const md5Calculator = (value: string) => {
    if (!value.trim()) {
        return { parsed: null, error: null }
    }
    try {
        const hash = CryptoJS.MD5(value)
        return { parsed: hash.toString(CryptoJS.enc.Hex), error: null }
    } catch (e) {
        console.error("Error while parsing JSON:", e)
        return { parsed: null, error: 'Invalid JSON: Please check your input.' }
    }
}

export default function Md5() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const md5Checksum = useCallback(
        debounce(() => {
            const { parsed, error } = md5Calculator(input)
            if (error) {
                setError(error)
            } else {
                setOutput(parsed || "")
                setError('')
            }
        }, 300),
        [input]
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setInput(value)
    }

    useEffect(() => {
        md5Checksum()
    }, [input, md5Checksum])

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">MD5 Checksum Calculator</h1>
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
            <div className="">
                <div className={"h-14"}>
                    <h2 className="text-sm font-medium text-gray-700 mb-2">MD5 Checksum</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto h-full relative">
                        <ClickToCopy toCopySupplier={() => output} buttonClassName={"absolute right-3 top-3"}/>
                        <code>{output}</code>
                    </pre>
                </div>
                <div className={"h-full mt-10"}>
                    <label htmlFor="md5-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Input String
                    </label>
                    <Textarea
                        id="md5-input"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type or paste your input string here..."
                        className="min-h-[300px] h-full"
                    />
                </div>

            </div>
        </div>
    )
}