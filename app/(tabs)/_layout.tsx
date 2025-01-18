import React from "react";

import { BottomNavigation } from "react-native-paper";
import BusArrival from "./index";
import TabTwoScreen from "./halal-time";
import { BusIcon, PrayerTimesIcon } from "../../components/icons";

const MyComponent = () => {
	const [index, setIndex] = React.useState(0);
	const [routes] = React.useState([
		{
			key: "busarrival",
			title: "Bus Arrival",
			focusedIcon: BusIcon,
		},
		{ key: "prayertimes", title: "Prayer Times", focusedIcon: PrayerTimesIcon },
	]);

	const renderScene = BottomNavigation.SceneMap({
		busarrival: BusArrival,
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
