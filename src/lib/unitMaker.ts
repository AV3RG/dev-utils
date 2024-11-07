export default function unitMaker(value: number): [number, string | null] {
    if (value < 1024) return [value, null]
    const units = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"]
    let unit = null
    for (let i = 0; i < units.length; i++) {
        const unitValue = Math.pow(1024, i + 1)
        if (value < unitValue) {
            unit = units[i]
            return [value / Math.pow(1024, i), unit]
        }
    }
    return [value, null]
}
