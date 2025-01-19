import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '@/config/config';

type Todo = {
    _id: string;
    title: string;
    description: string;
};

const ExploreScreen = () => {
    const [todos, setTodos] = useState<Todo[]>([]); // State untuk daftar kontak Explore

    const fetchTodos = async () => {
        try {
            const token = await AsyncStorage.getItem('token'); // Ambil token
            const response = await axios.get<{ data: Todo[] }>(`${API_URL}/api/todos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTodos(response.data.data); // Simpan data dari API ke state
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this contact?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token'); // Ambil token
                            await axios.delete(`${API_URL}/api/todos/${id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id)); // Hapus dari state
                        } catch (error) {
                            console.error('Failed to delete todo:', error);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchTodos(); // Panggil fetchTodos saat komponen pertama kali dimuat
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Explore Contacts</Text>
            {Array.isArray(todos) && todos.length > 0 ? (
                todos.map((todo) => (
                    <View key={todo._id} style={styles.contactCard}>
                        <Text style={styles.contactTitle}>{todo.title}</Text>
                        <Text style={styles.contactDescription}>{todo.description}</Text>
                        <Button
                            mode="contained"
                            onPress={() => handleDelete(todo._id)}
                            style={styles.deleteButton}
                        >
                            Delete
                        </Button>
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>No contacts available. Add some!</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    contactDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
});

export default ExploreScreen;
