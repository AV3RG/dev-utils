import {Button} from "@/components/shadcn/ui/button";
import {Link2, Upload} from "lucide-react";
import React from "react";
import {cn} from "@/lib/cn";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shadcn/ui/dialog";
import {Label} from "@/components/shadcn/ui/label";
import {Input} from "@/components/shadcn/ui/input";

export default function UserInputControls(props: {
    setInput: (input: string) => void,
    containerClassName?: string,
    setErrorMessage: (message: string) => void,
    overrideFileUploadId?: string
}) {

    const fileUploadId = props.overrideFileUploadId || "file-upload"

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result as string
                props.setInput(content)
            }
            reader.readAsText(file)
        }
    }

    const handleLoadFromUrl = async (url: string) => {
        try {
            console.log("Fetching data from URL:", url)
            const response = await fetch(url)
            const contentType = response.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) {
                props.setErrorMessage?.("Invalid content type. Please provide a URL that returns JSON.")
            }
            const data = await response.json()
            props.setInput(JSON.stringify(data, null, 2))
        } catch (e) {
            props.setErrorMessage("Error while fetching data from URL. Please check the URL and try again.")
            console.error("Error while fetching data from URL:", e)
        }
    }

    return <Dialog>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Enter the URL</DialogTitle>
                <DialogDescription>
                    Enter the URL of the resource you want to load.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                        Link
                    </Label>
                    <Input
                        id="link"
                        defaultValue="https://devutils.rohan.gg/sample_data.json"
                    />
                </div>
            </div>
            <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                    <Button type="button" variant="default" onClick={async () => {
                        await handleLoadFromUrl((document.getElementById("link") as HTMLInputElement).value)
                    }}>
                        Load
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
        <div className={cn("flex items-center justify-end gap-x-4", props.containerClassName)}>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <Link2 className={"mr-2 h-4 w-4"}/> Load from URL
                </Button>
            </DialogTrigger>
            <Button variant="outline" onClick={() => document.getElementById(fileUploadId)?.click()}>
                <Upload className="mr-2 h-4 w-4"/> Upload File
            </Button>
            <input
                id={fileUploadId}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".*/*"
            />
            <Button variant="outline" onClick={() => props.setInput("")}>Clear</Button>
        </div>
    </Dialog>
}