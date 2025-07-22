import { config } from "dotenv"
import path, { type ParsedPath } from "path"

config();

export class EnvError extends Error {
    private constructor(public readonly env: string, message: string) {
        super(message);
    }

    public static notFound(env: string): never {
        throw new EnvError(env, `Env '${env}' was not found.`);
    }

    public static invalidType(env: string, type: string): never {
        throw new EnvError(env, `Env '${env}' has to be of type ${type}`);
    }
}

export class Env {
    private static getEnv(env: string): string | undefined {
        return process.env[env];
    }

    private static processEnv<T>(env: string, Default: T | undefined, processor: (value: string) => T): T {
        const value = this.getEnv(env);
        if (!value) {
            return Default !== undefined ? Default : EnvError.notFound(env);
        }
        return processor(value);
    }

    public static string(env: string, Default?: string): string {
        return this.processEnv(env, Default, (value) => value);
    }

    public static number(env: string, Default?: number): number {
        return this.processEnv(env, Default, (value) => {
            const result = Number.parseFloat(value);
            if (Number.isNaN(result)) {
                EnvError.invalidType(env, "number");
            }
            return result;
        });
    }

    public static int(env: string, Default?: number): number {
        return this.processEnv(env, Default, (value) => {
            const result = Number.parseInt(value);
            if (Number.isNaN(result)) {
                EnvError.invalidType(env, "int");
            }
            return result;
        });
    }

    public static boolean(env: string, Default?: boolean): boolean {
        return this.processEnv(env, Default, (value) => {
            if (value.toLowerCase() === "true") {
                return true;
            }
            if (value.toLowerCase() === "false") {
                return false;
            }
            EnvError.invalidType(env, "boolean");
        });
    }

    public static url(env: string, Default?: URL | string): URL {
        return this.processEnv(env, typeof Default === "string" ? new URL(Default) : Default, (value) => {
            if (!URL.canParse(value)) {
                EnvError.invalidType(env, "url");
            }
            return new URL(value);
        });
    }

    public static path(env: string, Default?: ParsedPath | string): ParsedPath {
        return this.processEnv(env, typeof Default === "string" ? path.parse(Default) : Default, (value) => {
            return path.parse(value);
        });
    }

    public static json(env: string, Default?: unknown): unknown {
        return this.processEnv(env, Default, (value) => {
            try {
                return JSON.parse(value);
            } catch {
                EnvError.invalidType(env, "json");
            }
        })
    }
}
