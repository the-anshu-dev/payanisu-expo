import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { formatDate } from '../../utils/helpers';

const { height, width } = Dimensions.get("window");

const TourCard = ({ tourName, startDate, endDate, status, distance }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} style={{ width: width * 0.9, borderRadius: 10, padding: 10, elevation: 1 }} className=" bg-white w-full">
            <View className="flex flex-row justify-between items-center w-full">
                <Text className="text-2xl font-bold">{tourName}</Text>
                <Text className="border px-4 py-0.5 font-semibold rounded-full">{status === 1 ? "Booked" : status === 2 ? "Rejected" : "Pending"}</Text>
            </View>
            <View className="flex flex-row justify-between items-center mt-4">
                <View className="flex gap-3">
                    <Text className="font-semibold">Start Date : {formatDate(startDate)}</Text>
                    <Text className="font-semibold">End Date : {formatDate(endDate)}</Text>
                </View>
                <View className="flex gap-2 justify-center items-end">
                    <Text>Distance</Text>
                    <Text className="text-xl font-bold text-green-700">{distance} Kms</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default TourCard