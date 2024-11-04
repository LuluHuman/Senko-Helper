import { busStop, nextBus, services } from "../lib/types";
import React, { useEffect, useState } from "react";
import {
	Text,
	StyleSheet,
	View,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	useColorScheme,
} from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Location from "expo-location";
import axios from "axios";
import { Arrow, DirectionBusDouble, NotAccessible, VisitDouble } from "../../components/icons";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

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

	const styles = style(colors, paperTheme, darkModeEnabled);

	const [busStops, setBusStops] = useState<busStop[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				alert("Permission to access location was denied");
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			fetchNearbyBusStops(location.coords.latitude, location.coords.longitude);
		})();
	}, []);

	const fetchNearbyBusStops = async (
		latitude: busStop["Latitude"],
		longitude: busStop["Longitude"]
	) => {
		try {
			setLoading(true);
			const response = await axios.get(
				`https://rurutbl.luluhoy.tech/api/nearby-busstops?lat=${latitude}&lon=${longitude}`
			);
			setBusStops(response.data);
		} catch (error) {
			console.error(error);
			alert("Error fetching bus stops.");
		} finally {
			setLoading(false);
		}
	};

	const BusStopItem = ({ busStop }: { busStop: busStop }) => {
		const [expanded, setExpanded] = useState(false);
		const [arrivalData, setArrivalData] = useState<services>([]);
		const [arrivalsLoading, setArrivalsLoading] = useState(false);
		const config = {
			duration: 500,
			easing: Easing.bezier(0.5, 0.01, 0, 1),
		};

		const style = useAnimatedStyle(() => {
			return {
				transform: [{ rotate: withTiming(expanded ? "90deg" : "0deg", config) }],
			};
		});
		const toggleExpand = () => {
			if (!expanded) {
				fetchBusArrivals(busStop.BusStopCode);
			}
			setExpanded(!expanded);
		};

		const fetchBusArrivals = async (busStopCode: busStop["BusStopCode"]) => {
			try {
				setArrivalsLoading(true);
				const response = await axios.get(
					`https://rurutbl.luluhoy.tech/api/bus-arrival?BusStopCode=${busStopCode}`
				);
				setArrivalData(response.data);
			} catch (error) {
				console.error(error);
				alert("Error fetching bus arrival data.");
			} finally {
				setArrivalsLoading(false);
			}
		};

		const renderArrival = (arrival: services[0]) => (
			<View
				key={arrival.ServiceNo}
				style={styles.arrivalRow}>
				<Text style={styles.serviceNumber}>{arrival.ServiceNo}</Text>
				{[arrival.NextBus, arrival.NextBus2, arrival.NextBus3].map((bus, index) => {
					if (!bus.EstimatedArrival)
						return (
							<View
								key={`arrival-${index}-noarr`}
								style={[styles.arrivalBox]}>
								<View
									style={{
										display: "flex",
										flexDirection: "row",
										alignItems: "center",
									}}>
									<Text style={styles.arrivalTime}></Text>
									{icons}
								</View>
								<Text style={styles.arrivalActual}></Text>
							</View>
						);

					const estArr = new Date(bus.EstimatedArrival);
					const timeNow = new Date();
					const timeLeft = Math.max(
						0,
						Math.floor((estArr.getTime() - timeNow.getTime()) / 60000)
					);
					var icons = [];
					if (bus.VisitNumber == "2")
						icons.push(<VisitDouble color={colors.text.primary} />);
					if (bus.Type == "DD")
						icons.push(<DirectionBusDouble color={colors.text.primary} />);
					if (bus.Feature != "WAB")
						icons.push(<NotAccessible color={colors.text.primary} />);
					const getBorderStyle = (loadType: nextBus["Load"]) => {
						switch (loadType) {
							case "SEA":
								return styles.borderSEA;
							case "SDA":
								return styles.borderSDA;
							case "LSD":
								return styles.borderLSD;
							default:
								return {};
						}
					};
					return (
						<View
							key={`arrival-${index}-${bus.EstimatedArrival}`}
							style={[styles.arrivalBox, getBorderStyle(bus.Load)]}>
							<View style={styles.arrivalTitleContainer}>
								<Text style={styles.arrivalTime}>
									{timeLeft < 1 ? "Arr" : timeLeft}
								</Text>
								{icons}
							</View>
							<Text style={styles.arrivalActual}>
								{estArr.toLocaleTimeString("en-US", { timeStyle: "short" })}
							</Text>
						</View>
					);
				})}
			</View>
		);

		return (
			<View
				style={styles.busStopContainer}
				key={busStop.BusStopCode}>
				<TouchableOpacity
					onPress={toggleExpand}
					style={styles.busStopHeader}>
					<Animated.View style={[{ marginRight: 10 }, style]}>
						<Arrow color={colors.text.secondary}></Arrow>
					</Animated.View>
					<View>
						<Text style={styles.busStopTitle}>{busStop.Description}</Text>
						<Text style={styles.busStopSubtitle}>
							{busStop.RoadName} ({busStop.BusStopCode})
						</Text>
					</View>
				</TouchableOpacity>
				{expanded &&
					(arrivalsLoading ? (
						<ActivityIndicator
							size="small"
							color={paperTheme.colors.primary}
						/>
					) : arrivalData.length < 1 ? (
						<Text style={styles.busStopErr}>
							Not In Operation (LTA Returned no busses)
						</Text>
					) : (
						arrivalData.map(renderArrival)
					))}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Nearby Busses</Text>
			{loading ? (
				<ActivityIndicator
					size="large"
					color={paperTheme.colors.primary}
				/>
			) : (
				<FlatList
					data={busStops}
					keyExtractor={(item) => item.BusStopCode}
					renderItem={({ item, index }) => (
						<BusStopItem
							busStop={item}
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
	},
	darkModeEnabled: boolean
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
		busStopContainer: {
			backgroundColor: darkModeEnabled ? paperTheme.colors.elevation.level2 : "#fff",
			padding: 10,
			marginVertical: 8,
			marginHorizontal: 16,
			borderRadius: 8,
		},
		busStopHeader: {
			flexDirection: "row",
			alignItems: "center",
		},
		busStopTitle: {
			color: colors.text.primary,
			fontSize: 18,
			fontWeight: "bold",
		},
		busStopSubtitle: {
			color: colors.text.secondary,
			fontSize: 14,
		},
		busStopErr: {
			color: paperTheme.colors.error,
			textAlign: "center",
			margin: 16,
		},
		arrivalRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginVertical: 5,
		},
		serviceNumber: {
			color: colors.text.primary,
			fontSize: 16,
			fontWeight: "bold",
			display: "flex",
			alignItems: "center",
			paddingHorizontal: 8,
			paddingVertical: 4,
			width: 44,
		},
		arrivalTimes: {
			flexDirection: "row",
		},
		arrivalBox: {
			backgroundColor: paperTheme.colors.secondaryContainer,
			padding: 5,
			width: 70,
			marginHorizontal: 5,
			borderRadius: 4,
			alignItems: "center",
			justifyContent: "center",
		},
		arrivalTime: {
			color: colors.text.primary,
			fontSize: 14,
		},
		arrivalTitleContainer: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
		},
		arrivalActual: {
			color: colors.text.secondary,
			fontSize: 12,
		},
		borderSEA: {
			borderLeftColor: "rgb(74, 222, 128)",
			borderLeftWidth: 4,
		},
		borderSDA: {
			borderLeftColor: "rgb(202, 138, 4)",
			borderLeftWidth: 4,
		},
		borderLSD: {
			borderLeftColor: "red",
			borderLeftWidth: 4,
		},
	});
}
