import { Hono } from "hono";
import api from "./api/rest";
import { renderer } from "./renderer";

// local env bindings
export type Bindings = {
    /**
     * KVNamespace (Cloudflare Workers) give access to KV storage witch is a key-value store that can be used to store data in the cloud and access it from your workers.
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
// add a key-value pair to the KV store
// await c.env.KV.put("name", c.env.NAME);
// get the value of the key "name" from the KV store
// const name = await c.env.KV.get("name");
