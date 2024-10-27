import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {produce} from "immer";

export interface Settings {
    jsonPretty: JsonPrettySettings
    jsonPrettyFunctions: {
        setAllowDuplicateObjectKeys: (allow: boolean) => void
    }
}

export interface JsonPrettySettings {
    allowDuplicateObjectKeys: boolean
}

const useSettings = create(persist((set) => ({
        jsonPretty: {
            "allowDuplicateObjectKeys": false,
        },
        jsonPrettyFunctions: {
            setAllowDuplicateObjectKeys: (allow: boolean) => set(produce((state: Settings) => {
                state.jsonPretty.allowDuplicateObjectKeys = allow
            }))
        }
    }),
    {
        name: 'settings-storage',
        storage: createJSONStorage(() => localStorage)
    }
)) as () => Settings

export default useSettings