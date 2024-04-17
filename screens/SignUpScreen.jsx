import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import LoginImage from "../assets/images/login.jpeg";
import { UserInput } from "../components";
import { useNavigation } from "@react-navigation/native";
import UserAvatar from "react-native-user-avatar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  firebaseAuth,
  firestoreDb,
} from "../components/config/firebase.config";
import { doc, setDoc } from "firebase/firestore";

const SignUpScreen = () => {
  const screenWidth = Math.round(Dimensions.get("window").width);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [name, setname] = useState("");
  const [getEmailValidationStatus, setGetEmailValidationStatus] =
    useState(false);

  const generateAvatar = (fullName) => {
    // Generate an avatar based on the full name
    // You can use a library like react-native-user-avatar for this
    const initials = fullName
      .split(" ")
      .map((word) => word[0])
      .join("");
    return <UserAvatar size={50} name={initials} />;
  };

  const handleSignUp = async () => {
    if (getEmailValidationStatus && email !== "") {
      await createUserWithEmailAndPassword(firebaseAuth, email, password).then(
        (userCred) => {
          const data = {
            _id: userCred.user.uid,
            fullName: name,
            providerData: userCred.user.providerData[0],
          };
          setDoc(doc(firestoreDb, "users", userCred.user.uid), data).then(
            () => {
              navigation.navigate("LoginScreen");
            }
          );
        }
      );
    }
  };

  const navigation = useNavigation();
  return (
    <View className="flex-1 justify-start items-center">
      <Image
        source={LoginImage}
        resizeMode="cover"
        className="h-1/2"
        style={{ width: screenWidth }}
      />
      {/* Main View */}
      <View
        className="w-full h-full bg-white rounded-tl-[90px] -mt-44
            flex
            items-center
            justify-start
            py-6
            px-6
            space-y-6"
      >
        <Text className="py-2 text-primaryText text-xl font-semibold">
          Join with us!
        </Text>

        <View className="w-full flex items-center justify-center">
          {/* fullname */}
          <UserInput
            placeholder="Full Name"
            isPass={false}
            setStateValue={setname}
          />

          {/* email */}
          <UserInput
            placeholder="Email"
            isPass={false}
            setStateValue={setemail}
            setGetEmailValidationStatus={setGetEmailValidationStatus}
          />

          {/* password */}
          <UserInput
            placeholder="Password"
            isPass={true}
            setStateValue={setpassword}
          />

          {/* login button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="w-full px-4 py-2 rounded-xl bg-primary my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
          <View className="w-full py-12 flex-row items-center justify-center space-x-2">
            <Text className="text-base text-primaryText">
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text className="text-base text-primaryText text-primaryBold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignUpScreen;
