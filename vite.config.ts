import build from "@hono/vite-build/cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
    if (mode === "client") {
        return {
            build: {
                rollupOptions: {
                    input: "./src/client.ts",
                    output: {
                        entryFileNames: "static/client.js",
                    },
                },
            },
        };
    } else {
        return {
            plugins: [
                devServer({
                    entry: "src/index.tsx",
                    adapter, // Cloudflare Adapter
                }),
                build(),
            ],
        };
    }
});
