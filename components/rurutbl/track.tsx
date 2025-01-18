import { DateMs } from "@/rurutbl-lib/functions";
import { crowdedness, TrackType } from "@/rurutbl-lib/types";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { MD3DarkTheme, MD3LightTheme, Text, Tooltip } from "react-native-paper";

// import Tooltip from "@mui/material/Tooltip";
// import Link from "next/link";

const colorGrey = "#9799a0";

const trackStyle = StyleSheet.create({
	container: {
		paddingVertical: 16,
		marginVertical: 8,
		borderRadius: 16,
		maxWidth: 600,
		width: "100%",
		alignSelf: "center",
	},
});

export function Track({ dayList, active, day, settings, isOdd }: TrackType) {
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

	if (!day) return <TrackLoading styles={styles} />;

	const track = [];

	const timeList = Object.keys(dayList).sort((a, b) => parseInt(a) - parseInt(b));
	for (let i = 0; i < timeList.length; i++) {
		const lsnStartTimex = timeList[i];
		const lsnStartTime = parseInt(lsnStartTimex);

		let subject = dayList[lsnStartTimex];
		subject = i === timeList.length - 1 ? "END" : subject || "";

		var HM = new DateMs().toHourMinuteString(lsnStartTime);

		const isFinished = i < (active || 0);
		const isActive = i === active;
		const isEND = subject === "END";

		const stylesApplied: any[] = [];
		let crowd = null;

		if (isFinished) stylesApplied.push(styles.lineThrough);
		switch (subject) {
			case "Recess":
			case "Break": {
				stylesApplied.push(styles.textGray);
				crowd = (
					<Crowdedness
						subject={subject}
						day={day}
						isOdd={isOdd}
						time={lsnStartTime}
						styles={styles}
					/>
				);
				break;
			}

			case "{SciElec}":
				subject = settings.Elec.Sci || subject;
				break;

			default:
				break;
		}

		track.push(
			<View
				key={typeof subject === "string" ? subject : subject[0]}
				style={[
					isEND ? styles.endItem : styles.trackItem,
					isActive ? styles.activeOutline : null,
				]}>
				{isEND ? (
					<Text style={styles.endText}>END - {HM}</Text>
				) : (
					<>
						<View style={{ width: "100%", display: "flex", flexDirection: "row" }}>
							<Text style={[styles.trackText, ...stylesApplied]}>{subject}</Text>
							<View style={styles.timeTextContainer}>
								<Text style={styles.timeText}>{HM}</Text>
							</View>
						</View>

						{crowd && (
							<View
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
								}}>
								<Text>Crowdedness: </Text>
								<View>{crowd}</View>
							</View>
						)}
					</>
				)}
			</View>
		);
	}

	return <View style={trackStyle.container}>{track}</View>;
}

function Crowdedness({ subject, day, isOdd, time, styles }: any) {
	const [crowdedness, setCrowd] = useState<React.JSX.Element | React.JSX.Element[]>(
		<Text>Loading...</Text>
	);

	useEffect(() => {
		const path = "https://rurutbl.luluhoy.tech/api/commonSubj";
		const url = `${path}?subjectName=${subject}&week=${isOdd ? "Odd" : "Even"}`;
		fetch(url)
			.then((response) => response.json())
			.then((crowdness) => {
				const dayOfCrowd = crowdness[day];
				if (!dayOfCrowd) {
					setCrowd(<Text>Error :-; /1</Text>);
					return;
				}
				const classes = dayOfCrowd[time.toString()];
				const classes2 = dayOfCrowd[(time + 1200000).toString()];

				if (!classes) {
					setCrowd(<Text>Error ;-; /2</Text>);
					return;
				}

				const color = (classes: any[]) => {
					const percentage = (classes.length / 13) * 100;
					if (percentage <= 30) return styles.green;
					if (percentage <= 60) return styles.yellow;
					return styles.red;
				};

				const crowdElement =
					subject == "Recess" ? (
						[classes, classes2].map((c, i) => {
							return (
								<Tooltip
									title={c.join(", ")}
									key={i}>
									<View style={[styles.crowdPill, color(classes)]}>
										<Text style={styles.crowdText}>
											{c.length > 1 ? `${c.length} Classes` : "ALONE!!!"}
										</Text>
									</View>
								</Tooltip>
							);
						})
					) : (
						<Tooltip title={classes.join(", ")}>
							<View style={[styles.crowdPill, color(classes)]}>
								<Text style={styles.crowdText}>
									{classes.length > 1 ? `${classes.length} Classes` : "ALONE!!!"}
								</Text>
							</View>
						</Tooltip>
					);

				setCrowd(crowdElement);
			})
			.catch((error) => console.error(error));
	}, [subject, day, isOdd, time]);

	return <View style={styles.crowdednessContainer}>{crowdedness}</View>;
}

export function TrackLoading({ styles }: { styles: any }) {
	return (
		<View style={trackStyle.container}>
			{[1, 2, 3, 4, 5, 6].map((index) => (
				<View
					key={index}
					style={styles.loadingItem}>
					<View style={styles.loadingBlock} />
					<View style={styles.loadingBlock} />
				</View>
			))}
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
		lineThrough: { textDecorationLine: "line-through" },
		textGray: { color: colorGrey },
		endItem: { justifyContent: "center", alignItems: "center", height: 40 },
		trackItem: {
			padding: 10,
			marginVertical: 5,
			borderRadius: 8,
			backgroundColor: darkModeEnabled ? paperTheme.colors.elevation.level2 : "#fff",
		},
		activeOutline: { borderWidth: 2, borderColor: paperTheme.colors.primary },
		endText: { color: colorGrey },
		trackText: { flex: 1, fontWeight: "bold" },
		timeTextContainer: { marginLeft: 10 },
		timeText: { color: paperTheme.colors.primary, fontWeight: "bold" },
		crowdednessContainer: { flexDirection: "row", alignItems: "center" },
		crowdPill: {
			paddingHorizontal: 5,
			paddingVertical: 2,
			marginHorizontal: 2,
			borderRadius: 15,
		},
		green: { backgroundColor: "#16a34a" },
		yellow: { backgroundColor: "#eab308" },
		red: { backgroundColor: "#b91c1c" },
		crowdText: { color: "white" },
		loadingItem: {
			flexDirection: "row",
			justifyContent: "space-between",
			padding: 10,
			marginVertical: 5,
		},
		loadingBlock: { width: 40, height: 40, backgroundColor: "lightgrey" },
	});
}
