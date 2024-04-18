import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import UserAvatar from "react-native-user-avatar";
import { firebaseAuth } from "../components/config/firebase.config";
import { SET_USER_NULL } from "../context/actions/userActions";

const ProfileScreen = () => {
  const user = useSelector((state) => state.user.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await firebaseAuth.signOut().then(() => {
      dispatch(SET_USER_NULL());
      // Reset navigation to LoginScree
    });
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-start">
      {/* icons */}
      <View className="w-full flex-row items-center justify-between px-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={30} color={"black"} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="dots-three-vertical" size={30} color={"black"} />
        </TouchableOpacity>
      </View>

      {/* profile */}
      <View className="items-center justify-center">
        <View className="flex items-center justify-center">
          <UserAvatar size={80} name={user?.fullName} />
        </View>
        <Text className="text-2xl font-bold pt-3 mt-2">{user?.fullName}</Text>
        <Text className="text-base font-semibold text-primaryText">
          {user?.providerData.email}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleLogout}
        className="w-full mt-5 px-6 flex-row items-center justify-center"
      >
        <Text className="text-lg font-semibold text-primaryText px-3">
          LOGOUT
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;
