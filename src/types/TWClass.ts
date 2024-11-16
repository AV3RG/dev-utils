import {HTMLProps} from "react";

// Named like this to avoid any (possibly future) conflicts with Tailwind's `className` prop
type TWClass = HTMLProps<HTMLButtonElement>["className"]

export default TWClass
