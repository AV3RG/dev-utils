"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
        h = s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255)
    let m = 1 - (g / 255)
    let y = 1 - (b / 255)
    let k = Math.min(c, m, y)

    c = Math.round(((c - k) / (1 - k)) * 100) || 0
    m = Math.round(((m - k) / (1 - k)) * 100) || 0
    y = Math.round(((y - k) / (1 - k)) * 100) || 0
    k = Math.round(k * 100)

    return { c, m, y, k }
}

const rgbToHwb = (r: number, g: number, b: number) => {
    const { h } = rgbToHsl(r, g, b)
    const w = Math.min(r, g, b) / 255
    const b_ = 1 - Math.max(r, g, b) / 255
    return { h, w: Math.round(w * 100), b: Math.round(b_ * 100) }
}

export default function ColorConverter() {
    const [color, setColor] = useState({
        hex: "#000000",
        rgb: { r: 0, g: 0, b: 0, a: 1 },
        hsl: { h: 0, s: 0, l: 0, a: 1 },
        cmyk: { c: 0, m: 0, y: 0, k: 100 },
        hwb: { h: 0, w: 0, b: 100 }
    })

    const updateColor = (format: string, value: string) => {
        let newColor = { ...color }

        switch (format) {
            case 'hex':
                newColor.hex = value
                const rgb = hexToRgb(value)
                if (rgb) {
                    newColor.rgb = { ...rgb, a: newColor.rgb.a }
                    newColor.hsl = { ...rgbToHsl(rgb.r, rgb.g, rgb.b), a: newColor.hsl.a }
                    newColor.cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
                    newColor.hwb = rgbToHwb(rgb.r, rgb.g, rgb.b)
                }
                break
            case 'rgb':
            case 'rgba':
                const [r, g, b, a = newColor.rgb.a] = value.split(',').map(Number)
                newColor.rgb = { r, g, b, a }
                newColor.hex = rgbToHex(r, g, b)
                newColor.hsl = { ...rgbToHsl(r, g, b), a }
                newColor.cmyk = rgbToCmyk(r, g, b)
                newColor.hwb = rgbToHwb(r, g, b)
                break
            case 'hsl':
            case 'hsla':
                const [h, s, l, a_hsl = newColor.hsl.a] = value.split(',').map(Number)
                newColor.hsl = { h, s, l, a: a_hsl }
                break
            case 'cmyk':
                const [c, m, y, k] = value.split(',').map(Number)
                newColor.cmyk = { c, m, y, k }
                break
            case 'hwb':
                const [h_hwb, w, b2] = value.split(',').map(Number)
                newColor.hwb = { h: h_hwb, w, b2 }
                break
        }

        setColor(newColor)
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Color Format Converter</CardTitle>
                <CardDescription>Convert between RGB, RGBA, HEX, HSL, HSLA, CMYK, and HWB color formats</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="hex">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                        <TabsTrigger value="hex">HEX</TabsTrigger>
                        <TabsTrigger value="rgb">RGB(A)</TabsTrigger>
                        <TabsTrigger value="hsl">HSL(A)</TabsTrigger>
                        <TabsTrigger value="cmyk">CMYK</TabsTrigger>
                        <TabsTrigger value="hwb">HWB</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hex">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="hex">HEX</Label>
                            <Input
                                type="text"
                                id="hex"
                                value={color.hex}
                                onChange={(e) => updateColor('hex', e.target.value)}
                                placeholder="#000000"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="rgb">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="rgb">RGB(A)</Label>
                            <Input
                                type="text"
                                id="rgb"
                                value={`${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a}`}
                                onChange={(e) => updateColor('rgba', e.target.value)}
                                placeholder="0,0,0,1"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="hsl">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="hsl">HSL(A)</Label>
                            <Input
                                type="text"
                                id="hsl"
                                value={`${color.hsl.h},${color.hsl.s},${color.hsl.l},${color.hsl.a}`}
                                onChange={(e) => updateColor('hsla', e.target.value)}
                                placeholder="0,0%,0%,1"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="cmyk">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="cmyk">CMYK</Label>
                            <Input
                                type="text"
                                id="cmyk"
                                value={`${color.cmyk.c},${color.cmyk.m},${color.cmyk.y},${color.cmyk.k}`}
                                onChange={(e) => updateColor('cmyk', e.target.value)}
                                placeholder="0,0,0,100"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="hwb">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="hwb">HWB</Label>
                            <Input
                                type="text"
                                id="hwb"
                                value={`${color.hwb.h},${color.hwb.w},${color.hwb.b}`}
                                onChange={(e) => updateColor('hwb', e.target.value)}
                                placeholder="0,0%,100%"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 grid gap-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label>Color Preview</Label>
                        <div
                            className="w-full h-20 rounded-md border"
                            style={{ backgroundColor: color.hex }}
                        ></div>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label>All Formats</Label>
                        <div className="grid gap-2 text-sm">
                            <p>HEX: {color.hex}</p>
                            <p>RGB: rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</p>
                            <p>RGBA: rgba({color.rgb.r}, {color.rgb.g}, {color.rgb.b}, {color.rgb.a})</p>
                            <p>HSL: hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</p>
                            <p>HSLA: hsla({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%, {color.hsl.a})</p>
                            <p>CMYK: cmyk({color.cmyk.c}%, {color.cmyk.m}%, {color.cmyk.y}%, {color.cmyk.k}%)</p>
                            <p>HWB: hwb({color.hwb.h}, {color.hwb.w}%, {color.hwb.b}%)</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}