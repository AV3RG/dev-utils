import {Ampersand, FileJson2, Link2, LucideIcon, PenTool, Sparkles, Volleyball, WholeWord, FileText, MapPin, Split} from "lucide-react";

const utils: {
  pathName: string,
  icon: LucideIcon,
  displayName: string,
  cardDescription: string,
  cardContent: string
}[] = [
  {
    pathName: "/strinfo",
    icon: WholeWord,
    displayName: "String info",
    cardDescription: "Get all the info about a string that you will need.",
    cardContent: "Word count, Byte Count, Line Endings and much more."
  },
  {
    pathName: "/json-pretty",
    icon: Sparkles,
    displayName: "Json Prettifier",
    cardDescription: "Prettify your JSON with ease.",
    cardContent: "Make your JSON more readable and easy to understand."
  },
  {
    pathName: "/json-to-ts",
    icon: FileJson2,
    displayName: "JSON to TS",
    cardDescription: "Convert JSON to TypeScript interfaces.",
    cardContent: "Generate TypeScript interfaces from your JSON data."
  },
  {
    pathName: "/base-64",
    icon: Volleyball,
    displayName: "Base64 Encoder/Decoder",
    cardDescription: "Encode and decode base64 strings.",
    cardContent: "Encode and decode base64 strings with ease."
  },
  {
    pathName: "/uri",
    icon: Link2,
    displayName: "URI Encoder/Decoder",
    cardDescription: "Encode and decode URI strings.",
    cardContent: "Encode and decode URI strings with ease."
  },
  {
    pathName: "/ascii-table",
    icon: Ampersand,
    displayName: "ASCII Table",
    cardDescription: "Get the ASCII table with ease.",
    cardContent: "Get the ASCII table with search functionality."
  },
  {
    pathName: "/svg-to-png",
    icon: PenTool,
    displayName: "SVG To PNG",
    cardDescription: "Convert SVG to PNG with sizing adjustments",
    cardContent: "Generate SVG to PNG with sizing adjustments."
  },
  {
    pathName: "/markdown-visualizer",
    icon: FileText,
    displayName: "Markdown Visualizer",
    cardDescription: "Preview your markdown in real-time",
    cardContent: "Type markdown on the left and see the rendered output on the right."
  },
  {
    pathName: "/ip-info",
    icon: MapPin,
    displayName: "IP Info",
    cardDescription: "Get information about an IP address",
    cardContent: "Get complete information about an IP address, including location, ISP, and more."
  },
  {
    pathName: "/diff-generator",
    icon: Split,
    displayName: "Diff Generator",
    cardDescription: "Generate patch files from original and updated content",
    cardContent: "Create unified diff patches that can be applied with git apply or patch command."
  }
]

export default utils;