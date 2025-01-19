import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {
  ActivityIndicator,
  Button,
  Dialog,
  PaperProvider,
  Portal,
  Text,
  Card,
} from "react-native-paper";
import API_URL from "@/config/config";

type UserProfile = {
  username: string;
  email: string;
  avatar: string;
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const router = useRouter();

  const avatarOptions = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get<{ data: UserProfile }>(
        `${API_URL}/api/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDialogVisible(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/auth/LoginScreen");
  };

  const changeAvatar = async (newAvatar: string) => {
    if (profile) {
      try {
        const token = await AsyncStorage.getItem("token");
        await axios.put(
          `${API_URL}/api/profile/avatar`,
          { avatar: newAvatar },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile({ ...profile, avatar: newAvatar });
        setAvatarModalVisible(false);
      } catch (error) {
        console.error("Failed to update avatar", error);
      }
    }
  };

  if (loading) {
    return (
      <PaperProvider>
        <ThemedView style={styles.container}>
          <ActivityIndicator animating={true} size="large" color="#1976d2" />
        </ThemedView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <ThemedView style={styles.container}>
        {profile ? (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                  <Image
                    source={{
                      uri: profile.avatar || "https://i.pravatar.cc/150",
                    }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.title}>
                Welcome, {profile.username}!
              </ThemedText>
              <ThemedText style={styles.subtitle}>User Information</ThemedText>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Username:</ThemedText>
                  <ThemedText style={styles.value}>{profile.username}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Email:</ThemedText>
                  <ThemedText style={styles.value}>{profile.email}</ThemedText>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <ThemedText>No profile data available</ThemedText>
        )}
        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
          >
            <Dialog.Title>Logout Confirmation</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to logout?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button onPress={confirmLogout}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog
            visible={avatarModalVisible}
            onDismiss={() => setAvatarModalVisible(false)}
          >
            <Dialog.Title>Select an Avatar</Dialog.Title>
            <Dialog.Content>
              <ScrollView
                horizontal
                contentContainerStyle={styles.avatarOptions}
              >
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => changeAvatar(avatar)}
                  >
                    <Image
                      source={{ uri: avatar }}
                      style={styles.avatarOption}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAvatarModalVisible(false)}>
                Close
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ThemedView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e3f2fd",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#1976d2",
  },
  avatarOptions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  avatarOption: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#bbb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#0d47a1",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#1976d2",
  },
});

export default ProfileScreen;