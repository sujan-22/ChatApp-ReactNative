import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import UserAvatar from "react-native-user-avatar";
import { doc, setDoc } from "firebase/firestore";
import { firestoreDb } from "../components/config/firebase.config";

const AddToChatScreen = () => {
  const [addChat, setaddChat] = useState("");

  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);

  const createNewChat = async () => {
    let id = `${Date.now()}`;

    const _doc = {
      _id: id,
      user: user,
      chatName: addChat,
    };

    if (addChat != "") {
      setDoc(doc(firestoreDb, "chats", id), _doc)
        .then(() => {
          setaddChat("");
          navigation.replace("HomeScreen");
        })
        .catch((error) => {
          alert("Error: " + error);
        });
    }
  };

  return (
    <View className="flex-1">
      <View className="w-full bg-primary px-4 py-6 flex-[0.25]">
        <View className="flex-row items-center justify-between w-full px-4 py-12">
          {/* go back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color={"white"} />
          </TouchableOpacity>
          {/* middle */}

          {/* user profile */}
          <TouchableOpacity className="w-12 h-12 rounded-full  flex items-center justify-center">
            <UserAvatar size={50} name={user?.fullName} bgColor="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* chat section */}
      <View className="w-full bg-white px-4 py-6 rounded-3xl flex-1 rounded-t-[50px] -mt-10">
        <View className="w-full px-4 py-4">
          <View className="w-full px-4 flex-row items-center justify-between py-3 rounded-xl border border-gray-300 space-x-3">
            {/* icon */}
            <Ionicons name="chatbubbles" size={24} color={"gray"} />

            {/* text */}
            <TextInput
              className="flex-1 text-lg text-primaryText h-10 w-full"
              placeholder="Create a chat"
              placeholderTextColor={"gray"}
              value={addChat}
              onChangeText={(text) => setaddChat(text)}
            ></TextInput>

            {/* icon */}
            <TouchableOpacity onPress={createNewChat}>
              <FontAwesome name="send" size={24} color={"gray"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AddToChatScreen;
