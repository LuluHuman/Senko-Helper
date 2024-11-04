import React from "react";

import { BottomNavigation } from "react-native-paper";
import BusArrival from ".";
import TabTwoScreen from "./halal-time";
import { BusIcon, PrayerTimesIcon } from "../../components/icons";

const MyComponent = () => {
	const [index, setIndex] = React.useState(0);
	const [routes] = React.useState([
		{
			key: "busArrival",
			title: "Bus Arrival",
			focusedIcon: BusIcon,
		},
		{ key: "prayerTimes", title: "Prayer Times", focusedIcon: PrayerTimesIcon },
	]);

	const renderScene = BottomNavigation.SceneMap({
		busArrival: BusArrival,
		prayerTimes: TabTwoScreen,
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
