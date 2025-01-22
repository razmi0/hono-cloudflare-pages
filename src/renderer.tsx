import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = (title: string) => {
    return jsxRenderer(({ children }) => {
        return (
            <html>
                <head>
                    {import.meta.env.PROD ? (
                        <script type="module" src="/static/client.js"></script>
                    ) : (
                        <script type="module" src="/src/client/main.ts"></script>
                    )}
                    <link
                        rel="stylesheet"
                        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.yellow.min.css"></link>
                    <link href="/static/style.css" rel="stylesheet" />
                    <title>{title}</title>
                </head>
                {children}
            </html>
        );
    });
};
