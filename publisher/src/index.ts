import "reflect-metadata";
import "dotenv/config";
import { Application } from "@httpc/kit";
import "@httpc/kit/validation-zod";
import calls from "./calls";


const app = new Application({
    port: Number(process.env.PORT) || 3000,
    cors: true,
    calls,
});

app.registerEnv({
    DATA_PATH: "required",
});

app.initialize().then(() => {
    app.start();
});
