import React from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const QRCodeGenerator = ({upiLink}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderWidth:1, padding:10, borderRadius:10 }}>
      <QRCode value={upiLink} size={200} />
    </View>
  );
};

export default QRCodeGenerator;
