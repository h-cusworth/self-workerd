import fs from "fs/promises";
import path from "path";
import { httpCall, useInjected, useLogger, Authenticated, Validate } from "@httpc/kit";
import { WorkerDefinition, WorkerDefinitionSchema } from "./models";


export const publish = httpCall(
    // Authenticated("role:user"), // disabled for now :)
    Validate(WorkerDefinitionSchema),
    async (definition: WorkerDefinition) => {

        // write the definition
        const logger = useLogger();

        const dataPath = useInjected("ENV:DATA_PATH");
        await fs.mkdir(dataPath, { recursive: true });
        await fs.writeFile(path.join(dataPath, definition.name + ".json"), JSON.stringify(definition), "utf-8");

        logger.info("Published worker %s", definition.name);

        return { success: true };
    }
);


async function flyApi(path: string, data?: any) {
    const endpoint = "http://_api.internal:4280";
    const flyToken = useInjected("ENV:FLY_AUTH_TOKEN");

    const response = await fetch(`${endpoint}${path}`, {
        method: arguments.length === 1 ? "GET" : "POST",
        headers: {
            authorization: `Bearer ${flyToken}`,
            ...data !== undefined ? { "content-type": "application/json" } : undefined,
        },
        body: data !== undefined && data !== null ? JSON.stringify(data) : undefined
    });

    return await response.json();
}
