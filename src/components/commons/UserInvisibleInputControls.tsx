import {Button} from "@/components/shadcn/ui/button";
import {TextCursorInput, Upload} from "lucide-react";
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
import {Textarea} from "@/components/shadcn/ui/textarea";

export default function UserInvisibleInputControls(props: {
    setInput: (input: string) => void,
    containerClassName?: string,
    setErrorMessage: (message: string) => void,
    overrideFileUploadId?: string,
    sampleDataUrl?: string,
    dialogTexts: {
        title: string,
        description: string,
    },
    extraControls?: () => React.ReactNode,
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

    return <div className={cn("flex items-center justify-end gap-x-4", props.containerClassName)}>
            <Dialog>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{props.dialogTexts.title}</DialogTitle>
                        <DialogDescription>
                            {props.dialogTexts.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Textarea
                                id="invisible_data"
                                defaultValue={props.sampleDataUrl}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="default" onClick={async () => {
                                props.setInput((document.getElementById("invisible_data") as HTMLTextAreaElement).value)
                            }}>
                                Load
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
                <DialogTrigger asChild>
                    <Button variant={"outline"}>
                        <TextCursorInput className={"mr-2 h-4 w-4"}/> Raw Input
                    </Button>
                </DialogTrigger>
            </Dialog>
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
            {props.extraControls?.() || <></>}
        </div>
}