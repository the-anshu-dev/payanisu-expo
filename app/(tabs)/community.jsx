import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Modalize } from "react-native-modalize";
import PostComponent from "../../components/UI/PostComponent";
import { useSelector } from "react-redux";
import LoginReqCard from "../../components/UI/LoginReqCard";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { uploadFilesToS3 } from "../../utils/uploadFileHelper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const Community = () => {
  const { user } = useSelector((state) => state.user);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const addPostRef = useRef(null);
  const [refresh, setRefresh] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, ...result.assets]);
    }
  };

  const handleUnselect = (uri) => {
    setImages((prevImages) => prevImages.filter((image) => image.uri !== uri));
  };

  const getAllPosts = async () => {
    setRefresh(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/get-posts`);
      const posts = await res.json();
      setAllPosts(posts.data);
    } catch (error) {
      console.log("Failed to get posts", error);
      Alert.alert("Error", error.message || "Failed to get posts. Please try again later.");
    } finally {
      setRefresh(false);
    }
  };

  const handlePost = async () => {
    if (!images.length || !text) return;
    setLoading(true);
    try {
      const postRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/create-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, name: user.given_name, content: text }),
      });

      if (postRes.status !== 201) throw new Error("Failed to post.");
      const res = await postRes.json();
      const imgRes = await uploadFilesToS3(images, res.data._id);
      if (!imgRes) throw new Error("Failed to upload images.");

      setText("");
      setImages([]);
      addPostRef.current?.close();
      await getAllPosts();
    } catch (error) {
      Alert.alert("Oops!", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPosts();
  }, []);

  if (!user) return <LoginReqCard />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={getAllPosts} />}
        >
          {allPosts.length > 0 ? <View className="w-full gap-3">
            {allPosts.map((post, index) => (
              <PostComponent key={index} post={post} />
            ))}
          </View> :
            <View style={{ flex: 1, paddingVertical: 15, height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text>No Posts Available</Text>
            </View>
          }
        </ScrollView>
        <View style={styles.shareButtonContainer}>
          <TouchableOpacity onPress={() => addPostRef.current?.open()} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share your experience</Text>
          </TouchableOpacity>
        </View>
        <Modalize adjustToContentHeight ref={addPostRef} handlePosition="inside">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share your experience</Text>
            <TextInput
              multiline
              numberOfLines={6}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              placeholder="Write your thoughts...."
              style={styles.textInput}
            />
            <TouchableOpacity onPress={pickImage} style={styles.addImagesButton}>
              <Text style={styles.addImagesButtonText}>Add Images</Text>
            </TouchableOpacity>
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.imageWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.image} />
                    <TouchableOpacity onPress={() => handleUnselect(img.uri)} style={styles.imageCloseButton}>
                      <Ionicons name="close-outline" size={14} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={handlePost} style={styles.postButton}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.postButtonText}>Post</Text>}
            </TouchableOpacity>
          </View>
        </Modalize>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingBottom: height * 0.1, display: "flex", justifyContent: "center", alignItems: "center" },
  container: { paddingHorizontal: 12, paddingTop: 10, position: "relative", flex: 1, height: height },
  shareButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: height * 0.07,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  shareButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    width: "80%"
  },
  shareButtonText: { color: "white", fontWeight: "bold" },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  textInput: { borderWidth: 1, borderColor: "gray", borderRadius: 8, padding: 10, height: 100 },
  addImagesButton: { backgroundColor: "green", padding: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  addImagesButtonText: { color: "white" },
  imagesContainer: { display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: 10, justifyContent: "space-evenly" },
  imageWrapper: { margin: 5, position: "relative" },
  image: { width: 70, height: 70, borderRadius: 8 },
  imageCloseButton: { position: "absolute", top: -5, right: -5, backgroundColor: "white", borderRadius: 12 },
  postButton: { backgroundColor: "green", padding: 10, borderRadius: 8, marginTop: 20, alignItems: "center" },
  postButtonText: { color: "white" },
});

export default Community;
