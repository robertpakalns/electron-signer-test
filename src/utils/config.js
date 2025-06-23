import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"

export const defaultConfig = {
    client: {
        firstJoin: true,
        adblocker: true,
        fpsUncap: true,
        fullscreen: false,
        swapper: false,
        modalHint: true,
        domain: "kirka.io"
    },
    fastCSS: {
        enable: false,
        url: "",
        value: ""
    },
    keybinding: {
        enable: false,
        content: {
            CloseModal: "Escape",
            MenuModal: "F1",
            Reload: "F5",
            Fullscreen: "F11",
            DevTools: "F12"
        }
    }
}

export const configDir = join(homedir(), "Documents/RedlineClient")
export const configPath = join(configDir, "config.json")
if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })
if (!existsSync(configPath)) writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))

export class Config {
    static configInstance = null
    static file = configPath

    constructor() {
        if (Config.configInstance) this.config = Config.configInstance
        else {
            this.config = JSON.parse(readFileSync(Config.file, "utf8"))
            this.fillConfig()
            this.cleanConfig()
            Config.configInstance = this.config
        }
    }

    writeConfig(obj = this.config) {
        writeFileSync(Config.file, JSON.stringify(obj, null, 2))
    }

    get(key) {
        let result = this.config
        for (const el of key.split(".")) {
            if (result === null || typeof result !== "object") return undefined
            result = result[el]
        }
        return result
    }

    set(key, value) {
        const keys = key.split(".")
        const lastKey = keys.pop()

        let result = this.config
        for (const k of keys) {
            if (typeof result[k] !== "object" || result[k] === null) result[k] = {}
            result = result[k]
        }
        result[lastKey] = value

        this.writeConfig()
    }

    default() {
        this.config = defaultConfig
        this.writeConfig()
    }

    // Fills the config with default values if missing
    fillConfig(source = defaultConfig, target = this.config) {
        const originalConfig = JSON.stringify(target)

        for (const key in source) {
            const s = source[key]
            const t = target[key]

            if (typeof s === "object" && s !== null) {
                if (typeof t !== "object" || t === null) target[key] = {}
                this.fillConfig(s, target[key])
            }
            else if (t === undefined) target[key] = s
        }

        if (originalConfig !== JSON.stringify(target)) this.writeConfig(target)
    }

    // Cleans the config from unregistered values
    cleanConfig(source = defaultConfig, target = this.config) {
        const originalConfig = JSON.stringify(target)

        for (const key in target) {
            if (!(key in source)) delete target[key]
            else if (typeof source[key] === "object" && source[key] !== null) this.cleanConfig(source[key], target[key])
        }

        if (originalConfig !== JSON.stringify(target)) this.writeConfig(target)
    }
}