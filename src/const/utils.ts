import {FileJson2, LucideIcon, Sparkles, WholeWord} from "lucide-react";

const utils: {
  pathName: string,
  icon: LucideIcon,
  displayName: string
}[] = [
  {
    pathName: "/strinfo",
    icon: WholeWord,
    displayName: "String info"
  },
  {
    pathName: "/json-pretty",
    icon: Sparkles,
    displayName: "Json Prettifier"
  },
  {
    pathName: "/json-to-ts",
    icon: FileJson2,
    displayName: "JSON to TS"
  }
]

export default utils;