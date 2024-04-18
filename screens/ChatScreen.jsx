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
import React, { useLayoutEffect, useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
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
  const scrollViewRef = useRef();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setisLoading] = useState(true);
  const [message, setmessage] = useState("");
  const [messages, setMessages] = useState(null);

  const navigation = useNavigation();

  const sendMessage = async (message) => {
    if (message === "") {
      return;
    }
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

  const sendAltitude = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        if (latitude && longitude) {
          const altitudeMessage = `altitude:${latitude},longitude:${longitude}`;
          await sendMessage(altitudeMessage);
        }
      }
    } catch (error) {
      console.error("Error getting altitude:", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
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
      scrollToBottom();
    });

    return unsubscribe;
  }, []);

  const renderMessage = (msg, i) => {
    let altitude;
    let longitude;

    const [altitudePart, longitudePart] = msg.message.split(",");
    altitude = altitudePart.split(":")[1];
    longitude = longitudePart.split(":")[1];

    return (
      <MapView
        key={i}
        style={{
          width: 250,
          height: 200,
          borderRadius: 20,
          alignSelf: "flex-end",
          marginVertical: 5,
        }}
        mapType="standard"
        initialRegion={{
          latitude: altitude,
          longitude: longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker coordinate={{ latitude: altitude, longitude: longitude }} />
      </MapView>
    );
  };

  return (
    <View className="flex-1">
      <View className="w-full bg-gray-200 px-4 py-6 flex-[0.2]">
        <View className="flex-row items-center justify-between w-full px-4 py-5">
          {/* go back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={30} color={"black"} />
          </TouchableOpacity>

          {/* middle */}
          <View className="flex-column items-center justify-center">
            <View className="flex items-center justify-center p-2">
              <UserAvatar name={room.chatName} size={45} />
            </View>
            <View>
              <Text className="text-black-50 text-base font-semibold capitalize">
                {room.chatName.length > 15
                  ? `${room.chatName.slice(0, 15)}...`
                  : room.chatName}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center mx-3"></View>
        </View>
      </View>

      <View className="w-full bg-white px-4 pb-5 flex-1 -mt-10">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={160}
        >
          <>
            <ScrollView
              showsVerticalScrollIndicator="false"
              ref={scrollViewRef}
              onContentSizeChange={() => scrollToBottom()}
            >
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
                        {msg.message.startsWith("altitude:") ? (
                          renderMessage(msg, i)
                        ) : (
                          <View
                            style={{ alignSelf: "flex-end" }}
                            className="px-4 py-2 rounded-tl-xl rounded-tr-xl rounded-bl-2xl bg-gray-400 w-auto relative"
                          >
                            <Text className="text-base font-semibold text-white">
                              {msg.message}
                            </Text>
                          </View>
                        )}
                        <>
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
                        </>
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
                            {msg.message.startsWith("altitude:") ? (
                              <>{renderMessage(msg, i)}</>
                            ) : (
                              <View className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl bg-blue-300 w-auto relative">
                                <Text className="text-base font-semibold text-black">
                                  {msg.message}
                                </Text>
                              </View>
                            )}

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
                  className=" w-9/12 text-base relative bottom-1 h-8 text-primaryText font-semibold"
                  placeholder="Say something..."
                  placeholderTextColor={"gray"}
                  value={message}
                  onChangeText={(text) => setmessage(text)}
                ></TextInput>

                <TouchableOpacity onPress={sendAltitude}>
                  <FontAwesome name="map-marker" size={24} color="gray" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => sendMessage(message)}
                className="pl-4"
              >
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
