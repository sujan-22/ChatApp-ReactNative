import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import UserAvatar from "react-native-user-avatar";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { firestoreDb } from "../components/config/firebase.config";

const ChatScreen = ({ route }) => {
  const { room } = route.params;
  const user = useSelector((state) => state.user.user);
  const [isLoading, setisLoading] = useState(true);
  const [message, setmessage] = useState("");
  const [messages, setMessages] = useState(null);

  const navigation = useNavigation();

  const sendMessage = async () => {
    const timeStamp = serverTimestamp();
    const id = `${Date.now()}`;
    const _doc = {
      _id: id,
      roomId: room._id,
      user: user,
      chatName: room.chatName,
      message: message,
      timeStamp: timeStamp,
    };

    setmessage("");
    await addDoc(
      collection(doc(firestoreDb, "chats", room._id), "messages"),
      _doc
    )
      .then(() => {})
      .catch((err) => {
        alert("Error adding message: " + err.message);
      });
  };

  useLayoutEffect(() => {
    const msgQuery = query(
      collection(firestoreDb, "chats", room?._id, "messages"),
      orderBy("timeStamp", "asc")
    );

    const unsubscribe = onSnapshot(msgQuery, (querySnapShot) => {
      const messages = querySnapShot.docs.map((doc) => doc.data());
      setMessages(messages);
      setisLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <View className="flex-1">
      <View className="w-full bg-primary px-4 py-6 flex-[0.24]">
        <View className="flex-row items-center justify-between w-full px-4 py-5">
          {/* go back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color={"white"} />
          </TouchableOpacity>

          {/* middle */}
          <View className="flex-row items-center justify-end space-x-3">
            <View className="w-14 h-14 rounded-full border border-black flex items-center justify-center p-2">
              <FontAwesome5 name="users" size={32} color={"black"} />
            </View>
            <View>
              <Text className="text-black-50 text-base font-extrabold capitalize">
                {room.chatName.length > 15
                  ? `${room.chatName.slice(0, 15)}...`
                  : room.chatName}
              </Text>
              <Text className="text-black-100 text-sm font-semibold capitalize">
                Online
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center space-x-3"></View>
        </View>
      </View>

      <View className="w-full bg-white px-4 py-6 rounded-3xl flex-1 rounded-t-[50px] -mt-10">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={160}
        >
          <>
            <ScrollView>
              {isLoading ? (
                <>
                  <View className="w-full flex items-center justify-center">
                    <ActivityIndicator size={"large"} color={"blue"} />
                  </View>
                </>
              ) : (
                <>
                  {/* messages */}
                  {messages?.map((msg, i) =>
                    msg.user.providerData.email === user.providerData.email ? (
                      <View className="m-1" key={i}>
                        <View
                          style={{ alignSelf: "flex-end" }}
                          className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-primary w-auto relative"
                        >
                          <Text className="text-base font-semibold text-white">
                            {msg.message}
                          </Text>
                        </View>
                        <View style={{ alignSelf: "flex-end" }}>
                          {msg?.timeStamp?.seconds && (
                            <Text className="text-xs text-black font-semibold">
                              {new Date(
                                msg.timeStamp.seconds * 1000
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </Text>
                          )}
                        </View>
                      </View>
                    ) : (
                      <View
                        key={i}
                        style={{ alignSelf: "flex-start" }}
                        className="flex items-center justify-start space-x-2"
                      >
                        <View className="flex-row items-center justify-center space-x-2">
                          <View className="w-12 h-12 rounded-full  flex items-center justify-center">
                            <UserAvatar name={msg?.user?.fullName} />
                          </View>

                          {/* text message */}
                          <View className="m-1">
                            <View className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl bg-gray-300 w-auto relative">
                              <Text className="text-base font-semibold text-black">
                                {msg.message}
                              </Text>
                            </View>
                            <View style={{ alignSelf: "flex-start" }}>
                              {msg?.timeStamp?.seconds && (
                                <Text className="text-xs text-black font-semibold">
                                  {new Date(
                                    msg.timeStamp.seconds * 1000
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                  })}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    )
                  )}
                </>
              )}
            </ScrollView>
            <View className="w-full flex-row items-center justify-center px-8">
              <View className="bg-gray-200 rounded-2xl px-4 space-x-5 py-2 flex-row items-center justify-around">
                <TouchableOpacity>
                  <Entypo name="emoji-happy" size={24} color={"gray"} />
                </TouchableOpacity>

                <TextInput
                  className=" w-9/12 text-base text-primaryText font-semibold"
                  placeholder="Say something..."
                  placeholderTextColor={"gray"}
                  value={message}
                  onChangeText={(text) => setmessage(text)}
                ></TextInput>

                <TouchableOpacity>
                  <Entypo name="camera" size={24} color="gray" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={sendMessage} className="pl-4">
                <FontAwesome name="send" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default ChatScreen;
