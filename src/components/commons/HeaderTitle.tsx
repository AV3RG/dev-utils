"use client";

import {usePathname} from "next/navigation";
import utils from "@/const/utils";

export default function HeaderTitle() {

    const pathName = usePathname()

    const utilTitle = (path: string) => {
        return utils.find((utilData) => utilData.pathName == path)?.displayName || path
    }

    return (
        <span className={"font-semibold text-xl"}>
            {utilTitle(pathName)}
        </span>
    )
}