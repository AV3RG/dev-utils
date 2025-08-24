'use client'

import React, {useState, useEffect, useCallback} from 'react'
import { Textarea } from "@/components/shadcn/ui/textarea"
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert"
import {AlertCircle} from "lucide-react"
import debounce from 'lodash.debounce'
import ClickToCopy from "@/components/commons/ClickToCopy";
import UserInputControls from "@/components/commons/UserInputControls";

export default function JsonToTs() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertJsonToTs = (obj: any, indent = 0): string => {
        if (Array.isArray(obj)) {
            const itemType = obj.length > 0 ? convertJsonToTs(obj[0]) : 'any'
            return `Array<${itemType}>`
        } else if (typeof obj === 'object' && obj !== null) {
            let output = '{\n'
            for (const [key, value] of Object.entries(obj)) {
                output += `${'  '.repeat(indent + 1)}${key}: ${convertJsonToTs(value, indent + 1)};\n`
            }
            output += `${'  '.repeat(indent)}}`
            return output
        } else {
            return typeof obj
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleConvert = useCallback(debounce(() => {
        try {
            const jsonObj = JSON.parse(input)
            const tsType = `type GeneratedType = ${convertJsonToTs(jsonObj)}`
            setOutput(tsType)
            setError('')
        } catch (err) {
            setError('Invalid JSON input. Please check your JSON and try again.')
            setOutput('')
            console.error('Error while converting JSON to TS:', err)
        }
    }), [convertJsonToTs, input])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setInput(value)
    }

    useEffect(() => {
        if (input) {
            handleConvert()
        }
    }, [handleConvert, input])

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            TS Type/Interface Extractor
          </h1>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            {error && (
              <Alert
                variant="destructive"
                className={
                  "p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <UserInputControls
            setInput={setInput}
            setErrorMessage={setError}
            sampleDataUrl={"https://devutils.rohan.gg/samples/json-to-ts.json"}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="json-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Input
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
            <h2 className="text-sm font-medium text-foreground mb-2">
              Extracted Type
            </h2>
            <pre className="bg-muted p-4 rounded-md overflow-auto h-full min-h-[300px] relative text-foreground">
              <ClickToCopy
                toCopySupplier={() => output}
                buttonClassName={"absolute right-4 top-4"}
              />
              <code>{output}</code>
            </pre>
          </div>
        </div>
      </div>
    );
}