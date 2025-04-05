import { Dimensions, StyleSheet } from "react-native";

export const { width, height } = Dimensions.get("window");

// Client Flow

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

// Admin Flow

export const announcementScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.01,
    marginTop: height * 0.015,
  },
  dropDownContainer: {
    paddingHorizontal: width * 0.03,
  },
  scrollViewContent: {
    paddingBottom: height * 0.15,
    paddingHorizontal: width * 0.03,
  },
  announcementContainer: {
    marginTop: height * 0.01,
  },
  buttonContainer: {
    position: "absolute",
    bottom: height * 0.009,
    width: "100%",
    paddingHorizontal: width * 0.07,
    justifyContent: "center",
    alignItems: "center",
  },
  newAnnouncementButton: {
    width: "100%",
    height: height * 0.06,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#228B22",
    borderRadius: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "600",
    marginLeft: width * 0.02,
  },
  modalContent: {
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: width * 0.02,
    fontWeight: "500",
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  switchText: {
    marginLeft: width * 0.03,
    fontWeight: "600",
    fontSize: width * 0.04,
  },
});

export const communityScreenStyles = StyleSheet.create({
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
    gap: 15,
    marginTop: 15,
  },
  shareButtonContainer: {
    position: "absolute",
    bottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    left: width * 0.05,
    right: width * 0.05,
  },
  shareButton: {
    backgroundColor: "#228B22",
    height: height * 0.055,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  shareButtonText: {
    width: "100%",
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: height * 0.02,
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
    marginTop: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#228B22",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginTop: height * 0.002,
    height: height * 0.15,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: height * 0.02,
    width: "100%",
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
    borderColor: "#228B22",
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
    marginBottom: height * 0.02,
  },
  postButton: {
    backgroundColor: "#228B22",
    width: width * 0.6,
    paddingVertical: height * 0.01,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  postButtonText: {
    color: "white",
    fontSize: height * 0.02,
  },
  addImagesButton: {
    backgroundColor: "#228B22",
    paddingHorizontal: 24,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addImagesButtonText: {
    color: "white",
  },
});

export const expenseScreenStyles = StyleSheet.create({
  pickerContainer: {
    width: "100%",
    height: height * 0.06,
    borderWidth: 2,
    borderColor: "#228B22",
    borderRadius: 8,
  },
  picker: {
    height: "100%",
    fontSize: 18,
  },
});

export const tourScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: height * 0.1,
    width: "100%",
  },
  tourListContainer: {
    width: width,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
  },
  noToursCard: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  noToursText: {
    color: "gray",
    fontSize: width * 0.06,
    fontWeight: "bold",
  },
  createButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: width * 0.04,
    paddingVertical: 5,
    backgroundColor: "white",
  },
  createButton: {
    backgroundColor: "#228B22",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

// components

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    contentFit: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: width * 0.08,
  },
  loginButton: {
    width: "100%",
    paddingHorizontal: width * 0.01,
    position: "absolute",
    bottom: 24,
  },
  loginButtonContent: {
    backgroundColor: "rgba(96, 96, 96, 0.8)",
    width: "100%",
    borderRadius: 10,
    paddingVertical: height * 0.02,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loginButtonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    spaceX: width * 0.02,
  },
  loginButtonText: {
    color: "white",
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginLeft: width * 0.02,
  },
});
