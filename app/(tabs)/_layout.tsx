import React from "react";
import { BottomNavigation } from "react-native-paper";
import BusArrival from "./index";
import TabTwoScreen from "./halal-time";
import { BusIcon, PrayerTimesIcon } from "../../components/icons";
import RuruTBL from "./rurutbl";

const MyComponent = () => {
	const [index, setIndex] = React.useState(0);
	const [routes] = React.useState([
		{
			key: "busarrival",
			title: "Bus Arrival",
			focusedIcon: BusIcon,
		},
		{
			key: "rurutbl",
			title: "RuruTBL",
			focusedIcon: "table",
		},
		{
			key: "prayertimes",
			title: "Prayer Times",
			focusedIcon: PrayerTimesIcon,
		},
	]);

	const renderScene = BottomNavigation.SceneMap({
		busarrival: BusArrival,
		rurutbl: RuruTBL,
		prayertimes: TabTwoScreen, 	
	});

	return (
		<BottomNavigation
			navigationState={{ index, routes }}
			onIndexChange={setIndex}
			renderScene={renderScene}
		/>
	);
};

export default MyComponent;
