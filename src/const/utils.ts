import {LucideIcon, Sparkles, WholeWord} from "lucide-react";

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
  }
]

export default utils;