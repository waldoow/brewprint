import React from "react";
import SignUp from "../(auth)/sign-up";

export default function HomeScreen() {
  return (
    <SignUp />
    // <>
    //   <Header
    //     title="Brewprint"
    //     subtitle="Your Coffee Journey"
    //     showBackButton={false}
    //     customContent={<ThemedButton title="New Brew" onPress={() => {}} />}
    //   />
    //   <ScrollView style={styles.container}>
    //     <ThemedButton
    //       title="New Brew"
    //       onPress={() => {
    //         toast.success("New Brew");
    //       }}
    //     />
    //     <ThemedInput
    //       placeholder="Search"
    //       value={"Search"}
    //       onChangeText={(text) => {
    //         console.log(text);
    //       }}
    //     />
    //     <ThemedText>
    //       Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
    //       quos.
    //     </ThemedText>
    //   </ScrollView>
    // </>
  );
}
