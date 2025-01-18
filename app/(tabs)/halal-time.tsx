import { MUISPrayerTime } from "@/lib/types";
import { CircularProgress } from "@/components/CircularProgress";

import axios from "axios";

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, useColorScheme, Platform } from "react-native";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NavigationContainer } from "@react-navigation/native";

const NOTIFICATION_TASK = "NOTIFICATION_TASK";

export default function PrayerTime() {
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

	const [prayerTimesData, setPrayerTimesData] = useState<MUISPrayerTime>();
	const [prayerTimes, setPrayerTimes] = useState<number[]>();
	const [current, setCurrent] = useState<{
		percentage: number;
		timeLeft: number;
		prayer_time_index: number;
	}>({
		percentage: 0,
		timeLeft: 0,
		prayer_time_index: 0,
	});

	const [loading, setLoading] = useState(true);

	const prayer_names = ["Fajir", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
	useEffect(() => {
		registerBackgroundTask();

		(async () => {
			try {
				setLoading(true);
				const prayerTimesRes = await fetchPrayerTimes();
				const prayerTimesMap = prayerTimesRes.map((time, i) => {
					const afternoon = i > 1 ? 12 : 0;
					const [hours, minutes] = time.split(":").map(Number);

					const date = new Date();
					date.setHours(hours + afternoon, minutes, 0, 0);

					return date.getTime();
				});
				setPrayerTimes(prayerTimesMap);

				const { status } = await Notifications.requestPermissionsAsync();
				if (status !== "granted") {
					console.warn("Notification permissions not granted");
					return;
				}
				const notificationTime = new Date();
				notificationTime.setSeconds(notificationTime.getSeconds() + 10);

				if (Platform.OS == "android")
					await Notifications.cancelAllScheduledNotificationsAsync();

				const _30Mins = 1800000;
				const _24Hours = 24 * 60 * 60 * 1000;

				for (let i = 0; i < prayerTimesMap.length; i++) {
					const currentPrayerMs = prayerTimesMap[i];
					const currentPrayerDate = new Date(currentPrayerMs);
					const currentPrayerString = currentPrayerDate.toLocaleString("en-US", {
						timeStyle: "short",
					});

					const nextPrayerMs = prayerTimesMap[i + 1] || prayerTimesMap[0] + _24Hours;
					const nextPrayerDate = new Date(nextPrayerMs);
					const nextPrayerString = nextPrayerDate.toLocaleString("en-US", {
						timeStyle: "short",
					});

					await Notifications.scheduleNotificationAsync({
						content: {
							title: `Nanoja it's ${prayer_names[i]} time!`,
							body: `fufu You have from ${currentPrayerString} to ${nextPrayerString}`,
						},
						trigger: currentPrayerDate,
					});

					if (i == 1) continue;
					const hasAlreadyPassed = new Date().getTime() > nextPrayerMs;
					const dayOffset = hasAlreadyPassed ? _24Hours : 0;
					const BeforenextTime = nextPrayerMs - _30Mins + dayOffset;
					const notificationTime30 = new Date(BeforenextTime);

					await Notifications.scheduleNotificationAsync({
						content: {
							title: `EEEP! ${prayer_names[i]} is running out ;-;`,
							body: "Nanoja you have 30 mins left!",
						},
						trigger: notificationTime30,
					});
				}
			} catch (error) {
				console.error(error);
				alert("Error fetching " + error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (!prayerTimes) return;

		function loop() {
			if (!prayerTimes) return;
			const curTime = new Date().getTime();

			const current_prayer_index = prayerTimes.findIndex(
				(time, i) =>
					curTime >= time && (!prayerTimes[i + 1] || curTime < prayerTimes[i + 1])
			);

			const next_prayer_index = current_prayer_index + 1 < 6 ? current_prayer_index + 1 : 0;

			const start_time = prayerTimes[current_prayer_index];
			const end_time = prayerTimes[next_prayer_index];

			const timeLeft = end_time - curTime;

			const elapsed = curTime - start_time;
			const total_duration = end_time - start_time;
			const percentage = elapsed / total_duration;

			setCurrent({
				percentage: 1 - percentage,
				timeLeft,
				prayer_time_index: current_prayer_index,
			});
		}
		loop();
		const i = setInterval(loop, 1000);
		return () => clearInterval(i);
	}, [prayerTimes]);

	async function fetchPrayerTimes() {
		try {
			const _url = `https://www.muis.gov.sg/api/pagecontentapi/GetPrayerTime?v=${new Date().getTime()}`;
			const prayerTimesRes = await axios.get(_url);
			setPrayerTimesData(prayerTimesRes.data);

			const { Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak } = prayerTimesRes.data;
			return [Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak];
		} catch (error) {
			console.error("Error fetching prayer times:", error);
			throw new Error("Unable to fetch prayer times");
		}
	}

	async function registerBackgroundTask() {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "did-you-pray-today",
				importance: Notifications.AndroidImportance.MAX,
				lightColor: "#FF231F7C",
			});
		}
		if (!TaskManager.isTaskDefined(NOTIFICATION_TASK)) {
			// TaskManager.defineTask(NOTIFICATION_TASK, ({ data, error }) => {
			// 	if (error) {
			// 		console.error("Background task error:", error);
			// 		return;
			// 	}
			// 	console.log("Background task running:", data);
			// });
		}

		await Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: true,
				shouldSetBadge: true,
			}),
		});

		try {
			await Notifications.registerTaskAsync(NOTIFICATION_TASK);
		} catch (error) {
			console.error("Failed to register background task:", error);
		}
	}

	// const Check = ({ i }: { i: number }) => {
	// 	const [checked, setChecked] = React.useState(false);

	// 	return (
	// 		<Checkbox
	// 			status={checked ? "checked" : "unchecked"}
	// 			onPress={() => {
	// 				setChecked(!checked);
	// 			}}
	// 		/>
	// 	);
	// };

	return (
		<View style={styles.container}>
			{loading ? (
				<ActivityIndicator
					size="large"
					color={paperTheme.colors.primary}
				/>
			) : (
				<>
					<View
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							margin: 10,
						}}>
						<CircularProgress
							valuePercentage={current.percentage}
							title={
								"Time until " +
								(prayer_names[current.prayer_time_index + 1]
									? prayer_names[current.prayer_time_index + 1]
									: prayer_names[0])
							}
							subitile={new Date(current.timeLeft).toISOString().substring(11, 19)}
							textColor={colors.text.primary}
							backgroundColor={paperTheme.colors.backdrop}
							progressColor={paperTheme.colors.primary}
						/>
					</View>

					<Text style={styles.title}>{prayerTimesData?.Hijri}</Text>

					<View>
						{prayerTimes?.map((time, index) => {
							const isActive = index == current.prayer_time_index;
							return (
								<View
									style={[
										styles.timeSection,
										{
											borderColor: isActive
												? paperTheme.colors.primary
												: "none",
											borderWidth: isActive ? 2 : 0,
										},
									]}
									key={index}>
									<View style={styles.timeSectionContent}>
										<Text style={styles.timeSectionText}>
											{prayer_names[index]}
										</Text>
										<View
											style={{
												display: "flex",
												flexDirection: "row",
												alignItems: "center",
											}}>
											<Text style={styles.timeSectionTime}>
												{new Date(time).toLocaleString("en-US", {
													timeStyle: "short",
												})}
											</Text>
											{/* <Check i={index} /> */}
										</View>
									</View>
								</View>
							);
						})}
					</View>
				</>
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
		timeSection: {
			backgroundColor: darkModeEnabled ? paperTheme.colors.elevation.level2 : "#fff",
			paddingHorizontal: 10,
			paddingVertical: 12,
			marginVertical: 8,
			marginHorizontal: 16,
			borderRadius: 8,
		},
		timeSectionContent: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		timeSectionText: {
			color: colors.text.primary,
			fontSize: 14,
			fontWeight: "bold",
		},
		timeSectionTime: {
			color: paperTheme.colors.primary,
			fontSize: 14,
			fontWeight: "bold",
		},
	});
}
