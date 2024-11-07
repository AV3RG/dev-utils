import { Github } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/shadcn/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/ui/card"

export default function Component() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Welcome to Dev Utils
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                A collection of developer utility functions built in free time and used frequently across different projects.
                            </p>
                            <div className="space-x-4 flex items-center">
                                <Link href="#utils">
                                    <Button>Explore Utils</Button>
                                </Link>
                                <Link href="https://github.com/AV3RG/dev-utils" target={"_blank"}>
                                    <Button variant="outline">
                                        <Github className="mr-2 h-4 w-4" />
                                        GitHub
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="utils" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">Available Utils</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>String Info</CardTitle>
                                    <CardDescription>Get all the info about a string that you will need.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Word count, Byte Count, Line Endings and much more.</p>
                                </CardContent>
                                <CardFooter>
                                    <Link href="/strinfo">
                                        <Button>Try It</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Color Converter</CardTitle>
                                    <CardDescription>Convert between different color formats.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>HEX, RGB, HSL, and more. (Coming Soon)</p>
                                </CardContent>
                                <CardFooter>
                                    <Button disabled>Coming Soon</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 <Link href={"https://github.com/AV3RG"} className={"underline underline-offset-2"}>AV3RG</Link>. All rights reserved.</p>
            </footer>
        </div>
    )
}