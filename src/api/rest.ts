import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import type { Bindings } from "../index";

// API REST FOR CLIENT COMPONENT

/**
 * Initial todos
 */
const fallbackTodos: Todo[] = [
    { id: 1, title: "Learn JavaScript", completed: true },
    { id: 2, title: "Learn TypeScript", completed: true },
    { id: 3, title: "Learn Deno", completed: false },
];
/**
 * we define a schema for the todo object for z validation
 */
const todoSchema = z.object({
    id: z.number(),
    title: z.string(),
    completed: z.boolean(),
});
/**
 * Infer the type of the todo object ( used by the client)
 */
export type Todo = z.infer<typeof todoSchema>;

/**
 * RPC Element
 * TodoRoute (API REST)
 * will be used by the client
 * ```ts
 * const client = hc<TodoRoute>("http://localhost:5173/api");
 * ```
 */
const todoRoute = new Hono<{ Bindings: Bindings }>()
    .use(logger())
    /* GET ALL */
    .get("/todos", async (c) => {
        const todos = JSON.parse((await c.env.KV.get("todos")) || "[]");
        console.log(todos);
        if (todos.length === 0) {
            await c.env.KV.put("todos", JSON.stringify(fallbackTodos));
        }
        return c.json(todos ? todos : fallbackTodos, 200);
    })
    /* ADD */
    .post("/todos/add", zValidator("json", todoSchema.omit({ id: true })), async (c) => {
        const currentId = await c.env.KV.get("incrementor");
        const todos = JSON.parse((await c.env.KV.get("todos")) || "[]");

        if (!currentId) await c.env.KV.put("incrementor", fallbackTodos.length.toString());

        const id = parseInt(currentId || fallbackTodos.length.toString()) + 1;
        await c.env.KV.put("incrementor", id.toString());

        const { title, completed } = c.req.valid("json");
        const newTodo = {
            id,
            title,
            completed,
        };

        await c.env.KV.put("todos", JSON.stringify([...todos, newTodo]));
        return c.json(newTodo, 201);
    })
    .put("/todos/update", zValidator("json", todoSchema), async (c) => {
        const { id, title, completed } = c.req.valid("json");
        const todos = JSON.parse((await c.env.KV.get("todos")) || "[]");
        await c.env.KV.put(
            "todos",
            JSON.stringify(todos.map((todo: Todo) => (todo.id === id ? { id, title, completed } : todo)))
        );
        return c.json({ id, title, completed }, 200);
    })
    .delete("/todos/delete", zValidator("json", todoSchema.pick({ id: true })), async (c) => {
        const { id } = c.req.valid("json");
        const todos = JSON.parse((await c.env.KV.get("todos")) || "[]");
        await c.env.KV.put("todos", JSON.stringify(todos.filter((todo: Todo) => todo.id !== id)));
        return c.json({ id }, 200);
    });

/**
 * RPC Element
 * ```ts
 * const client = hc<TodoRoute>("http://localhost:5173/api");
 * ```
 */
export type TodoRoute = typeof todoRoute;

/**
 * Add API REST routes to the main routes
 */
export default new Hono().route("", todoRoute);
