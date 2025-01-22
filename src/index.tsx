import { Hono } from "hono";
import api from "./api/rest";
import { renderer } from "./renderer";

// local env bindings
export type Bindings = {
    /**
     * KVNamespace (Cloudflare Workers)
     * */
    KV: KVNamespace;
    /**
     * [vars]
     * NAME = "Hono"
     */
    NAME: string; // Hono
};

export default new Hono<{ Bindings: Bindings }>()
    .route("/api", api)
    .use("*", renderer("Hono"))
    .get("/", async (c) => {
        const isConnectedToKV = c.env.KV ? "connected" : "not connected";
        return c.render(
            <body class={"container-fluid"}>
                <header>
                    <h1>Server side rendered layout</h1>
                    <small>KV : {isConnectedToKV}</small>
                </header>
                <main>
                    <div id="root"></div>
                </main>
            </body>
        );
    });
