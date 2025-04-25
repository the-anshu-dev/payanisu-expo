import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { router, useRouter } from "expo-router";
import LabelValue from "../components/UI/LabelValue";
import { useDispatch, useSelector } from "react-redux";
import MemberCard from "../components/UI/MemberCard";
import { formatDate } from "../utils/helpers";
import { setAdminAccessEnabled } from "../redux/slices/userSlice";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useMembers } from "../hooks/useMembers";

const { width, height } = Dimensions.get("window");

const Profile = () => {
  const { user, role, profile, isAdminAccessEnabled } = useSelector(
    (state) => state.user
  );

  const { members, loading } = useMembers(user?.email);

  const router = useRouter();
  const dispatch = useDispatch();

  const handleAccessChange = (value) => {
    if (value) {
      dispatch(setAdminAccessEnabled(true));
      router.replace("/(admin)/tours");
    } else {
      dispatch(setAdminAccessEnabled(false));
      router.push("/", { replace: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileContainer}>
          <Ionicons
            name="person-circle-outline"
            size={width * 0.08}
            color="white"
          />
          <Text style={styles.titleText}>Personal Details</Text>
        </View>
        <LabelValue label={"Name"} value={profile?.name || user?.given_name} />
        <LabelValue label={"Email"} value={profile?.email || user?.email} />
        <View style={styles.detailsContainer}>
          <View>
            <LabelValue
              label={"Date Of Birth"}
              value={formatDate(profile?.dob)}
            />
            <LabelValue label={"Age"} value={profile.age} />
            <LabelValue label={"Gender"} value={profile.gender} />
            <LabelValue label={"Contact No"} value={profile.contact} />
            <LabelValue label={"Identity Proof Type"} value={profile.id_type} />
            <LabelValue
              label={"Identity Proof Number"}
              value={profile.id_number}
            />
            <LabelValue label={"Address"} value={profile.address} />
            <LabelValue
              label={"How You Know About Us ?"}
              value={profile.info}
            />
            <LabelValue
              label={"Emergency Contact No"}
              value={profile.emergency_contact}
            />
          </View>
          <View className="mt-4">
            {role && (
              <AdminCard
                isAdminAccessEnabled={isAdminAccessEnabled}
                handleAccessChange={handleAccessChange}
                role={role}
              />
            )}
          </View>
          <View style={styles.memberContainer}>
            <View style={styles.memberContainerHeader}>
              <Ionicons
                name="people-circle-outline"
                size={width * 0.08}
                color="#228B22"
              />
              <Text
                style={{
                  fontSize: width * 0.055,
                  fontWeight: "600",
                  color: "#228B22",
                }}
              >
                Added Members
              </Text>
            </View>
            {members.length !== 0 ? (
              <>
                {members.map((mem, index) => (
                  <MemberCard data={mem} key={index} />
                ))}
              </>
            ) : (
              <View style={styles.noMembersContainer}>
                <Text>No Members</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/addMember")}
          style={[styles.actionButton, styles.addMemberButton]}
        >
          <Text style={[styles.actionButtonText]}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!profile}
          activeOpacity={0.9}
          onPress={() => router.push("/updateProfile")}
          style={[styles.actionButton, styles.editProfileButton]}
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AdminCard = ({ isAdminAccessEnabled, handleAccessChange, role }) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
      style={{ borderRadius: 10 }}
    >
      <View className="w-full rounded-lg p-3 flex justify-center items-center py-5 gap-4">
        <Text className="text-lg font-semibold text-yellow-600">
          You have {role} Access
        </Text>
        <View className="w-full gap-4">
          <View className="flex flex-row w-full justify-between items-center px-2 border border-slate-400 py-2 rounded-lg">
            <Text className={"text-base font-semibold text-[#228B22]"}>
              Turn on {role} Access
            </Text>
            <Switch
              value={isAdminAccessEnabled}
              onValueChange={handleAccessChange}
            />
          </View>
          <View className="w-full flex justify-center items-center">
            <TouchableOpacity
              onPress={() => router.push("/addRoles")}
              className="bg-[#228B22] w-full flex justify-center items-center py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-base">
                Add Roles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: "100%",
  },
  profileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0b8a0d",
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0b8a0d",
  },
  scrollContent: {
    paddingBottom: height * 0.03,
    paddingHorizontal: width * 0.03,
  },
  titleText: {
    fontSize: width * 0.055,
    fontWeight: "600",
    color: "white",
  },
  detailsContainer: {
    marginTop: height * 0.001,
    marginBottom: height * 0.05,
  },
  createProfileContainer: {
    height: height * 0.2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.03,
  },
  createProfileText: {
    fontSize: width * 0.045,
    color: "#228B22",
    textAlign: "center",
  },
  createProfileButton: {
    backgroundColor: "red",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    marginTop: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
  },
  createProfileButtonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  noMembersContainer: {
    borderColor: "#999",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: height * 0.002,
    backgroundColor: "transparent",
    paddingHorizontal: width * 0.03,
  },
  actionButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    width: width * 0.45,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
    marginVertical: height * 0.01,
  },
  actionButtonText: {
    fontSize: width * 0.045,
    marginLeft: 0.001,
    color: "white",
  },
  addMemberButton: {
    backgroundColor: "gray",
    color: "white",
  },
  editProfileButton: {
    backgroundColor: "#228B22",
  },
  memberContainer: {
    marginTop: 16,
    paddingHorizontal: width * 0.01,
  },
  memberContainerHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#228B22",
    padding: 10,
    borderRadius: 10,
  },
  adminButton: {
    backgroundColor: "#228B22",
    paddingVertical: 10,
    width: width * 0.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});

export default Profile;
