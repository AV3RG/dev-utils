import {Clipboard} from "lucide-react";
import {Button} from "@/components/shadcn/ui/button";
import React from "react";
import {cn} from "@/lib/cn";
import TWClass from "@/types/TWClass";

export default function ClickToCopy(props: {
    toCopySupplier: () => string,
    buttonClassName?: TWClass,
    clipboardIconClassName?: TWClass,
    iconOverride?: React.ReactNode,
    buttonText?: string,
    buttonTextClassName?: TWClass,
}) {
    return <Button
        className={cn("p-2 w-fit h-fit", props.buttonClassName)}
        size={"icon"}
        onClick={async () => {
            try {
                await navigator.clipboard.writeText(props.toCopySupplier())
            } catch (e) {
                console.error("Error while copying to clipboard:", e)
            }
        }}
    >
        {props.iconOverride || (
            <Clipboard className={cn("h-4 w-4", props.clipboardIconClassName)} />
        )}
        {props.buttonText && <span className="ml-2">{props.buttonText}</span>}
    </Button>
}