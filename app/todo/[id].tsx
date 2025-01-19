import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Dialog,
    Portal,
    Provider as PaperProvider,
    Text,
    TextInput,
} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import API_URL from '@/config/config';
import { useTodos } from '@/context/TodoContext';

type Todo = {
    _id: string;
    title: string;
    description: string;
};

const TodoDetailScreen = () => {
    const { id: contactId } = useLocalSearchParams<{ id: string }>(); // Ambil ID dari URL
    const { updateTodo, addToExplore } = useTodos(); // Ambil fungsi dari context
    const [todo, setTodo] = useState<Todo | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTodo();
    }, [contactId]);

    const fetchTodo = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get<{ data: Todo }>(
                `${API_URL}/api/todos/${contactId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const fetchedTodo = response.data.data;
            setTodo(fetchedTodo);
            setTitle(fetchedTodo.title);
            setDescription(fetchedTodo.description);
        } catch (error) {
            console.error('Failed to fetch todo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTodo = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/todos/${contactId}`,
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedTodo = response.data.data;

            updateTodo(updatedTodo); // Update di context global
            addToExplore(updatedTodo); // Tambahkan ke Explore
            setVisible(true);
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const hideDialog = () => {
        setVisible(false);
        router.back();
    };

    if (loading) {
        return (
            <PaperProvider>
                <ActivityIndicator style={styles.loading} animating={true} />
            </PaperProvider>
        );
    }

    if (!todo) {
        return null;
    }

    return (
        <PaperProvider>
            <Card style={styles.card} elevation={3}>
                <Card.Content>
                    <TextInput
                        label="Title"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        mode="outlined"
                    />
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        mode="outlined"
                    />
                    <Button mode="contained" onPress={handleUpdateTodo} style={styles.updateButton}>
                        Update Todo
                    </Button>
                </Card.Content>
            </Card>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Success</Dialog.Title>
                    <Dialog.Content>
                        <Text>Todo updated successfully</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        borderRadius: 8,
    },
    input: {
        marginBottom: 12,
    },
    updateButton: {
        marginTop: 12,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TodoDetailScreen;
