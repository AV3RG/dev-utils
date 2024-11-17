"use client";

import React, { useState } from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/shadcn/ui/card";
import {Alert, AlertDescription} from "@/components/shadcn/ui/alert";
import {AlertCircle} from "lucide-react";
import UserInputControls from "@/components/commons/UserInputControls";
import {Textarea} from "@/components/shadcn/ui/textarea";
import ClickToCopy from "@/components/commons/ClickToCopy";

export default function Base64() {

    const [decoded, setDecoded] = useState<string>('')
    const [encoded, setEncoded] = useState<string>('')
    const [encodingError, setEncodingError] = useState<string>('')
    const [decodingError, setDecodingError] = useState<string>('')

    const handleDecodedChange = (normalValue: string) => {
        try {
            setDecoded(normalValue)
            setEncodingError('')
            setEncoded(Buffer.from(normalValue).toString('base64'))
        } catch (e) {
            setEncodingError('Error while encoding the input.')
            console.error('Error while encoding the input:', e)
        }
    }

    const handleEncodedChange = (encodedValue: string) => {
        try {
            setEncoded(encodedValue)
            setDecodingError('')
            setDecoded(Buffer.from(encodedValue, 'base64').toString())
        } catch (e) {
            setDecodingError('Error while decoding the input.')
            console.error('Error while decoding the input:', e)
        }
    }

    return (
        <div className={"container mx-auto p-4"}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Base 64 Encoder/Decoder</h1>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Decoded Text</CardTitle>
                    </CardHeader>
                    <CardContent className={"min-h-full"}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                {decodingError && (
                                    <Alert variant="destructive"
                                           className={"p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"}>
                                        <AlertCircle className="h-4 w-4"/>
                                        <AlertDescription>{decodingError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                        <UserInputControls
                            setInput={handleDecodedChange}
                            setErrorMessage={setEncodingError}
                            overrideFileUploadId={"decoded-file-upload"}
                        />
                        <div className="mt-4 h-full relative">
                            <Textarea
                                id={"decoded-textarea"}
                                value={decoded}
                                onChange={(e) => handleDecodedChange(e.target.value)}
                                placeholder={"Type or paste your text here..."}
                                className={"min-h-[300px] h-full"}
                            />
                            <ClickToCopy toCopySupplier={() => decoded} buttonClassName={"absolute right-4 top-4 z-50"}/>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Encoded Text</CardTitle>
                    </CardHeader>
                    <CardContent className={"min-h-full"}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                {encodingError && (
                                    <Alert variant="destructive"
                                           className={"p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"}>
                                        <AlertCircle className="h-4 w-4"/>
                                        <AlertDescription>{encodingError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                        <UserInputControls
                            setInput={handleEncodedChange}
                            setErrorMessage={setDecodingError}
                            overrideFileUploadId={"encoded-file-upload"}
                        />
                        <div className="mt-4 h-full relative">
                            <Textarea
                                id={"encoded-textarea"}
                                value={encoded}
                                onChange={(e) => handleEncodedChange(e.target.value)}
                                placeholder={"Type or paste your text here..."}
                                className={"min-h-[300px] h-full"}
                            />
                            <ClickToCopy toCopySupplier={() => encoded} buttonClassName={"absolute right-4 top-4"}/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

}