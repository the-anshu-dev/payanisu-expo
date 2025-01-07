import {
  Text,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";
import { shorten } from "../../components/UI/PostComponent";
import DropDownPicker from "react-native-dropdown-picker";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { exportDataToExcel, formatDate } from "../../utils/helpers.js";
import { Image } from "expo-image";
import { uploadFileToS3 } from "../../utils/uploadFileHelper.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format as formatDateFns } from "date-fns";
import LabelValue from "../../components/UI/LabelValue.jsx";

const { width, height } = Dimensions.get("window");

const expense = () => {
  const { tour } = useSelector((state) => state.tour);
  const { user } = useSelector((state) => state.user);

  const toursDataForDropdown = tour.map((t) => {
    return { label: t.name, value: t._id };
  });

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
      Alert.alert("Empty Field", "All fields required.");
      return;
    }

    setLoading(true);
    try {
      const imgUrl = image ? await uploadFileToS3(image) : null;
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
      console.error(error);
      Alert.alert("Oops!", "Something went wrong!\n\nPlease try again");
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

  useEffect(() => {
    if (currentTour) {
      fetchExpense();
    }
  }, [currentTour]);

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
      console.error("Failed to load expenses --->", error.message);
      Alert.alert("Something went wrong", "Please try again.");
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
      console.log("Error exporting expense data: ", error);
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
      console.log("Failed to find data", error);
    }
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      if (currentTour) {
        fetchExpense();
      }
    } finally {
      setRefresh(false);
    }
  };

  return (
    <>
      <View className="mt-16 h-full w-full relative">
        <View className="z-50 px-3">
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
            <ActivityIndicator size="large" color="green" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            <View className="flex flex-row justify-between items-center px-3 py-3">
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-green-600/30 `}
              >
                <Text className={` font-medium`}>Budget</Text>
                <Text className={`text-lg font-bold text-blue-600`}>
                  {`₹${expenseData?.budget}`}
                </Text>
              </View>
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-green-600/30 `}
              >
                <Text className={` font-medium`}>Spent</Text>
                <Text
                  className={`text-lg font-bold text-red-600`}
                >{`₹${expenseData?.spent}`}</Text>
              </View>
              <View
                className={`w-[30%] rounded-lg flex justify-center items-center h-[70px] space-y-1 bg-green-600/30 `}
              >
                <Text className={` font-medium`}>Balance</Text>
                <Text className={`text-lg font-bold text-green-600`}>
                  {`₹${expenseData?.balance}`}
                </Text>
              </View>
            </View>
            <View className=" h-[75%] px-4">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 56 }}
                refreshControl={
                  <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }
              >
                {expenseData?.expanses?.map((item, index) => (
                  <View
                    key={index}
                    className={`flex flex-row w-full justify-between items-center px-2 py-2 bg-white shadow-xl  shadow-black/50 rounded-lg mb-2`}
                  >
                    <View className="flex flex-row w-[40%] justify-start items-center space-x-3">
                      <Ionicons
                        name={getIconName(item.category)}
                        size={24}
                        color={"green"}
                      />
                      <View>
                        <Text className={` font-semibold`}>
                          {shorten(item.category, 20)}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {formatDate(item?.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Text>{shorten(item.name, 8)}</Text>
                    <View className="flex flex-row justify-center items-center space-x-4">
                      <Text className={`w-14 text-right font-medium  `}>
                        ₹ {item.amount}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleShowExpenseDetails(item._id)}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={20}
                          color={"green"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
        <View
          className={`flex flex-grow flex-row justify-between items-center w-full bottom-14 px-6 py-2 bg-transparent `}
        >
          <TouchableOpacity activeOpacity={0.7} onPress={handleExport}>
            {exporting ? (
              <ActivityIndicator color={"white"} size={"small"} />
            ) : (
              <View className="bg-green-700 py-2 rounded-lg flex justify-center items-center w-[160px]">
                <Text className="text-white text-base font-semibold">
                  Export Excel
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => addExpenseDetailRef?.current?.open()}
          >
            <View className="bg-green-700 py-2 rounded-lg flex justify-center  items-center w-[160px]">
              <Text className="text-white text-base font-semibold">
                Add Expense
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={showExpenseDetailRef} adjustToContentHeight>
        <View className="px-3">
          <View className="flex justify-center items-center py-2">
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
              activeOpacity={0.7}
              className="w-56 bg-red-700 rounded-lg py-2 flex justify-center items-center"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
      <Modalize ref={addExpenseDetailRef} adjustToContentHeight>
        <View className="flex justify-center items-center py-2">
          <Text className="text-lg font-semibold">Add Expense Details</Text>
        </View>
        <View className="px-6 pt-3 flex justify-center items-center space-y-3 w-full ">
          <TextInput
            placeholder="Category [e.g., Food, Accomodation]..."
            onChangeText={setExpenseCategory}
            autoCapitalize="none"
            keyboardType="default"
            className="text-black text-base font-semibold px-2 lowercase w-full outline-green-700 indent-3 border-2 border-green-700 rounded-[10px] p-1.5"
            placeholderTextColor={"#7d7d7d"}
          />
          <TextInput
            placeholder="Note"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            onChangeText={setNote}
            autoCapitalize="none"
            keyboardType="default"
            className="text-black text-base font-semibold px-2 lowercase w-full outline-green-700 indent-3 border-2 border-green-700 rounded-[10px] p-1.5"
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
                style={{
                  width: "100%",
                  borderColor: "green",
                  borderWidth: 2,
                  borderRadius: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  fontSize: 16,
                  fontWeight: "bold",
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
            className="text-black text-base font-semibold px-2 lowercase w-full outline-green-700 indent-3 border-2 border-green-700 rounded-[10px] p-1.5"
            placeholderTextColor={"#7d7d7d"}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ width: "100%" }}
            onPress={pickImage}
          >
            <View className="h-32 flex justify-center items-center border-2 border-dashed rounded-lg mb-3 border-green-600 w-full overflow-hidden">
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
                  <Ionicons name="add-circle" size={20} color={"green"} />
                  <Text className="text-base font-semibold text-green-600">
                    Upload Receipt Image ( optional )
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View className="w-full flex justify-center items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ width: width * 0.7 }}
            onPress={handleAddExpense}
          >
            <View className="flex justify-center items-center mt-2 bg-green-600 w-full py-2 rounded-[10px]">
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
    </>
  );
};

export default expense;
