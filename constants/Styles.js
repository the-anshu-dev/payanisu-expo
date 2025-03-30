import { Dimensions, StyleSheet } from "react-native";

export const { width, height } = Dimensions.get("window");

export const communityTabStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    paddingBottom: height * 0.1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
    position: "relative",
    flex: 1,
    height: height,
  },
  shareButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: height * 0.07,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#228B22",
    paddingVertical: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    width: width * 0.9,
  },
  shareButtonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 10,
    height: 100,
  },
  addImagesButton: {
    backgroundColor: "#228B22",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  addImagesButtonText: { color: "white" },
  imagesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-evenly",
  },
  imageWrapper: { margin: 5, position: "relative" },
  image: { width: 70, height: 70, borderRadius: 8 },
  imageCloseButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
  },
  postButton: {
    backgroundColor: "#228B22",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  postButtonText: { color: "white" },
});

export const homeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offlineContainer: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    height: height * 0.47,
    zIndex: 0,
  },
  carouselContainer: {
    width: width,
    height: height,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#228B22",
    marginTop: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "#228B22",
    width: "45%",
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export const myTourScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContainer: {
    width: "100%",
    paddingBottom: height * 0.1,
    paddingHorizontal: width * 0.05,
  },
  toursContainer: {
    width: "100%",
    alignItems: "center",
  },
  noTourContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTourText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const notificationScreenStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { paddingBottom: 20 },
  notificationsContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
});
