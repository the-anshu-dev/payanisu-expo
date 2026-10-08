import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
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
import { showError } from "../../utils/toastHelper";
import { communityScreenStyles } from "../../constants/Styles";
import NotAvailableComponent from "../../components/UI/NotAvailableComponent";

const Community = () => {
  const { user } = useSelector((state) => state.user);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const addPostRef = useRef(null);

  const handleSelectImages = (existingImages, assets) => {
    setImages([...existingImages, ...assets]);
  };

  const handleUnselect = (uri) => {
    setImages(images.filter((image) => image.uri !== uri));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleSelectImages(images, result.assets);
    }
  };

  const getAllPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/get-posts`
      );
      const posts = await res.json();
      setAllPosts(posts.data);
    } catch (error) {
      showError("Failed to get posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!images && !text) return;

    setLoading(true);
    try {
      const body = {
        userEmail: user.email,
        name: user.given_name,
        content: text,
      };

      const postRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/create-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (postRes.status !== 201) {
        throw new Error("Failed to post.");
      }

      const res = await postRes.json();
      const imgRes = images && (await uploadFilesToS3(images, res.data._id));

      if (images && !imgRes) {
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/delete-post?id=${res.data._id}`,
          { method: "DELETE" }
        );
        throw new Error("Failed to post images.");
      }

      addPostRef.current.close();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPosts();
  }, []);

  if (loading) {
    return (
      <View style={communityScreenStyles.loaderContainer}>
        <ActivityIndicator color="#228B22" size="large" />
      </View>
    );
  }

  return (
    <>
      {user ? (
        <SafeAreaView
          style={communityScreenStyles.safeArea}
          edges={["bottom", "left", "right"]}
        >
          <ScrollView
            contentContainerStyle={communityScreenStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={communityScreenStyles.postsContainer}>
              {allPosts.length > 0 ? (
                allPosts.map((post, index) => (
                  <PostComponent key={index} post={post} />
                ))
              ) : (
                <NotAvailableComponent
                  iconName={"alert-circle-outline"}
                  text={"No Posts yet"}
                />
              )}
            </View>
          </ScrollView>
          <View style={communityScreenStyles.shareButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => addPostRef.current?.open()}
              style={communityScreenStyles.shareButton}
            >
              <Text style={communityScreenStyles.shareButtonText}>
                Share your experience
              </Text>
            </TouchableOpacity>
          </View>
          <Modalize
            adjustToContentHeight
            ref={addPostRef}
            handlePosition="inside"
            modalStyle={communityScreenStyles.modalStyle}
          >
            <View style={communityScreenStyles.modalContainer}>
              <ScrollView
                contentContainerStyle={communityScreenStyles.modalScrollContent}
              >
                <View style={communityScreenStyles.modalContent}>
                  <Text style={communityScreenStyles.modalTitle}>
                    Share your experience with us
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    onChangeText={setText}
                    value={text}
                    placeholder="Write your thoughts...."
                    keyboardType="default"
                    style={communityScreenStyles.textInput}
                    placeholderTextColor="gray"
                  />
                  {images.length > 0 ? (
                    <View style={communityScreenStyles.imagesContainer}>
                      {images.map((img, idx) => (
                        <View
                          key={idx}
                          style={communityScreenStyles.imageWrapper}
                        >
                          <Image
                            source={{ uri: img.uri }}
                            style={communityScreenStyles.image}
                          />
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => handleUnselect(img.uri)}
                            style={communityScreenStyles.imageCloseButton}
                          >
                            <Ionicons
                              name="close-outline"
                              size={14}
                              color="red"
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={communityScreenStyles.addImagesPlaceholder}>
                      <Text>Add the moments you captured</Text>
                      <TouchableOpacity
                        onPress={pickImage}
                        activeOpacity={0.9}
                        style={communityScreenStyles.addImagesButton}
                      >
                        <Text style={communityScreenStyles.addImagesButtonText}>
                          Select Images
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={communityScreenStyles.postButtonContainer}>
                <TouchableOpacity
                  onPress={handlePost}
                  activeOpacity={0.9}
                  style={communityScreenStyles.postButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={communityScreenStyles.postButtonText}>
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modalize>
        </SafeAreaView>
      ) : (
        <LoginReqCard />
      )}
    </>
  );
};

export default Community;
