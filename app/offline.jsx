import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Offline = () => {
  const [logs, setLogs] = useState([]);

  // Function to fetch logs from AsyncStorage
  const fetchLogs = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const logKeys = keys.filter(key => key.startsWith("log_")); // Filter log keys

    const logEntries = [];
    for (const key of logKeys) {
      const log = await AsyncStorage.getItem(key);
      if (log) {
        logEntries.push(JSON.parse(log));
      }
    }

    setLogs(logEntries);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Offline Logs
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {logs.length === 0 ? (
          <Text>No offline logs available</Text>
        ) : (
          logs.map((log, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#f1f1f1",
                padding: 10,
                marginVertical: 5,
                borderRadius: 5,
              }}
            >
              <Text>{log.message || `Check-in attempt for checkpoint ${log.checkPointId}`}</Text>
              <Text>Timestamp: {log.timestamp}</Text>
              {log.userLocation && (
                <Text>
                  User Location: {log.userLocation.latitude}, {log.userLocation.longitude}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Offline;