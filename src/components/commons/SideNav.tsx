"use client";

import Link from "next/link";
import {cn} from "@/lib/cn";
import {Loader, LucideIcon} from "lucide-react";
import React from "react";
import {usePathname} from "next/navigation";
import utils from "@/const/utils";

function SideItem(props: {
    pathName: string,
    icon: LucideIcon,
    displayName: string
}) {

    const currentPath = usePathname()

    const isActive = (path: string) => {
        return currentPath === path
    }

    return <Link
        href={props.pathName}
        className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
            {
                "bg-muted": isActive(props.pathName),
                "text-muted-foreground": !isActive(props.pathName),
            }
        )}
    >
        <props.icon className={"h-4 w-4"} />
        {props.displayName}
    </Link>
}

export default function SideNav() {

    return <nav className="grid items-start px-2 text-sm font-medium lg:px-4">

        {utils.map((utilData) => {
            return <SideItem key={utilData.pathName} pathName={utilData.pathName} icon={utilData.icon} displayName={utilData.displayName} />
        })}

        <Link
            href="#"
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                {
                    "bg-muted": false,
                    "text-muted-foreground": true,
                }
            )}
        >
            <Loader className="h-4 w-4"/>
            More Coming Soon...
        </Link>
    </nav>
}