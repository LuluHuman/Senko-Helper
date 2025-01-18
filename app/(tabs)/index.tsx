import { busStop } from "@/lib/types";
import React, { useCallback, useEffect, useState } from "react";
import { Text, StyleSheet, View, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import * as Location from "expo-location";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { IconButton, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { router } from "expo-router";
import * as apis from "@/lib/api";
import { BusStopItem } from "@/components/BusStopItem";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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

	const styles = style(colors, paperTheme);

	const [loading, setLoading] = useState(true);
	const [busStops, setBusStops] = useState<busStop[]>([]);
	const [menuVisible, setMenuVisible] = useState<false | busStop["BusStopCode"]>(false); // Menu visibility state
	const [location, setLocation] = useState<Location.LocationObject>(); // Menu visibility state
	const [isRefreshing, setIsRefreshing] = useState(false);

	const fetchNearbyBusStops = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") return alert("Permission to access location was denied");
		let location = await Location.getCurrentPositionAsync({});
		setLocation(location);

		return apis.getNearbyBusStops({
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
		});
	};

	useEffect(() => {
		setLoading(true);
		fetchNearbyBusStops().then((busStops) => {
			setBusStops(busStops as busStop[]);
			setLoading(false);
		});
	}, []);

	const reloadData = useCallback(() => {
		setIsRefreshing(true);
		fetchNearbyBusStops().then((busStops) => {
			setBusStops(busStops as busStop[]);
			setIsRefreshing(false);
		});
	}, []);

	return (
		<GestureHandlerRootView>
			<View style={styles.container}>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingHorizontal: 16,
						height: 50,
					}}>
					<Text style={styles.title}>{"Nearby bus stops"}</Text>
					<View
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flexDirection: "row",
						}}>
						<IconButton
							icon={"heart"}
							onPress={() => router.push("/savedBusstops")}
						/>
						<IconButton
							icon={"magnify"}
							onPress={() => router.push("/searchBusstops")}
						/>
					</View>
				</View>

				<View>
					<MapView
						style={{ height: 250 }}
						region={{
							latitude: location?.coords.latitude || 0,
							longitude: location?.coords.longitude || 0,
							latitudeDelta: 0.0015,
							longitudeDelta: 0.00121,
						}}
						mapType={"satellite"}
						showsUserLocation={true}>
						{busStops.map((busStop: busStop) => {
							return (
								<Marker
									key={busStop.BusStopCode}
									coordinate={{
										latitude: busStop.Latitude,
										longitude: busStop.Longitude,
									}}
									title={busStop.Description}
									description={busStop.RoadName}
								/>
							);
						})}
					</MapView>
				</View>
				{loading ? (
					<ActivityIndicator
						size="large"
						color={paperTheme.colors.primary}
					/>
				) : (
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={reloadData}
								colors={[paperTheme.colors.onPrimary]}
							/>
						}
						data={busStops}
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
