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
    setRefresh(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/get-posts`
      );
      const posts = await res.json();
      setAllPosts(posts.data);
    } catch (error) {
      console.log("Failed to get posts", error);
    } finally {
      setRefresh(false);
    }
  };

  const handlePost = async () => {
    if (!images || !text) return;

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
      const imgRes = await uploadFilesToS3(images, res.data._id);

      if (!imgRes) {
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/delete-post?id=${res.data._id}`,
          { method: "DELETE" }
        );
        throw new Error("Failed to post images.");
      }
      addPostRef.current?.close();
      setText("");
      setImages([]);
      await getAllPosts();
    } catch (error) {
      console.log(error);
      Alert.alert("Oops!", "Something went wrong\n\nPlease try again");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefresh(true);
    try {
      await getAllPosts();
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <>
      {user ? (
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
          >
            <View style={styles.postsContainer}>
              {allPosts.map((post, index) => (
                <PostComponent key={index} post={post} />
              ))}
            </View>
          </ScrollView>
          <View style={styles.shareButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => addPostRef.current?.open()}
              style={styles.shareButton}
            >
              <Text style={styles.shareButtonText}>Share your experience</Text>
            </TouchableOpacity>
          </View>
          <Modalize
            adjustToContentHeight
            ref={addPostRef}
            handlePosition="inside"
            modalStyle={styles.modalStyle}
          >
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
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
                    style={styles.textInput}
                    placeholderTextColor="gray"
                  />
                  {images.length > 0 ? (
                    <View style={styles.imagesContainer}>
                      {images.map((img, idx) => (
                        <View key={idx} style={styles.imageWrapper}>
                          <Image
                            source={{ uri: img.uri }}
                            style={styles.image}
                          />
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleUnselect(img.uri)}
                            style={styles.imageCloseButton}
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
                    <View style={styles.addImagesPlaceholder}>
                      <Text>Please share the moments you captured</Text>
                      <TouchableOpacity
                        onPress={pickImage}
                        style={styles.addImagesButton}
                      >
                        <Text style={styles.addImagesButtonText}>
                          Add Images
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={styles.postButtonContainer}>
                <TouchableOpacity
                  onPress={handlePost}
                  activeOpacity={0.7}
                  style={styles.postButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.postButtonText}>Post</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    paddingBottom: height * 0.1,
  },
  postsContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.08,
  },
  shareButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: width * 0.05,
    right: width * 0.05,
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: "green",
    height: height * 0.05,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalStyle: {
    width: "100%",
  },
  modalContainer: {
    paddingHorizontal: width * 0.05,
  },
  modalScrollContent: {
    paddingBottom: height * 0.02,
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    paddingBottom: height * 0.02,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    height: height * 0.15,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: height * 0.02,
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
  },
  image: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 10,
  },
  imageCloseButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 2,
  },
  addImagesPlaceholder: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    width: "100%",
    height: height * 0.15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.02,
  },
  postButtonContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  postButton: {
    width: width * 0.6,
    backgroundColor: "green",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.015,
    borderRadius: 10,
  },
  postButtonText: {
    color: "white",
  },
  addImagesButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addImagesButtonText: {
    color: "white",
  },
});

export default Community;
