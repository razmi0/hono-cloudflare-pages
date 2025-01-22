import { hc } from "hono/client";
import { useEffect, useState } from "hono/jsx";
import { Todo, TodoRoute } from "../../api/rest";
import { safe } from "../helpers/safe";
import { withViewTransition } from "../helpers/withViewTransition";

// CLASSIC CLIENT SIDE COMPONENT NO HTMX

const useTodos = (todoClient: (typeof client)["todos"]) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState<boolean>(false);

    const loadTodos = async () => {
        if (todos.length === 0) {
            const initialTodos = await getTodos();
            setTodos(initialTodos);
        }
    };

    useEffect(() => {
        loadTodos();
    }, []);

    const getTodos = async (): Promise<Todo[]> => {
        return safe(
            "should get all todos",
            async () => {
                setError(false);
                return await todoClient.$get().then((res) => res.json());
            },
            () => setError(true)
        ) as Promise<Todo[]>;
    };

    const addTodo = async (todo: Todo): Promise<void> => {
        withViewTransition(() => {
            safe(
                "should add a todo",
                async () => {
                    setError(false);
                    const { id } = await todoClient.add.$post({ json: todo }).then((res) => res.json());
                    setTodos([...todos, { ...todo, id }]);
                },
                () => setError(true)
            );
        });
    };

    const deleteTodo = async (id: number): Promise<void> => {
        withViewTransition(() => {
            safe(
                "should delete a todo",
                async () => {
                    setError(false);
                    setTodos(todos.filter((todo) => todo.id !== id));
                    await todoClient.delete.$delete({ json: { id } });
                },
                () => setError(true)
            );
        });
    };

    const updateTodo = async (todo: Todo): Promise<void> => {
        safe(
            "should update a todo",
            async () => {
                setError(false);
                setTodos(todos.map((t) => (t.id === todo.id ? todo : t)));
                await todoClient.update.$put({ json: todo });
            },
            () => setError(true)
        );
    };

    return { todos, deleteTodo, updateTodo, addTodo, error };
};

const dns = import.meta.env.PROD ? "https://hono-test2.pages.dev" : "http://localhost:5173";
const client = hc<TodoRoute>(`${dns}/api`);
/**
 * ClientTodo component
 */
export const ClientTodo = () => {
    const { deleteTodo, todos, updateTodo, addTodo, error } = useTodos(client.todos);
    const [newTodo, setNewTodo] = useState<Todo>({ id: 0, title: "", completed: false });

    const handleCheckboxChange = (id: number, e: Event) => {
        updateTodo({
            id,
            title: todos.find((todo) => todo.id === id)?.title || "",
            completed: (e.currentTarget as HTMLInputElement).checked,
        });
    };

    const handleTitleChange = (id: number, e: InputEvent) => {
        updateTodo({
            id,
            title: (e.currentTarget as HTMLInputElement).value,
            completed: todos.find((todo) => todo.id === id)?.completed || false,
        });
    };

    const handleNewTodoCheckboxChange = (e: Event) => {
        setNewTodo({
            ...newTodo,
            completed: (e.currentTarget as HTMLInputElement).checked,
        });
    };

    const handleNewTodoTitleChange = (e: InputEvent) => {
        setNewTodo({
            ...newTodo,
            title: (e.currentTarget as HTMLInputElement).value,
        });
    };

    return (
        <section class={"container"}>
            <h1>Client renderer todo list</h1>
            {error && <p aria-invalid="true">Something went wrong</p>}
            {todos.map(({ id, title, completed }: Todo) => (
                <article role="group">
                    <input type={"checkbox"} checked={completed} onChange={(e) => handleCheckboxChange(id, e)} />
                    <input type="text" placeholder={id + " : " + title} onInput={(e) => handleTitleChange(id, e)} />
                    <button onClick={() => deleteTodo(id)}>Delete</button>
                </article>
            ))}
            <hr />
            <article role="group">
                <input type="checkbox" name="completed" onChange={handleNewTodoCheckboxChange} />
                <input type="text" placeholder="Add todo" name="title" onInput={handleNewTodoTitleChange} />
                <button onClick={() => addTodo({ ...newTodo })}>Add</button>
            </article>
        </section>
    );
};
