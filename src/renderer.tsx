import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children }) => {
    return (
        <html>
            <head>
                {import.meta.env.PROD ? (
                    <script type="module" src="/static/client.js"></script>
                ) : (
                    <script type="module" src="/src/client.ts"></script>
                )}
                <link href="/static/style.css" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
});
