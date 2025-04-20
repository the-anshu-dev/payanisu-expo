import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Modalize } from "react-native-modalize";
import PostComponent from "../../components/UI/PostComponent";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { uploadFilesToS3 } from "../../utils/uploadFileHelper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useFocusEffect } from "expo-router";
import { showError } from "../../utils/toastHelper";
import Loader from "../../components/common/Loader";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";
import { communityTabStyles } from "../../constants/Styles";

const Community = () => {
  const { user } = useSelector((state) => state.user);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const addPostRef = useRef(null);
  const [refresh, setRefresh] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [];

      for (const asset of result.assets) {
        const fileName = asset.uri.split("/").pop();
        const destPath = `${FileSystem.documentDirectory}${fileName}`;

        try {
          await FileSystem.copyAsync({
            from: asset.uri,
            to: destPath,
          });
          newImages.push({ uri: destPath, ...asset });
        } catch (err) {
          console.error("Failed to persist file:", err);
          showError("Error processing selected images.");
        }
      }

      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleUnselect = (uri) => {
    setImages((prevImages) => prevImages.filter((image) => image.uri !== uri));
  };

  const getAllPosts = async () => {
    setRefresh(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/get-posts`
      );
      const posts = await res.json();
      setAllPosts(posts.data);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setRefresh(false);
    }
  };

  const handlePost = async () => {
    if (!images.length && !text.trim()) return;

    setLoading(true);

    try {
      const postRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/create-post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            name: user.given_name,
            content: text,
          }),
        }
      );

      if (postRes.status !== 201) throw new Error("Failed to post.");
      const res = await postRes.json();
      const postId = res.data._id;

      if (images.length) {
        const imgRes = await uploadFilesToS3(images, postId);
        if (!imgRes) {
          await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/delete-post/${postId}`,
            {
              method: "DELETE",
            }
          );
          throw new Error("Failed to upload images. Post discarded.");
        }
      }

      setText("");
      setImages([]);
      addPostRef.current?.close();
      await getAllPosts();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllPosts();
    }, [])
  );

  useEffect(() => {
    (async () => {
      await getAllPosts();
      setInitialLoading(false);
    })();
  }, []);

  if (!user) return <Redirect href="/login" />;

  if (initialLoading) return <Loader />;

  return (
    <SafeAreaView
      style={communityTabStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View style={communityTabStyles.container}>
        <ScrollView
          contentContainerStyle={communityTabStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={getAllPosts} />
          }
        >
          <View className="w-full gap-3">
            {allPosts.length > 0 ? (
              allPosts?.map((post, index) => (
                <PostComponent key={index} post={post} />
              ))
            ) : (
              <NotAvailableComponent
                text={"No Posts Yet"}
                iconName={"alert-circle-outline"}
              />
            )}
          </View>
        </ScrollView>
        <View style={communityTabStyles.shareButtonContainer}>
          <TouchableOpacity
            onPress={() => addPostRef.current?.open()}
            style={communityTabStyles.shareButton}
          >
            <Text style={communityTabStyles.shareButtonText}>
              Share your experience
            </Text>
          </TouchableOpacity>
        </View>
        <Modalize
          adjustToContentHeight
          ref={addPostRef}
          handlePosition="inside"
        >
          <View style={communityTabStyles.modalContent}>
            <Text style={communityTabStyles.modalTitle}>
              Share your experience
            </Text>
            <TextInput
              multiline
              numberOfLines={6}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              placeholder="Write your thoughts...."
              style={communityTabStyles.textInput}
            />
            {images.length > 0 && (
              <View style={communityTabStyles.imagesContainer}>
                {images.map((img, idx) => (
                  <View key={idx} style={communityTabStyles.imageWrapper}>
                    <Image
                      source={{ uri: img.uri }}
                      style={communityTabStyles.image}
                    />
                    <TouchableOpacity
                      onPress={() => handleUnselect(img.uri)}
                      style={communityTabStyles.imageCloseButton}
                    >
                      <Ionicons name="close-outline" size={14} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={pickImage}
              style={communityTabStyles.addImagesButton}
            >
              <Text style={communityTabStyles.addImagesButtonText}>
                {images.length > 0 ? "Add more images" : "Add Images"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePost}
              style={communityTabStyles.postButton}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={communityTabStyles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </Modalize>
      </View>
    </SafeAreaView>
  );
};

export default Community;
