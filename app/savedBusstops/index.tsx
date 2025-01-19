import { busStop } from "@/lib/types";
import React, { useCallback, useEffect, useState } from "react";
import { Text, StyleSheet, View, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { IconButton, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { router } from "expo-router";
import { getData } from "@/lib/db";
import { BusStopItem } from "@/components/BusStopItem";
import { GestureHandlerRootView, RefreshControl } from "react-native-gesture-handler";

export default function BusArrival() {
	const colorScheme = useColorScheme();
	const { theme } = useMaterial3Theme();

	const darkModeEnabled = colorScheme === "dark";
	const paperTheme = darkModeEnabled
		? { ...MD3DarkTheme, colors: theme.dark }
		: { ...MD3LightTheme, colors: theme.light };

	const colors = {
		text: {
			primary: darkModeEnabled ? "#fff" : paperTheme.colors.primary,
			secondary: darkModeEnabled ? "#aaa" : paperTheme.colors.secondary,
		},
	};

	const [loading, setLoading] = useState(true);
	const [savedBusStops, setSavedBusStops] = useState<busStop[] | null>(null);
	const [messageText, setMessage] = useState<string | undefined>();
	const [menuVisible, setMenuVisible] = useState<false | busStop["BusStopCode"]>(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		setLoading(true);
		getData("saved-bus-stops").then((busStops) => {
			setLoading(false);
			if (!busStops || busStops.length < 1) return setMessage("No Saved bus stops");
			setSavedBusStops(busStops);
		});
	}, []);

	const reloadData = useCallback(() => {
		setIsRefreshing(true);

		getData("saved-bus-stops").then((busStops) => {
			setIsRefreshing(false);
			if (!busStops || busStops.length < 1) return setMessage("No Saved bus stops");
			setSavedBusStops(busStops);
		});
	}, []);

	const styles = style(colors, paperTheme);
	return (
		<GestureHandlerRootView>
			<View style={styles.container}>
				<View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
					<IconButton
						icon={"arrow-left"}
						onPress={
							router.canGoBack() ? () => router.back() : () => router.navigate("/")
						}
					/>
					<Text style={styles.title}>Saved bus stops</Text>
				</View>

				{loading ? (
					<ActivityIndicator
						size="large"
						color={paperTheme.colors.primary}
					/>
				) : messageText ? (
					<View style={{ marginVertical: 50 }}>
						<Text style={styles.title}>{messageText}</Text>
					</View>
				) : (
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={reloadData}
								colors={[paperTheme.colors.onPrimary]}
							/>
						}
						data={savedBusStops}
						keyExtractor={(item) => item.BusStopCode}
						renderItem={({ item, index }) => (
							<BusStopItem
								busStop={item}
								darkModeEnabled={darkModeEnabled}
								colors={colors}
								paperTheme={paperTheme}
								setMenuVisible={setMenuVisible}
								menuVisible={menuVisible}
								key={index}
							/>
						)}
					/>
				)}
			</View>
		</GestureHandlerRootView>
	);
}

function style(
	colors: any,
	paperTheme: {
		colors: Material3Scheme;
		dark: boolean;
		roundness: number;
		animation: {
			scale: number;
			defaultAnimationDuration?: number;
		};
		version: 3;
		isV3: true;
	}
) {
	return StyleSheet.create({
		title: {
			fontSize: 24,
			color: colors.text.primary,
			textAlign: "center",
		},
		container: {
			flex: 1,
			backgroundColor: paperTheme.colors.elevation.level1,
			paddingTop: 50,
		},
	});
}
