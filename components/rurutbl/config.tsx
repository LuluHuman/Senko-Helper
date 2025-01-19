"use client";

import { alp, defaultSettings } from "@/rurutbl-lib/functions";
import { View } from "react-native";
import { Text, Button, IconButton } from "react-native-paper";

export function PublicConfig({
	settings,
	states,
	setStates,
}: {
	settings: typeof defaultSettings;
	states: { [key: string]: any };
	setStates: { [key: string]: (value: any) => void };
}) {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
	return (
		<View style={{ width: "100%", paddingHorizontal: 8, paddingVertical: 16 }}>
			<View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
				<Button
					mode="outlined"
					compact={true}>
					{settings.class.level + alp[settings.class.class]}
				</Button>
				<Button
					compact={true}
					onPress={() => {
						setStates.setLoading(true);
						setStates.setweekState((e: "odd" | "even") =>
							e == "odd" ? "even" : "odd"
						);
						setStates.setTrackLabels({
							title: "",
							subtitle: "",
							timeRemaining: "",
						});
					}}
					mode="outlined">
					<Text>{states.weekState == "odd" ? "Non-HBL wk" : "HBL wk"}</Text>
				</Button>
			</View>
			<View
				style={{
					display: "flex",
					width: "100%",
					justifyContent: "space-between",
					flexDirection: "row",
				}}>
				<IconButton
					icon={"chevron-left"}
					onPress={() => {
						const index = days.findIndex((o) => o == states.day);
						const prevIndex = index - 1 < 0 ? days.length - 1 : index - 1;
						const prevDay = days[prevIndex];

						setStates.setLoading(true);
						setStates.setDay(prevDay);
						setStates.setTrackLabels({
							title: "",
							subtitle: "",
							timeRemaining: "",
						});
					}}
				/>
				<View
					style={{ gap: 8, display: "flex", flexDirection: "row", alignItems: "center" }}>
					<Text>{states.day}</Text>
				</View>

				<IconButton
					icon={"chevron-right"}
					onPress={() => {
						const index = days.findIndex((o) => o == states.day);
						const nextIndex = index + 1 > days.length - 1 ? 0 : index + 1;
						const nextDay = days[nextIndex];

						setStates.setLoading(true);
						setStates.setDay(nextDay);
						setStates.setTrackLabels({
							title: "",
							subtitle: "",
							timeRemaining: "",
						});
					}}
				/>
			</View>
		</View>
	);
}
