import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import LoginImage from "../assets/images/login.jpeg";
import { UserInput } from "../components";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  firebaseAuth,
  firestoreDb,
} from "../components/config/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { SET_USER } from "../context/actions/userActions";

const LoginScreen = () => {
  const screenWidth = Math.round(Dimensions.get("window").width);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [getEmailValidationStatus, setGetEmailValidationStatus] =
    useState(false);
  const [alert, setalert] = useState(false);
  const [alertMessage, setalertMessage] = useState("");

  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (getEmailValidationStatus && email !== "") {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
        .then((userCred) => {
          if (userCred) {
            getDoc(doc(firestoreDb, "users", userCred?.user.uid)).then(
              (docSnap) => {
                if (docSnap.exists()) {
                  dispatch(SET_USER(docSnap.data()));
                } else {
                  setalert(true);
                  setalertMessage("User not found");
                  setInterval(() => {
                    setalert(false);
                  }, 2000);
                }
              }
            );
          }
        })
        .catch((err) => {
          console.log("error: ", err.message);
          if (err.message.includes("invalid-credential")) {
            setalert(true);
            setalertMessage("Wrong password!");
          } else {
            setalert(true);
            setalertMessage("Invalid Email Address!");
          }
          setInterval(() => {
            setalert(false);
          }, 2000);
        });
    } else {
      alert("Please enter valid email");
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
          GOOD TO SEE YOU BACK!
        </Text>
        <View className="w-full flex items-center justify-center">
          {/* alert */}
          {alert && (
            <Text className="text-base text-red-700">{alertMessage}</Text>
          )}

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
            onPress={handleLogin}
            className="w-full px-4 py-2 rounded-full bg-gray-500 my-3 flex items-center justify-center"
          >
            <Text className="py-2 text-white text-xl font-semibold">
              SIGN IN
            </Text>
          </TouchableOpacity>
          <View className="w-full py-12 flex-row items-center justify-center space-x-2">
            <Text className="text-base text-primaryText">
              DON'T HAVE AN ACCOUNT?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUpScreen")}
            >
              <Text className="text-base text-primaryText text-primaryBold">
                SIGN UP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
