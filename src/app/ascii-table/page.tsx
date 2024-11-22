"use client"

import {useMemo, useState} from 'react'
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/ui/table"

function searchScore(searchTerm: string, char: string, decimal: number, hex: string) {
    const exactCharScore = char === searchTerm ? 1000 : 0
    const charScore = char.toLowerCase().includes(searchTerm.toLowerCase()) ? 100 : 0
    const decimalScore = decimal.toString().includes(searchTerm) ? 1 : 0
    const hexScore = hex.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0
    return exactCharScore + charScore + decimalScore + hexScore
}

export default function ASCIITable() {
    const [searchTerm, setSearchTerm] = useState('')

    const generateASCIITable = () => {
        const table = []
        for (let i = 0; i < 128; i++) {
            table.push({
                char: i >= 32 && i <= 126 ? String.fromCharCode(i) : '',
                decimal: i,
                hex: i.toString(16).padStart(2, '0').toUpperCase(),
                description: getASCIIDescription(i)
            })
        }
        return table
    }

    const getASCIIDescription = (code: number) => {
        if (code < 32) return 'Control character'
        if (code === 32) return 'Space'
        if (code === 127) return 'Delete'
        return 'Printable character'
    }

    const asciiTable = generateASCIITable()

    const filteredTable = useMemo(() => {
        return asciiTable
            .map((item) => {
                return {...item, score: searchScore(searchTerm, item.char, item.decimal, item.hex)}
            })
            .sort((a, b) => b.score - a.score)
            .filter((item) => item.score > 0)
    }, [asciiTable, searchTerm])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">ASCII Table</h1>
            <div className="mb-4">
                <Label htmlFor="search">Search</Label>
                <Input
                    type="text"
                    id="search"
                    placeholder="Search by character, decimal, hex, or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>
            <Table>
                <TableCaption>ASCII Table (0-127)</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Character</TableHead>
                        <TableHead>Decimal</TableHead>
                        <TableHead>Hexadecimal</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTable.map((item) => (
                        <TableRow key={item.decimal}>
                            <TableCell>{item.char || '-'}</TableCell>
                            <TableCell>{item.decimal}</TableCell>
                            <TableCell>{item.hex}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
