import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import API_URL from '@/config/config';

type Todo = {
    _id: string;
    title: string;
    description: string;
};

type TodoContextType = {
    todos: Todo[];
    exploreTodos: Todo[];
    fetchTodos: () => Promise<void>;
    updateTodo: (todo: Todo) => void;
    addToExplore: (todo: Todo) => void;
    deleteTodo: (id: string) => Promise<void>; // Fungsi untuk menghapus kontak
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [exploreTodos, setExploreTodos] = useState<Todo[]>([]);

    const fetchTodos = async () => {
        try {
            const response = await axios.get<{ data: Todo[] }>(`${API_URL}/api/todos`);
            const data = response.data.data;
            setTodos(data);
            setExploreTodos(data);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        }
    };

    const updateTodo = (updatedTodo: Todo) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
        );
    };

    const addToExplore = (todo: Todo) => {
        setExploreTodos((prev) => [...prev, todo]);
    };

    const deleteTodo = async (id: string) => {
        try {
            // Hapus dari API
            await axios.delete(`${API_URL}/api/todos/${id}`);
            // Hapus dari state
            setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
            setExploreTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    return (
        <TodoContext.Provider
            value={{
                todos,
                exploreTodos,
                fetchTodos,
                updateTodo,
                addToExplore,
                deleteTodo,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

export const useTodos = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodos must be used within a TodoProvider');
    }
    return context;
};
