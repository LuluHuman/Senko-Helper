import { MD3DarkTheme, MD3LightTheme, PaperProvider, BottomNavigation } from "react-native-paper";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { Text, useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { BusIcon, PrayerTimesIcon } from "@/components/icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { theme } = useMaterial3Theme();

	const paperTheme =
		colorScheme === "dark"
			? { ...MD3DarkTheme, colors: theme.dark }
			: { ...MD3LightTheme, colors: theme.light };

	return (
		<PaperProvider theme={paperTheme}>
			<Stack>
				<Stack.Screen
					name="(tabs)"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="savedBusstops/index"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="searchBusstops/index"
					options={{ headerShown: false }}
				/>
			</Stack>

			<StatusBar style="auto" />
		</PaperProvider>
	);
}
