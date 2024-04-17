import { View, Text, ActivityIndicator, Image } from "react-native";
import React, { useLayoutEffect } from "react";
import Logo from "../assets/images/logo.png";
import {
  firebaseAuth,
  firestoreDb,
} from "../components/config/firebase.config";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { SET_USER } from "../context/actions/userActions";

const SplashScreen = () => {
  useLayoutEffect(() => {
    checkLoggedUser();
  }, []);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const checkLoggedUser = async () => {
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred?.uid) {
        getDoc(doc(firestoreDb, "users", userCred?.uid))
          .then((docSnap) => {
            if (docSnap.exists()) {
              console.log("user data: ", docSnap.data());
              dispatch(SET_USER(docSnap.data()));
            }
          })
          .then(() => {
            setTimeout(() => {
              navigation.replace("HomeScreen");
            }, 2000);
          });
      } else {
        navigation.replace("LoginScreen");
      }
    });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Image source={Logo} className="w-30 h-24" resizeMode="contain" />
      <ActivityIndicator size={"large"} color={"blue"} />
    </View>
  );
};

export default SplashScreen;
