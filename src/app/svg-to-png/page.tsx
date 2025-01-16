"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {Alert, AlertDescription} from "@/components/shadcn/ui/alert";
import {AlertCircle, Check, Clipboard, Settings, Upload} from "lucide-react";
import UserInvisibleInputControls from "@/components/commons/UserInvisibleInputControls";
import {Card, CardContent, CardHeader} from "@/components/shadcn/ui/card";
import {Button} from "@/components/shadcn/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shadcn/ui/dialog";
import {Label} from "@/components/shadcn/ui/label";
import {Input} from "@/components/shadcn/ui/input";
import {useToast} from "@/hooks/use-toast";

export default function SvgToPng() {

    const [svgTag, setSvgTag] = useState<string>('');
    const [height, setHeight] = useState<number>(600);
    const [width, setWidth] = useState<number>(600);
    const [imageEncodedUrl, setImageEncodedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>("fasdfsda");
    const { toast } = useToast();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const convertSvgToImage = useCallback(() => {
        try {
            const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgTag)}`;
            const image = new Image();
            image.onload = () => {
                if (canvasRef.current === null) {
                    throw new Error("No canvas element loaded");
                }
                console.log("aaaaa");
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");
                if (context === null) {
                    throw new Error("Unable to load 2d context in canvas");
                }
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0);
                const png = canvas.toDataURL("image/png");
                setImageEncodedUrl(png)
                setError(null)
            }
            image.onerror = (e) => {
                console.error("Deep error on load image", e);
                setError("Error occurred while converting image");
                setImageEncodedUrl(null);
            }

            image.src = svgUrl;

        } catch (error) {
            console.error("Error occurred while creating image", error);
            setError("An error occurred while loading the image");
            setImageEncodedUrl(null);
        }
    }, [width, height, svgTag]);

    useEffect(() => {
        if (svgTag) {
            convertSvgToImage()
        }
    })

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">SVG To PNG</h1>
            </div>
            <div className="flex items-center justify-between mb-4">
                <UserInvisibleInputControls
                    setInput={setSvgTag}
                    setErrorMessage={setError}
                    dialogTexts={{
                        title: "SVG to PNG",
                        description: "Paste your SVG XML tag here"
                    }}
                    containerClassName={"justify-start"}
                    extraControls={() => {
                        return <>
                            <Button variant="secondary" disabled={!imageEncodedUrl} onClick={() => {
                                canvasRef.current?.toBlob(async (blob) => {
                                    if (!blob) {
                                        toast({
                                            title: "Error",
                                            description: "Error occurred while copying image",
                                            variant: "destructive"
                                        })
                                        return
                                    }
                                    await navigator.clipboard.write([
                                        new ClipboardItem({ [blob.type]: blob }),
                                    ]);
                                    toast({
                                        title: <div><Check /><span className={"ml-2"}>Copied!</span></div>,
                                        description: "Successfully copied",
                                        variant: "default"
                                    })
                                })
                            }}>
                                <Clipboard className="mr-2 h-4 w-4"/> Copy Image to Clipboard
                            </Button>
                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="ghost" disabled={!imageEncodedUrl}>
                                        <Settings className="mr-2 h-4 w-4"/> Adjust
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Adjust PNG Settings</DialogTitle>
                                        <DialogDescription>Adjust the size and other settings related to the output</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="flex items-center">
                                            <Label htmlFor="width" className="text-right">
                                                Dimensions
                                            </Label>
                                            <div className={"relative h-fit ml-4"}>
                                                <span className={"text-xs absolute transform top-1/2 -translate-y-1/2 left-2 text-gray-400"}>W</span>
                                                <Input id="width" value="100" className="w-[100px] pl-6" type={"number"} />
                                            </div>
                                            <span className={"text-xs text-gray-400 ml-2"}>px</span>
                                            <span className={"ml-4"}>X</span>
                                            <div className={"relative h-fit ml-4"}>
                                                <span
                                                    className={"text-xs absolute transform top-1/2 -translate-y-1/2 left-2 text-gray-400"}>H</span>
                                                <Input id="height" value="100" className="w-[100px] pl-6" type={"number"}/>
                                            </div>
                                            <span className={"text-xs text-gray-400 ml-2"}>px</span>

                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    }}
                />
                <div>
                    {error && (
                        <Alert variant="destructive"
                               className={"p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"}>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            <Card>
                <CardHeader className={"font-semibold text-xl"}>Image will be displayed here</CardHeader>
                <CardContent>
                    <canvas ref={canvasRef}></canvas>
                </CardContent>
            </Card>
        </div>
    )
}