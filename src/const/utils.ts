import {FileJson2, LucideIcon, Sparkles, Volleyball, WholeWord} from "lucide-react";

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
  }
]

export default utils;