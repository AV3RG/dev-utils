"use client";

import {usePathname} from "next/navigation";

export default function HeaderTitle() {

    const pathName = usePathname()

    const utilTitle = (path) => {
        switch (path) {
            case "/color-converter":
                return "Color Converter"
            case "/":
                return "Dashboard"
            default:
                return "Page"
        }
    }

    return (
        <span className={"font-semibold text-xl"}>
            {utilTitle(pathName)}
        </span>
    )
}