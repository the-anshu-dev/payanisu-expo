import { View, Text } from "react-native";
import React from "react";
import QRCode from "react-native-qrcode";

const QRCodeGenerator = ({ id }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ marginBottom: 10 }}>Scan this QR code:</Text>
      <QRCode value={id} size={200} />
    </View>
  );
};

export default QRCodeGenerator;
