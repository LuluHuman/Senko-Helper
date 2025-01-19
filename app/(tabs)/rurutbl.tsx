//#region Imports

import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Settings } from "@/components/icons";
import { Track } from "@/components/rurutbl/track";
import { dayList, weekList } from "@/rurutbl-lib/types";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { CircularProgress } from "@/components/rurutbl/CircularProgress-rurutbl";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { ActivityIndicator, Button, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import {
	DateMs,
	defaultSettings,
	getCurrentLsn,
	locSubjInit,
	ToDayStr,
} from "@/rurutbl-lib/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeatherData from "@/components/rurutbl/weather";
import { PublicConfig } from "@/components/rurutbl/config";
// #endregion

export default function RuruTBL() {
	// ? colors
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

	// ?

	const [settings, setSettings] = useState<typeof defaultSettings>(defaultSettings);

	const [loading, setLoading] = useState(true);
	const [trackLabels, setTrackLabels] = useState({ title: "", subtitle: "", timeRemaining: "" });
	const [progressPercentage, setProgressPercentage] = useState(0);
	const [activeIndex, setActiveIndex] = useState(0);

	const [weekState, setweekState] = useState<"odd" | "even">("odd");
	const [weekList, setweekListn] = useState<weekList>();
	const [day, setDay] = useState<keyof weekList>();
	const [daylist, setDaylist] = useState({});

	useEffect(() => {
		const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
		const semstartDate = new Date("2025-1-4"); //? Note: Date shall be set every Saturday of the semester (2 Days before Mon)
		const currentDate = new Date();

		const _timeDifference = currentDate.getTime() - semstartDate.getTime();
		const weekNumber = Math.ceil(_timeDifference / millisecondsPerWeek);

		const HBLWeeks = [4, 10];
		// const HBLWeeks = [2, 6, 8, 10];
		const isOdd = !HBLWeeks.includes(weekNumber);
		setweekState(isOdd ? "odd" : "even");
	}, []);

	useEffect(() => {
		AsyncStorage.getItem("@settings").then((savedSettings) => {
			const settings = savedSettings
				? (JSON.parse(savedSettings) as unknown as typeof defaultSettings)
				: defaultSettings;
			setSettings(settings);

			const { level, class: className } = settings.class;

			const _host = "https://rurutbl.luluhoy.tech";
			const _url = `${_host}/classes/${level}/${className}/${weekState}.json`;
			axios.get(_url).then((req) => {
				setweekListn(req.data);
			});
		});
	}, [weekState]);

	useEffect(() => {
		if (!weekList) return;
		const curDate = new DateMs();

		const curDayI = curDate.getDay();
		const curDay = ToDayStr(curDayI).long;
		const dayList: dayList = weekList[curDay] as dayList;

		const sortedTimeList = Object.keys(dayList).sort((a, b) => parseInt(a) - parseInt(b));
		const lastLsnTime = parseInt(sortedTimeList[sortedTimeList.length - 1]);
		if (curDate.getMidnightOffset() > lastLsnTime) {
			const nextDayI = curDayI + 1 > 6 ? 0 : curDayI + 1;
			const nextDay = ToDayStr(nextDayI).long;
			const nextdayList = weekList[nextDay];
			const nextSortedTimeList = Object.keys(nextdayList).sort(
				(a, b) => parseInt(a) - parseInt(b)
			);

			const firstLsnTime = parseInt(nextSortedTimeList[0]);
			const HM = new DateMs().toHourMinuteString(firstLsnTime);
			setTrackLabels({
				title: `${ToDayStr(nextDayI).short || ToDayStr(1).short} - ${HM}`,
				subtitle: `First lesson is ${nextdayList[nextSortedTimeList[0]]}`,
				timeRemaining: "",
			});

			setDay(nextDay);
			if (loading) setLoading(false);
			return;
		}
		setDay(curDay);
	}, [settings, weekList]);

	const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
	useEffect(() => {
		const locSubj = locSubjInit(settings);

		if (currentTimeout) clearInterval(currentTimeout);
		Loop();
		setCurrentTimeout(setInterval(Loop, 500));
		function Loop() {
			if (!weekList) return clearInterval(currentTimeout);
			if (!day) return clearInterval(currentTimeout);
			const msSinceMidnight = new DateMs().getMidnightOffset();
			const dayList: dayList = weekList[day];
			setDaylist(dayList);

			const sortedTimeList = Object.keys(dayList).sort((a, b) => parseInt(a) - parseInt(b));
			const lastLsnTime = parseInt(sortedTimeList[sortedTimeList.length - 1]);

			if (loading) setLoading(false);
			if (msSinceMidnight > lastLsnTime) return clearInterval(currentTimeout);

			const nextLsnTime: string = getCurrentLsn(sortedTimeList, msSinceMidnight);

			const prevI = sortedTimeList.indexOf(nextLsnTime) - 1;
			const curLsn = dayList[sortedTimeList[prevI]];
			const nextLsn = dayList[nextLsnTime];

			const curSecTotal = msSinceMidnight / 1000;
			const LessonSecTotal = parseInt(nextLsnTime) / 1000;
			const remainingSec = LessonSecTotal - curSecTotal;

			const prevSubTime = sortedTimeList[prevI];
			const prevtotalSec = parseInt(prevSubTime) / 1000;
			const SubjDuration = LessonSecTotal - prevtotalSec;

			const totalSecLeft = LessonSecTotal - curSecTotal;
			const time = new DateMs(totalSecLeft * 1000).toISOString().substring(11, 19);

			const _fallbackTitle = `Time until Start class (${dayList[sortedTimeList[0]]})`;
			const nextLessionLabel = "Time " + (nextLsn ? "until " + locSubj(nextLsn) : "Left");

			const remainingPercentage = (SubjDuration - remainingSec) / SubjDuration;
			setProgressPercentage(remainingPercentage);

			setActiveIndex(sortedTimeList.indexOf(nextLsnTime) - 1);

			setTrackLabels({
				title: locSubj(curLsn) || _fallbackTitle,
				subtitle: curLsn ? nextLessionLabel : "",
				timeRemaining: time,
			});
		}
		return () => clearInterval(currentTimeout);
	}, [settings, weekList, day]);

	const states = {
		weekState: weekState,
		day: day,
	};
	const setStates = {
		setTrackLabels: setTrackLabels,
		setLoading: setLoading,
		setweekState: setweekState,
		setDay: setDay,
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView edges={["top"]}>
				<ScrollView>
					<View style={styles.container}>
						{loading ? (
							<ActivityIndicator
								size="large"
								color={paperTheme.colors.primary}
							/>
						) : (
							<View
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									margin: 10,
								}}>
								<View style={styles.container}>
									<View
										style={{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "flex-end",
											height: 50,
											width: "100%",
										}}>
										<View
											style={{
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												flexDirection: "row",
											}}>
											<Button
												onPress={() => router.push("/rurutbl-settings")}>
												<Settings color={colors.text.secondary} />
											</Button>
										</View>
									</View>
								</View>
								<CircularProgress
									valuePercentage={progressPercentage}
									title={trackLabels.title}
									subitile={trackLabels.subtitle}
									timeRemaining={trackLabels.timeRemaining}
									textColor={colors.text.primary}
									backgroundColor={paperTheme.colors.backdrop}
									progressColor={paperTheme.colors.primary}
								/>

								<View
									style={{
										width: "100%",
										display: "flex",
										justifyContent: "center",
									}}>
									<PublicConfig
										settings={settings}
										states={states}
										setStates={setStates}
									/>
									<WeatherData
										dayList={daylist}
										day={day}
									/>
								</View>

								<Track
									settings={settings}
									dayList={daylist}
									day={day}
									active={activeIndex}
									isOdd={weekState == "odd"}
								/>
							</View>
						)}
					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
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
