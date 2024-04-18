import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "react-native-user-avatar";
import Logo from "../assets/images/logo.png";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestoreDb } from "../components/config/firebase.config";
import { differenceInMinutes } from "date-fns";

const HomeScreen = () => {
  const user = useSelector((state) => state.user.user);
  const [isLoading, setisLoading] = useState(true);
  const [chats, setchats] = useState(null);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    const chatQuery = query(
      collection(firestoreDb, "chats"),
      orderBy("_id", "desc")
    );

    const unsubscribe = onSnapshot(chatQuery, (querySnapShot) => {
      const chatsRooms = querySnapShot.docs.map((doc) => doc.data());
      setchats(chatsRooms);
      setisLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <View className="flex-1 ">
      <SafeAreaView>
        <View className="w-full flex-row items-center justify-between px-4 py-2">
          <Image source={Logo} className="w-12 h-12" resizeMode="contain" />
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileScreen")}
            className="w-12 h-12 rounded-full  flex items-center justify-center"
          >
            <UserAvatar size={50} name={user?.fullName} />
          </TouchableOpacity>
        </View>
        {/* scroll view for messages */}
        <ScrollView className="w-full px-4 pt-4">
          <View className="w-full">
            {/* message title */}
            <View className="w-full flex-row items-center justify-between px-2">
              <Text className="text-base text-primaryText font-extrabold">
                MESSAGES
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddToChatScreen")}
                className="w-12 h-12 rounded-full  flex items-center justify-center"
              >
                <Ionicons name="chatbox" size={28} color="gray" />
              </TouchableOpacity>
            </View>
            {/* message body */}
            {isLoading ? (
              <>
                <View className="w-full flex items-center justify-center">
                  <ActivityIndicator size={"large"} color={"blue"} />
                </View>
              </>
            ) : (
              <>
                {chats && chats?.length > 0 ? (
                  <>
                    {chats?.map((room) => {
                      return <MessageBody key={room._id} room={room} />;
                    })}
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const MessageBody = ({ room }) => {
  const navigation = useNavigation();
  const [latestMessage, setLatestMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchLatestMessage = async () => {
      const msgQuery = query(
        collection(firestoreDb, "chats", room?._id, "messages"),
        orderBy("timeStamp", "desc")
      );

      const unsubscribe = onSnapshot(msgQuery, (querySnapShot) => {
        if (!querySnapShot.empty) {
          const latestMsg = querySnapShot.docs[0].data();
          setLatestMessage(latestMsg.message);
          setSenderName(latestMsg.user?.fullName);
          const timeStamp = latestMsg.timeStamp;
          if (timeStamp) {
            setLastMessageTime(timeStamp.toDate()); // Convert Firebase timestamp to Date object
          }
        }
      });

      return unsubscribe;
    };

    fetchLatestMessage();
  }, [room._id]);

  const getTimeElapsed = () => {
    if (!lastMessageTime) return ""; // Return empty string if lastMessageTime is not set

    const currentTime = new Date();
    const minutesElapsed = differenceInMinutes(currentTime, lastMessageTime);

    if (minutesElapsed < 1) {
      return "Just now";
    } else if (minutesElapsed < 60) {
      return `${minutesElapsed} min ago`;
    } else {
      const hoursElapsed = Math.floor(minutesElapsed / 60);
      return `${hoursElapsed} hour${hoursElapsed > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("ChatScreen", { room: room })}
      className="w-full flex-row items-center justify-start py-2"
    >
      {/* profile */}
      <View>
        <UserAvatar name={room.chatName} size={45} />
      </View>

      {/* content */}
      <View className="flex-1 flex items-start justify-center ml-4">
        <Text className="text-[#333] text-base font-semibold capitalize">
          {room.chatName}
        </Text>
        {latestMessage !== "" ? (
          <Text className="text-primaryText text-sm ">
            <Text style={{ fontWeight: "bold" }}>
              {senderName === user.fullName ? "You" : senderName}:{" "}
            </Text>
            {latestMessage.length > 15
              ? latestMessage.slice(0, 15)
              : latestMessage}
          </Text>
        ) : (
          <Text className="text-primaryText text-sm">No messages yet</Text>
        )}
      </View>

      {/* time */}
      <Text className="text-primaryText text-base px-2 font-semibold">
        {getTimeElapsed()}
      </Text>
    </TouchableOpacity>
  );
};

export default HomeScreen;
