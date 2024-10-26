"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import {Loader, WholeWord} from "lucide-react";
import React from "react";
import {usePathname} from "next/navigation";

export default function SideNav() {

    const pathName = usePathname()

    const isActive = (path: string) => {
        return pathName === path
    }

    return <nav className="grid items-start px-2 text-sm font-medium lg:px-4">

        <Link
            href="/strinfo"
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                {
                    "bg-muted": isActive("/strinfo"),
                    "text-muted-foreground": !isActive("/strinfo"),
                }
            )}
        >
            <WholeWord className="h-4 w-4"/>
            String Info
        </Link>
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