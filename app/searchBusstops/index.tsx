import { busStop } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { IconButton, MD3DarkTheme, MD3LightTheme, Searchbar } from "react-native-paper";
import { router } from "expo-router";
import * as apis from "@/lib/api";
import { BusStopItem } from "@/components/BusStopItem";
import { NavigationContainer } from "@react-navigation/native";

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

	const [loading, setLoading] = useState(false);
	const [menuVisible, setMenuVisible] = useState<false | busStop["BusStopCode"]>(false); // Menu visibility state
	const [busStopSearch, setBusStopQuery] = useState<string | null>(null);
	const [busStopResults, setBusStopResults] = useState<busStop[] | null>(null);

	useEffect(() => {
		if (!busStopSearch || busStopSearch.trim() === "") return setBusStopResults(null);
		fetchSearchResults(busStopSearch);
	}, [busStopSearch]);

	const fetchSearchResults = async (busStopSearch: string) => {
		setLoading(true);
		apis.searchBusstops(busStopSearch).then((busStopR) => {
			setBusStopResults(busStopR);
			setLoading(false);
		});
	};

	const styles = style(colors, paperTheme);
	return (
		<View style={styles.container}>
			<View
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 12,
					height: 50,
				}}>
				<Searchbar
					style={{ flex: 1 }}
					placeholder="Search for Bus stops"
					icon={"arrow-left"}
					onIconPress={
						router.canGoBack() ? () => router.back() : () => router.navigate("/")
					}
					ref={(ref) => ref?.focus()}
					onChangeText={setBusStopQuery}
					value={busStopSearch || ""}
					autoFocus
				/>
			</View>
			{loading ? (
				<ActivityIndicator
					size="large"
					style={{ margin: 12 }}
					color={paperTheme.colors.primary}
				/>
			) : (
				<FlatList
					data={busStopResults}
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
