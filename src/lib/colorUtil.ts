type ColorType = [
    "RGB",
    "RGBA",
    "RGB_OPACITY",
    "HEX",
    "HSL",
    "HSLA",
    "CMYK",
    "HWB",
][number]

export default function colorConverter(
    from: ColorType,
    to: ColorType,
    value: string,
    context?: {
        backgroundColor?: string,
        decimalPlaces?: number
    },
): string {

    if (from === to) return value
    if (from !== "RGBA" && to !== "RGBA") {
        const rgbaValue = colorConverter(from, "RGBA", value)
        return colorConverter("RGBA", to, rgbaValue)
    }
    if (from === "RGBA") {
        switch (to) {
            case "RGB": {
                // eslint-disable-next-line prefer-const
                let [r, g, b, a] = value.split(",").map(Number)
                const [br, bg, bb] = context?.backgroundColor?.split(",").map(Number) || [255, 255, 255]
                r = Math.round(r * a + br * (1 - a))
                g = Math.round(g * a + bg * (1 - a))
                b = Math.round(b * a + bb * (1 - a))
                return `${r},${g},${b}`
            }
            case "RGB_OPACITY": {
                const [r, g, b, a] = value.split(",").map(Number)
                return `${r},${g},${b},${a}`
            }
            case "HEX": {
                const rgb = colorConverter("RGBA", "RGB", value, context)
                const [r, g, b] = rgb.split(",").map(Number).map((v) => v.toString(16).padStart(2, "0"))
                return `${r}${g}${b}`
            }
            case "HSL": {
                const [r, g, b] = colorConverter("RGBA", "RGB", value, context)
                    .split(",")
                    .map(Number)
                    .map((v) => v / 255)
                const [h, s, l] = rgbToHsl(r, g, b)
                return `${h},${Math.round(s * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(l * 100).toFixed(context?.decimalPlaces || 1)}`
            }
            case "HSLA": {
                const [r, g, b, a] = value.split(",").map(Number)
                const [h, s, l] = rgbToHsl(r, g, b)
                return `${h},${Math.round(s * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(l * 100).toFixed(context?.decimalPlaces || 1)},${a}`
            }
            case "CMYK": {
                let [c, m, y] = colorConverter("RGBA", "RGB", value, context)
                    .split(",")
                    .map(Number)
                    .map((v) => v / 255)
                    .map((v) => 1 - v)
                const k = Math.min(c, m, y)
                if (k === 1) c = m = y = 0
                else {
                    c = (c - k) / (1 - k)
                    m = (m - k) / (1 - k)
                    y = (y - k) / (1 - k)
                }
                return `${Math.round(c * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(m * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(y * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(k * 100).toFixed(context?.decimalPlaces || 1)}`
            }
            case "HWB": {
                const [r, g, b] = colorConverter("RGBA", "RGB", value, context)
                    .split(",")
                    .map(Number)
                    .map((v) => v / 255)
                const max = Math.max(r, g, b)
                const min = Math.min(r, g, b)
                const hue = hueFromRgb(r, g, b, max, max - min)
                const w = min
                const b_ = 1 - max
                return `${hue},${Math.round(w * 100).toFixed(context?.decimalPlaces || 1)},${Math.round(b_ * 100).toFixed(context?.decimalPlaces || 1)}`
            }
        }
    }
    else if (to === "RGBA") {
        // TODO: Implement conversion from other formats to RGBA
        throw new Error("Conversion to RGBA is not implemented")
    }
    throw new Error("Conversion Under Works")
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const lightness = (max + min) / 2
    const saturation = delta ? 0 : (delta) / (1 - Math.abs(2 * lightness - 1))
    const hue = hueFromRgb(r, g, b, max, delta)
    return [hue, saturation, lightness]
}

function hueFromRgb(r: number, g: number, b: number, max: number, delta: number): number {
    let hue = undefined
    if (delta === 0) return 0
    else if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else if (max === b) hue = (r - g) / delta + 4
    if (hue === undefined) throw new Error("hue is undefined")
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    return hue
}