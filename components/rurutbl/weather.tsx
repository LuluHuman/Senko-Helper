"use client";

import { dayList, weekList } from "@/rurutbl-lib/types";
import { useCallback, useEffect, useState } from "react";
import { DateMs } from "@/rurutbl-lib/functions";
import { Icon, Text } from "react-native-paper";
import { Alert, Linking, View } from "react-native";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WeatherData({ dayList, day }: { dayList: dayList; day?: keyof weekList }) {
	// const placeholder = (
	// 	<div
	// 		className="flex items-center gap-2 p-2 m-2 bg-neutral-600 rounded-lg"
	// 		key={"12asdf"}>
	// 		<div className="size-6 bg-neutral-700"></div>
	// 		<div className="w-full">
	// 			<h1 className="w-3/4 h-4 bg-neutral-700 m-2"></h1>
	// 			<p className="w-3/4  h-4 bg-neutral-700 m-2"></p>
	// 		</div>
	// 	</div>
	// );

	const url = "https://openweathermap.org";
	const handlePress = useCallback(async () => {
		// Checking if the link is supported for links with custom URL scheme.
		const supported = await Linking.canOpenURL(url);

		if (supported) {
			// Opening the link with some app, if the URL scheme is "http" the web link should be opened
			// by some browser in the mobile
			await Linking.openURL(url);
		} else {
			Alert.alert(`Unable to open openweathermap.org in your browser`);
		}
	}, [url]);

	const placeholder = <Text>Loading,,,</Text>;
	const [element, setElement] = useState<React.JSX.Element[]>([placeholder]);
	useEffect(() => {
		const d = Object.keys(dayList);
		if (!d[0] || !day) return;

		const endTimeMs = parseInt(d[d.length - 1]);

		const dateNow = new DateMs();
		const midnight = dateNow.getTime() - dateNow.getMidnightOffset();

		const endDate = new Date(midnight + endTimeMs);

		function filterToEndHour(w: any) {
			const date = new Date(w.dt * 1000);
			return (
				date.getHours() == endDate.getHours() &&
				date.getDay() == days.findIndex((e) => e == day)
			);
		}
		fetch("https://rurutbl.luluhoy.tech/api/weather")
			.then((d) => d.json())
			.then((data) => {
				const currentForecast = (data.hourly as any[]).filter(filterToEndHour)[0];
				if (!currentForecast) return setElement([]);
				const currentWeather = currentForecast.weather as {
					id: number;
					main: string;
					description: string;
					icon: string;
				}[];
				const elements = currentWeather.map((weatherNotices, i) => {
					const needUmbrella = weatherNotices.id < 800; //? https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
					if (!needUmbrella) return undefined;
					return (
						<View
							style={{
								display: "flex",
								alignItems: "center",
								flexDirection: "row",
								gap: 8,
								padding: 8,
								margin: 8,
								backgroundColor: "#0891b2",
								borderRadius: 8,
							}}
							key={i}>
							<Icon
								source={"umbrella-beach"}
								size={24}></Icon>
							<View>
								<Text
									style={{ opacity: 0.4, textDecorationLine: "underline" }}
									onPress={handlePress}>
									{"openweathermap.org @" + endDate.getHours() + ":00"}
								</Text>
								<Text
									variant="titleMedium"
									style={{ fontWeight: 700 }}
									className="font-bold">
									Grab an Umbrella it might rain
								</Text>
								<Text>
									{weatherNotices.main} - {weatherNotices.description}
								</Text>
							</View>
						</View>
					);
				});
				setElement(elements.filter((x) => x !== undefined));
			});
	}, [dayList, day]);

	return element;
}
