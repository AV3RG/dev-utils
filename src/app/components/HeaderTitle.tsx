"use client";

import {usePathname} from "next/navigation";

export default function HeaderTitle() {

    const pathName = usePathname()

    const utilTitle = (path: string) => {
        switch (path) {
            case "/color-converter":
                return "Color Converter"
            case "/strinfo":
                return "String Info"
            case "/":
                return "Dashboard"
            default:
                return path
        }
    }

    return (
        <span className={"font-semibold text-xl"}>
            {utilTitle(pathName)}
        </span>
    )
}