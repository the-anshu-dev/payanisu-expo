import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { exportDataToExcel, formatDate } from "../../utils/helpers.js";
import { Image } from "expo-image";
import { uploadFileToS3 } from "../../utils/uploadFileHelper.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format as formatDateFns } from "date-fns";
import LabelValue from "../../components/UI/LabelValue.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { setTour } from "../../redux/slices/tourSlice.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showWarning } from "../../utils/toastHelper.js";
import { Picker } from "@react-native-picker/picker";
import ExpenseCard from "../../components/UI/ExpenseCard.jsx";
import { expenseScreenStyles } from "../../constants/Styles.js";
import { useFocusEffect } from "expo-router";

const { width } = Dimensions.get("window");

const expense = () => {
  const { tour } = useSelector((state) => state.tour);
  const { user } = useSelector((state) => state.user);

  const toursDataForDropdown = tour
    .filter((t) => t.email == user?.email)
    .map((t) => {
      return { label: t.name, value: t._id };
    });

  const dispatch = useDispatch();

  const addExpenseDetailRef = useRef(null);
  const showExpenseDetailRef = useRef(null);

  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);

  const [showExpenseDetails, setShowExpenseDetails] = useState(null);

  const [expenseData, setExpenseData] = useState(null);

  const [expenseCategory, setExpenseCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentTour, setCurrentTour] = useState(
    toursDataForDropdown[0]?.value
  );

  const [excelData, setExcelData] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [tours, setTours] = useState(toursDataForDropdown);

  const [refresh, setRefresh] = useState(false);

  const getAllTours = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/get-alltours`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tours due to server error.");
      }
      const tour = await response.json();
      await AsyncStorage.setItem("tours", JSON.stringify(tour));
      dispatch(setTour(tour));
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseCategory || !amount || !date || !user.name) {
      showWarning("All fields required.");
      return;
    }

    setLoading(true);
    try {
      const imgUrl = image ? await uploadFileToS3(image) : null;

      if (image && !imgUrl) {
        showError("Failed to upload image");
        return;
      }

      const newExpense = {
        category: expenseCategory,
        amount,
        note,
        receipt: imgUrl,
        date,
        tour_id: currentTour,
        name: user.name,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/expanse/add-expanse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExpense),
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to add expense");
      }

      const data = await response.json();
      setExpenseCategory("");
      setAmount("");
      setNote("");
      setImage(null);
      setDate("");
      addExpenseDetailRef?.current?.close();
      fetchExpense();
    } catch (error) {
      showError(error.message || "Please try again.");
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(formatDateFns(selectedDate, "yyyy-MM-dd"));
    }
  };

  const fetchExpense = async () => {
    const url = `${process.env.EXPO_PUBLIC_BASE_URL}/api/expanse/get-expanses?id=${currentTour}`;
    setLoading(true);

    try {
      const res = await fetch(url);

      if (res.status !== 200) {
        throw new Error("Failed to get expenses");
      }

      const data = await res.json();

      setExpenseData({
        budget: data?.budget,
        expanses: data?.expanses,
        spent: data?.spent[0]?.spent || 0,
        balance: data?.balance,
      });
      setExcelData(data?.expanses);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const formattedData = await excelData.map((d) => ({
        Name: d?.name || "",
        Category: d?.category || "",
        Amount: d?.amount || 0,
      }));

      await exportDataToExcel(formattedData, `expenseDetail`);
    } catch (error) {
      showError("Failed to export expense details");
    } finally {
      setExporting(false);
    }
  };

  const getIconName = (category = "") => {
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes("food")) {
      return "fast-food-outline";
    } else if (lowerCategory.includes("aid")) {
      return "medkit-outline";
    } else if (lowerCategory.includes("transportation")) {
      return "car-outline";
    } else if (lowerCategory.includes("stay")) {
      return "bed-outline";
    } else if (lowerCategory.includes("miscellaneous")) {
      return "document-text-outline";
    } else {
      return "card-outline";
    }
  };

  const handleShowExpenseDetails = (id) => {
    try {
      const dataToShow = expenseData.expanses.find((i) => i._id === id);
      setShowExpenseDetails(dataToShow);
      showExpenseDetailRef.current?.open();
    } catch (error) {
      showError("Failed to find data");
    }
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      if (currentTour) {
        fetchExpense();
      }
      await getAllTours();
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    if (currentTour) {
      fetchExpense();
    }
  }, [currentTour]);

  useFocusEffect(useCallback(() => onRefresh(), [currentTour]));

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1 }}>
      <View className="mt-14 h-full w-full relative">
        <View className="z-50 px-4">
          <DropDownPicker
            open={open}
            value={currentTour}
            items={tours}
            setOpen={setOpen}
            setValue={setCurrentTour}
            setItems={setTours}
            closeOnBackPressed={true}
            placeholder="Select Tour"
            zIndex={1000}
            textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
            arrowIconStyle={{ tintColor: "white" }}
            tickIconStyle={{ tintColor: "white" }}
            style={{ backgroundColor: "#117004", borderColor: "#117004" }}
            dropDownContainerStyle={{
              backgroundColor: "#117004",
              borderColor: "#117004",
            }}
          />
        </View>
        {loading ? (
          <View className="h-[85%] px-3 flex justify-center items-center">
            <ActivityIndicator size="large" color="#228B22" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            <View className="flex flex-row justify-between items-center px-4 py-3">
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-[#228B22]/30 `}
              >
                <Text className={` font-medium`}>Budget</Text>
                <Text className={`text-lg font-bold text-blue-600`}>
                  {`₹${expenseData?.budget}`}
                </Text>
              </View>
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-[#228B22]/30 `}
              >
                <Text className={` font-medium`}>Spent</Text>
                <Text
                  className={`text-lg font-bold text-red-600`}
                >{`₹${expenseData?.spent}`}</Text>
              </View>
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-[#228B22]/30 `}
              >
                <Text className={` font-medium`}>Balance</Text>
                <Text className={`text-lg font-bold text-[#228B22]`}>
                  {`₹${expenseData?.balance}`}
                </Text>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 10,
                paddingBottom: 56,
                paddingHorizontal: 14,
              }}
              refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
              }
            >
              {expenseData?.expanses?.length > 0 ? (
                expenseData?.expanses?.map((item, index) => (
                  <ExpenseCard
                    getIconName={getIconName}
                    key={index}
                    item={item}
                    handleShowExpenseDetails={handleShowExpenseDetails}
                  />
                ))
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 50,
                  }}
                >
                  <Text style={{ color: "gray", fontWeight: "500" }}>
                    No Expense Added
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
        <View
          className={`flex flex-grow flex-row justify-between items-center w-full absolute bottom-16 px-4 py-2 bg-white `}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handleExport}>
            <View
              style={{ width: width * 0.45, backgroundColor: "#228B22" }}
              className=" py-3 rounded-lg flex justify-center items-center"
            >
              {exporting ? (
                <ActivityIndicator color={"white"} size={"small"} />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Export Excel
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => addExpenseDetailRef?.current?.open()}
          >
            <View
              style={{ width: width * 0.45, backgroundColor: "#228B22" }}
              className="py-3 rounded-lg flex justify-center  items-center"
            >
              <Text className="text-white text-base font-semibold">
                Add Expense
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={showExpenseDetailRef} adjustToContentHeight>
        <View className="px-3">
          <View className="flex justify-center items-center py-3">
            <Text className="text-xl font-semibold">Expense Details</Text>
          </View>
          <LabelValue label={"Category"} value={showExpenseDetails?.category} />
          <LabelValue label={"Notes"} value={showExpenseDetails?.note} />
          <LabelValue label={"Added By"} value={showExpenseDetails?.name} />
          <LabelValue label={"Amount"} value={showExpenseDetails?.amount} />
          <LabelValue
            label={"Date"}
            value={formatDate(showExpenseDetails?.date)}
          />
          <View className="w-full h-300 py-3 flex justify-center items-center">
            <Image
              source={showExpenseDetails?.receipt}
              className="w-44 h-44 object-cover"
            />
          </View>
          <View className="w-full flex justify-center items-center mb-3">
            <TouchableOpacity
              activeOpacity={0.9}
              style={{ width: width * 0.9 }}
              className=" bg-red-700 rounded-lg py-3 flex justify-center items-center"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
      <Modalize ref={addExpenseDetailRef} adjustToContentHeight>
        <View className="flex justify-center items-center py-2 mt-3">
          <Text className="text-lg font-semibold">Add Expense Details</Text>
        </View>
        <View className="px-6 pt-3 flex justify-center items-center gap-3 w-full ">
          <View style={expenseScreenStyles.pickerContainer}>
            <Picker
              selectedValue={expenseCategory}
              onValueChange={setExpenseCategory}
              dropdownIconColor="#228B22"
              style={expenseScreenStyles.picker}
            >
              <Picker.Item label="Select Category" value={null} />
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Transport" value="Transport" />
              <Picker.Item label="Stationary" value="Stationary" />
              <Picker.Item label="Trekking Kit" value="Trekking Kit" />
              <Picker.Item label="Gift" value="Gift" />
              <Picker.Item label="Accomodation" value="Accomodation" />
              <Picker.Item label="Miscellaneous" value="Miscellaneous" />
            </Picker>
          </View>
          <TextInput
            placeholder="Note"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            onChangeText={setNote}
            autoCapitalize="none"
            keyboardType="default"
            className="text-lg h-16 px-2 lowercase w-full outline-[#228B22] indent-3 border-2 border-[#228B22] rounded-[10px] p-1.5"
            placeholderTextColor={"#7d7d7d"}
          />
          <View className="w-full">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ alignSelf: "stretch", width: "100%" }}
            >
              <TextInput
                placeholder="Select Date"
                value={date}
                editable={false}
                className="text-lg px-2 h-16 lowercase w-full outline-[#228B22] indent-3 border-2 border-[#228B22] rounded-[10px] p-1.5"
                style={{
                  width: "100%",
                  borderColor: "#228B22",
                  borderWidth: 2,
                  borderRadius: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  fontSize: 16,
                  color: "black",
                }}
                placeholderTextColor="#7d7d7d"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          <TextInput
            placeholder="Amount"
            autoCapitalize="none"
            onChangeText={setAmount}
            keyboardType="number-pad"
            className="text-lg px-2 h-16 lowercase w-full outline-[#228B22] indent-3 border-2 border-[#228B22] rounded-[10px] p-1.5"
            placeholderTextColor={"#7d7d7d"}
          />
          <TouchableOpacity
            activeOpacity={0.9}
            style={{ width: "100%" }}
            onPress={pickImage}
          >
            <View className="h-32 flex justify-center items-center border-2 border-dashed rounded-lg mb-3 border-[#228B22] w-full overflow-hidden">
              {image ? (
                <View className="w-full h-full">
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: "100%",
                      height: 128,
                    }}
                  />
                </View>
              ) : (
                <View className="flex flex-row justify-center items-center space-x-3 w-full">
                  <Ionicons name="add-circle" size={20} color={"#228B22"} />
                  <Text className="text-base font-semibold text-[#228B22]">
                    Upload Receipt Image ( optional )
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View className="w-full flex justify-center items-center mb-3">
          <TouchableOpacity
            activeOpacity={0.9}
            style={{ width: width * 0.9 }}
            onPress={handleAddExpense}
          >
            <View className="flex justify-center items-center mt-2 bg-[#228B22] w-full py-3 rounded-[10px]">
              {loading ? (
                <ActivityIndicator size={"small"} color={"white"} />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Add Expense
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

export default expense;
