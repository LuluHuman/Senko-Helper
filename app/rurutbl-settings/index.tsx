import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { defaultSettings } from "@/rurutbl-lib/functions";
import { Material3Scheme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import {
	Button,
	Dialog,
	Divider,
	MD3DarkTheme,
	MD3LightTheme,
	Portal,
	RadioButton,
	Text,
	TouchableRipple,
	Appbar,
} from "react-native-paper";
import { router } from "expo-router";

const SettingsPage = () => {
	const alp = "ABCDEFGH".split("");
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

	const [settings, setSettings] = useState<typeof defaultSettings>(defaultSettings);

	const [classOptions, setClassOptions] = useState<{ [key: string]: string[] }>({});
	const [scienceOptions] = useState(["Physics", "Biology"]);

	const [checkedElec, setCheckedElec] = React.useState("");
	const [checkedClassLevel, setCheckedClassLevel] = React.useState(4);
	const [checkedClassName, setCheckedClassName] = React.useState(1);

	const [elecVisible, setElecVisible] = React.useState(false);
	const [classLevelVisible, setClassLevelVisible] = React.useState(false);
	const [classNameVisible, setClassNameVisible] = React.useState(false);

	useEffect(() => {
		// Fetch class options from the API
		const fetchClassOptions = async () => {
			try {
				const response = await axios.get("https://rurutbl.luluhoy.tech/api/classes");
				setClassOptions(response.data);
			} catch (error) {
				Alert.alert("Error", "Failed to fetch class options.");
				console.error(error);
			}
		};

		// Load saved settings from AsyncStorage
		const loadSettings = async () => {
			try {
				const savedSettings = await AsyncStorage.getItem("@settings");
				const settings = savedSettings
					? (JSON.parse(savedSettings) as unknown as typeof defaultSettings)
					: defaultSettings;
				setSettings(settings);
				setCheckedElec(settings.Elec.Sci == "Phy/Bio" ? "" : settings.Elec.Sci);
				setCheckedClassLevel(settings.class.level);
				setCheckedClassName(settings.class.class);
			} catch (error) {
				Alert.alert("Error", "Failed to load settings.");
				console.error(error);
			}
		};

		fetchClassOptions();
		loadSettings();
	}, []);

	const showDialogElec = () => setElecVisible(true);
	const showDialogClassLevel = () => setClassLevelVisible(true);
	const showDialogClassName = () => setClassNameVisible(true);

	const cancelDialogElec = () => setElecVisible(false);
	const cancelDialogClassLevel = () => setClassLevelVisible(false);
	const cancelDialogClassName = () => setClassNameVisible(false);

	const saveDialog = async (
		toSave: typeof defaultSettings,
		toCheck: (newSetting: typeof defaultSettings) => void,
		makeVisible: (value: React.SetStateAction<boolean>) => void
	) => {
		setSettings(toSave);
		AsyncStorage.setItem("@settings", JSON.stringify(toSave)).then(async () => {
			const savedSettings = await AsyncStorage.getItem("@settings");
			const settings = savedSettings
				? (JSON.parse(savedSettings) as unknown as typeof defaultSettings)
				: defaultSettings;
			toCheck(settings);
			makeVisible(false);
		});
	};

	return (
		<View style={styles.container}>
			<Appbar.Header>
				<Appbar.BackAction
					onPress={router.canGoBack() ? () => router.back() : () => router.navigate("/")}
				/>
				<Appbar.Content title="Settings" />
			</Appbar.Header>

			<TouchableRipple onPress={showDialogElec}>
				<View style={{ padding: 10 }}>
					<Text
						variant="titleMedium"
						style={{ color: "white" }}>
						Science Elective
					</Text>
					<Text>{settings.Elec.Sci || "None selected"}</Text>
				</View>
			</TouchableRipple>

			<Portal>
				<Dialog
					visible={elecVisible}
					onDismiss={cancelDialogElec}>
					<Dialog.Title>Choose Science elective</Dialog.Title>
					<Dialog.Content>
						{scienceOptions.map((option) => (
							<View
								key={option}
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
								}}>
								<RadioButton
									value={option}
									status={checkedElec === option ? "checked" : "unchecked"}
									onPress={() => setCheckedElec(option)}
								/>
								<Text style={{ marginLeft: 20 }}>{option}</Text>
							</View>
						))}
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={cancelDialogElec}>Cancel</Button>
						<Button
							onPress={() =>
								saveDialog(
									{
										...settings,
										Elec: { ...settings.Elec, Sci: checkedElec },
									},
									(s) => setCheckedElec(s.Elec.Sci),
									setElecVisible
								)
							}>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			<Divider />

			<TouchableRipple onPress={showDialogClassLevel}>
				<View style={{ padding: 10 }}>
					<Text
						variant="titleMedium"
						style={{ color: "white" }}>
						Class Level
					</Text>
					<Text>Secondary {settings.class.level}</Text>
				</View>
			</TouchableRipple>

			<Portal>
				<Dialog
					visible={classLevelVisible}
					onDismiss={cancelDialogClassLevel}>
					<Dialog.Title>Choose Class Level</Dialog.Title>
					<Dialog.Content>
						{Object.keys(classOptions).map((option) => (
							<View
								key={option}
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
								}}>
								<RadioButton
									value={option}
									status={
										checkedClassLevel.toString() === option
											? "checked"
											: "unchecked"
									}
									onPress={() => setCheckedClassLevel(parseInt(option))}
								/>
								<Text style={{ marginLeft: 20 }}>Secondary {option}</Text>
							</View>
						))}
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={cancelDialogClassLevel}>Cancel</Button>
						<Button
							onPress={() =>
								saveDialog(
									{
										...settings,
										class: { ...settings.class, level: checkedClassLevel },
									},
									(s) => setCheckedClassLevel(s.class.level),
									setClassLevelVisible
								)
							}>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			<Divider />

			<TouchableRipple onPress={showDialogClassName}>
				<View style={{ padding: 10 }}>
					<Text
						variant="titleMedium"
						style={{ color: "white" }}>
						Class
					</Text>
					<Text>
						{settings.class.level.toString()}
						{alp[settings.class.class]}
					</Text>
				</View>
			</TouchableRipple>

			<Portal>
				<Dialog
					visible={classNameVisible}
					onDismiss={cancelDialogClassName}>
					<Dialog.Title>Choose Class</Dialog.Title>
					<Dialog.Content>
						{classOptions[settings.class.level.toString()]?.map((option) => (
							<View
								key={option}
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
								}}>
								<RadioButton
									value={option}
									status={
										checkedClassName.toString() === option
											? "checked"
											: "unchecked"
									}
									onPress={() => setCheckedClassName(parseInt(option))}
								/>
								<Text style={{ marginLeft: 20 }}>
									{settings.class.level.toString()}
									{alp[parseInt(option)]}
								</Text>
							</View>
						))}
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={cancelDialogClassName}>Cancel</Button>
						<Button
							onPress={() =>
								saveDialog(
									{
										...settings,
										class: { ...settings.class, class: checkedClassName },
									},
									(s) => setCheckedClassName(s.class.class),
									setClassNameVisible
								)
							}>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
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
	}
) {
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: paperTheme.colors.elevation.level1,
		},
	});
	return styles;
}

export default SettingsPage;
