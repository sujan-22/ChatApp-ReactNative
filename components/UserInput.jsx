import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

const UserInput = ({
  placeholder,
  isPass,
  setStateValue,
  setGetEmailValidationStatus,
}) => {
  const [value, setvalue] = useState("");
  const [showPass, setshowPass] = useState(true);
  const [icon, seticon] = useState(null);
  const [isEmailValid, setisEmailValid] = useState(false);

  const handleChange = (text) => {
    setvalue(text);
    setStateValue(text); // Use 'text' instead of 'value'

    if (placeholder === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const status = emailRegex.test(text); // Use 'text' instead of 'value'
      setisEmailValid(status);
      setGetEmailValidationStatus(status);
    }
  };

  useLayoutEffect(() => {
    switch (placeholder) {
      case "Full Name":
        return seticon("person");
      case "Email":
        return seticon("email");
      case "Password":
        return seticon("lock");
      case "Confirm Password":
    }
  }, []);

  return (
    <View
      className={`border rounded-full px-8 py-4 flex-row items-center justify-between space-x-4 my-2 ${
        !isEmailValid && placeholder == "Email" && value.length > 0
          ? "border-red-500"
          : "border-gray-200"
      }`}
    >
      <MaterialIcons name={icon} size={24} color={"gray"} />
      <TextInput
        className="flex-1 items-center text-base text-primaryText font-semibold -mt-2"
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        secureTextEntry={isPass && showPass}
        autoCapitalize="none"
      />
      {isPass && (
        <TouchableOpacity onPress={() => setshowPass(!showPass)}>
          <Entypo
            name={`${showPass ? "eye" : "eye-with-line"}`}
            size={24}
            color={"gray"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserInput;
