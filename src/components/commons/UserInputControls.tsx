import {Button} from "@/components/shadcn/ui/button";
import {Upload} from "lucide-react";
import React from "react";
import {cn} from "@/lib/cn";

export default function UserInputControls(props: {
    setInput: (input: string) => void,
    containerClassName?: string
}) {

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
        <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="mr-2 h-4 w-4"/> Upload File
        </Button>
        <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".*/*"
        />
        <Button variant="outline" onClick={() => props.setInput("")}>Clear</Button>
    </div>
}