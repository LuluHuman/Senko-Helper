import { busStop, nextBus, services } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Arrow, DirectionBusDouble, NotAccessible, Schedule, VisitDouble } from "./icons";
import {
	Button,
	Dialog,
	Icon,
	IconButton,
	Portal,
	TextInput,
	TouchableRipple,
} from "react-native-paper";
import { appendData, getData, removeData } from "@/lib/db";
import { Material3Scheme } from "@pchmn/expo-material3-theme";
import { getBusArrival } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BusStopItem = ({
	busStop,
	colors,
	darkModeEnabled,
	paperTheme,
	setMenuVisible,
	menuVisible,
}: {
	busStop: busStop;
	colors: any;
	darkModeEnabled: boolean;
	paperTheme: any;
	setMenuVisible: React.Dispatch<React.SetStateAction<string | false>>;
	menuVisible: string | false;
}) => {
	const [expanded, setExpanded] = useState(false);
	const [arrivalData, setArrivalData] = useState<services>([]);
	const [arrivalsLoading, setArrivalsLoading] = useState(false);
	const [busStopIsSaved, setBusStopSaved] = useState<boolean>(false);
	const [busStopEdited, setBusStopEdited] = useState<boolean>(false);
	const [busStopEditedValue, setBusStopEditedValue] = useState<string>();
	const [busStopCustiomName, setBusStopCustiomNames] = useState<{ [key: string]: string }>({});

	const config = {
		duration: 500,
		easing: Easing.bezier(0.5, 0.01, 0, 1),
	};

	const styles = style(colors, paperTheme, darkModeEnabled);

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

	const getBusIcons = (bus: nextBus) => {
		var icons = [];
		if (bus.VisitNumber == "2")
			icons.push(
				<VisitDouble
					color={colors.text.secondary}
					key={"VisitDouble"}
				/>
			);
		if (bus.Type == "DD")
			icons.push(
				<DirectionBusDouble
					color={colors.text.secondary}
					key={"DirectionBusDouble"}
				/>
			);
		if (bus.Feature != "WAB")
			icons.push(
				<NotAccessible
					color={colors.text.secondary}
					key={"NotAccessible"}
				/>
			);

		if (bus.Monitored == 0)
			icons.push(
				<Schedule
					color={colors.text.secondary}
					key={"Schedule"}
				/>
			);

		return icons;
	};

	const rotate = useAnimatedStyle(() => ({
		transform: [{ rotate: withTiming(expanded ? "90deg" : "0deg", config) }],
	}));

	const toggleExpand = () => {
		if (!expanded) fetchBusArrivals(busStop.BusStopCode);
		setExpanded(!expanded);
	};

	const fetchBusArrivals = async (busStopCode: busStop["BusStopCode"]) => {
		setArrivalsLoading(true);
		getBusArrival(busStopCode).then((res) => {
			setArrivalsLoading(false);
			setArrivalData(res);
		});
	};

	const fetchCustomNames = async () => {
		try {
			const value = await AsyncStorage.getItem("custom-names");
			setBusStopCustiomNames(value !== null ? JSON.parse(value) : {});
		} catch (e) {
			alert("Error fetching custom names: " + e);
		}
	};

	const openMenu = () => setMenuVisible(busStop.BusStopCode);
	const closeMenu = () => {
		setMenuVisible(false);
		setBusStopEdited(false);
	};

	const renderArrival = (arrival: services[0]) => (
		<View
			key={arrival.ServiceNo}
			style={styles.arrivalRow}>
			<View
				style={{
					display: "flex",
					justifyContent: "center",
				}}>
				<Text style={styles.serviceNumber}>{arrival.ServiceNo}</Text>
			</View>
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
									justifyContent: "center",
								}}>
								<Text style={styles.arrivalTime}></Text>
							</View>
							<Text style={styles.arrivalActual}></Text>
						</View>
					);

				const estArr = new Date(bus.EstimatedArrival);
				const timeNow = new Date();

				const _timeLeftMs = estArr.getTime() - timeNow.getTime();
				const timeLeft = Math.max(0, Math.floor(_timeLeftMs / 60000));
				const busIcons = getBusIcons(bus);
				return (
					<View
						key={`arrival-${index}-${bus.EstimatedArrival}`}
						style={[styles.arrivalBox, getBorderStyle(bus.Load)]}>
						<View style={styles.arrivalTitleContainer}>
							<Text style={styles.arrivalTime}>
								{timeLeft < 1 ? "Arr" : timeLeft}
							</Text>
							{busIcons}
						</View>
						<Text style={styles.arrivalActual}>
							{estArr.toLocaleTimeString("en-US", { timeStyle: "short" })}
						</Text>
					</View>
				);
			})}
		</View>
	);

	function BusStop() {
		return (
			<View style={{ flex: 1 }}>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
					}}>
					{busStopIsSaved && (
						<Icon
							size={16}
							source={"heart"}
						/>
					)}
					<Text style={styles.busStopTitle}>
						{busStopCustiomName[busStop.BusStopCode] || busStop.Description}
					</Text>
				</View>
				<Text style={styles.busStopSubtitle}>
					{busStopCustiomName[busStop.BusStopCode] && busStop.Description + " • "}
					{busStop.RoadName} ({busStop.BusStopCode})
				</Text>
			</View>
		);
	}

	useEffect(() => {
		getData("saved-bus-stops").then((savedBusStops) => {
			const findBusStopInSaved = savedBusStops.find(
				({ BusStopCode }: busStop) => BusStopCode == busStop.BusStopCode
			);
			setBusStopSaved(Boolean(findBusStopInSaved));
		});
		fetchCustomNames();
	}, []);
	const isEmptyArray = arrivalData.length < 1;
	return (
		<View style={styles.busStopContainer}>
			<Portal>
				<Dialog
					visible={menuVisible !== false && menuVisible == busStop.BusStopCode}
					onDismiss={closeMenu}
					style={{ padding: 20, margin: 0 }}>
					<View
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
						}}>
						{busStopEdited ? (
							<TextInput
								placeholder={busStop.Description}
								onEndEditing={() => {
									if (!busStopEditedValue?.trim()) {
										const itemExists = busStopCustiomName[busStop.BusStopCode];
										if (itemExists) {
											delete busStopCustiomName[busStop.BusStopCode];
											AsyncStorage.setItem(
												"custom-names",
												JSON.stringify(busStopCustiomName)
											);
										}
										fetchCustomNames();
										setBusStopEditedValue(undefined);
										setBusStopEdited(false);
										return;
									}

									busStopCustiomName[busStop.BusStopCode] = busStopEditedValue;
									AsyncStorage.setItem(
										"custom-names",
										JSON.stringify(busStopCustiomName)
									);
								}}
								value={
									busStopEditedValue === undefined
										? busStopCustiomName[busStop.BusStopCode]
										: busStopEditedValue
								}
								onChangeText={(e) => setBusStopEditedValue(e)}
								style={{ flex: 1 }}
								autoFocus
							/>
						) : (
							<BusStop />
						)}
						<IconButton
							onPress={() => {
								console.log(busStopCustiomName);

								const busStopEditOpen = busStopEdited == true;
								const itemExists = busStopCustiomName[busStop.BusStopCode];
								if (busStopEditOpen) {
									if (itemExists) {
										delete busStopCustiomName[busStop.BusStopCode];
										AsyncStorage.setItem(
											"custom-names",
											JSON.stringify(busStopCustiomName)
										);
									}
									fetchCustomNames();
								}
								setBusStopEditedValue(undefined);
								setBusStopEdited((d) => !d);
							}}
							icon={busStopEdited ? "trash-can" : "square-edit-outline"}
						/>
					</View>
					<Button
						icon={busStopIsSaved ? "heart-off" : "heart"}
						style={{
							marginVertical: 16,
							padding: 4,
							backgroundColor: paperTheme.colors.elevation.level2,
						}}
						onPress={() => {
							busStopIsSaved
								? removeData("saved-bus-stops", busStop)
								: appendData("saved-bus-stops", busStop);
							setBusStopSaved(!busStopIsSaved);
							closeMenu();
						}}>
						{busStopIsSaved ? "Remove from saves" : "Save Bus stop"}
					</Button>
				</Dialog>
			</Portal>

			<TouchableRipple
				onPress={toggleExpand}
				onLongPress={openMenu}
				style={styles.busStopHeader}>
				<>
					<Animated.View style={[{ marginRight: 10 }, rotate]}>
						<Arrow color={colors.text.secondary}></Arrow>
					</Animated.View>
					<BusStop />
					{expanded && (
						<IconButton
							size={24}
							icon={"reload"}
							onPress={() => fetchBusArrivals(busStop.BusStopCode)}></IconButton>
					)}
				</>
			</TouchableRipple>

			{expanded &&
				(arrivalsLoading ? (
					<ActivityIndicator
						size="small"
						color={paperTheme.colors.primary}
						style={{ margin: 20 }}
					/>
				) : isEmptyArray ? (
					<Text style={styles.busStopErr}>Not In Operation (LTA Returned no busses)</Text>
				) : (
					arrivalData.map(renderArrival)
				))}
		</View>
	);
};

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
		busStopContainer: {
			backgroundColor: darkModeEnabled ? paperTheme.colors.elevation.level2 : "#fff",
			marginVertical: 8,
			marginHorizontal: 16,
			borderRadius: 10,
			overflow: "hidden",
		},
		busStopHeader: {
			flexDirection: "row",
			alignItems: "center",
			padding: 10,
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
			marginVertical: 4,
			marginHorizontal: 8,
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
		arrivalIconsContainer: {
			display: "flex",
			flexDirection: "row",
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
