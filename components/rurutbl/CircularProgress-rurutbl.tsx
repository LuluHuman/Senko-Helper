import { Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

export function CircularProgress({
	valuePercentage = 0,
	title = "",
	subitile = "",
	timeRemaining = "",
	textColor = "white",
	backgroundColor = "#4b5563",
	progressColor = "white",
}: {
	valuePercentage: number;
	title?: string;
	subitile?: string;
	timeRemaining?: string;
	textColor: string;
	backgroundColor: string;
	progressColor: string;
}) {
	const FULL_DASH_ARRAY = 283;
	const circleDasharray = `${(1 - valuePercentage) * FULL_DASH_ARRAY} 283`;

	let timer = (
		<Path
			strokeDasharray={circleDasharray}
			strokeWidth={5}
			origin="center"
			stroke={progressColor}
			fill={"none"}
			strokeLinecap="round"
			fillRule="nonzero"
			d="M 50, 50m -45, 0a 45,45 0 1,0 90,0a 45,45 0 1,0 -90,0"
		/>
	);

	return (
		<View style={{ width: "70%", aspectRatio: 1, position: "relative", maxWidth: 250 }}>
			<Svg
				viewBox="0 0 100 100"
				style={{ transform: [{ rotate: "90deg" }] }}>
				<G>
					<Circle
						stroke={backgroundColor}
						strokeWidth={5}
						cx="50"
						cy="50"
						r="45"
						fill={"none"}
					/>
					{timer}
				</G>
			</Svg>
			<View
				style={{
					position: "absolute",
					top: 0,
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
				}}>
				{title && <Text style={{ color: textColor, fontSize: 20 }}>{title}</Text>}
				{subitile && <Text style={{ color: textColor, fontSize: 18 }}>{subitile}</Text>}
				{timeRemaining && (
					<Text style={{ color: textColor, fontSize: 20 }}>{timeRemaining}</Text>
				)}
			</View>
		</View>
	);
}
