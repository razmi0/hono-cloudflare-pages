import { Hono } from "hono";

// local env bindings
type Bindings = {
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

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
    // add a key-value pair to the KV store
    await c.env.KV.put("name", c.env.NAME);
    // get the value of the key "name" from the KV store
    const name = await c.env.KV.get("name");
    return c.html(
        <html>
            <head>
                {import.meta.env.PROD ? (
                    <script type="module" src="/static/client.js"></script>
                ) : (
                    <script type="module" src="/src/client.ts"></script>
                )}
            </head>
            <body>
                <h1>Hello {name}</h1>
            </body>
        </html>
    );
});

export default app;
