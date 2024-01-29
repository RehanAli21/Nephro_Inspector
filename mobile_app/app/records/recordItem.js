import { router, useLocalSearchParams } from 'expo-router'
import { View, Text, Pressable, SafeAreaView, StyleSheet, useColorScheme, Dimensions, Image } from 'react-native'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { BarChart } from 'react-native-gifted-charts'
import { useEffect, useState } from 'react'

const { width, height } = Dimensions.get('window')
const RecordItem = () => {
	let colorScheme = useColorScheme()
	let labelColor = colorScheme == 'dark' ? 'white' : '#242424'
	const { favour, data, name, imguri } = useLocalSearchParams()

	const [chartData, setChartData] = useState([])
	const [result, setResult] = useState('')

	useEffect(() => {
		let newData = JSON.parse(data)

		let stone = 0
		let tumor = 0
		let cyst = 0

		for (let e of newData) {
			e.labelTextStyle = { color: labelColor }

			if (e.label == 'Stone') stone = e.value
			if (e.label == 'Tumor') tumor = e.value
			if (e.label == 'Cyst') cyst = e.value
		}
		setChartData(newData)

		if (favour == 'normal') {
			setResult('normal')
		} else if (favour == 'notnormal') {
			if (stone > tumor && stone > cyst) setResult('Stone')
			else if (cyst > tumor && cyst > stone) setResult('Cyst')
			else if (tumor > cyst && tumor > stone) setResult('Tumor')
		}
	}, [colorScheme])

	return (
		<SafeAreaView style={[styles.container, colorScheme == 'dark' ? darkStyle.container : lightStyle.container]}>
			<View style={[styles.nav, colorScheme == 'dark' ? darkStyle.border : lightStyle.border]}>
				<Pressable onPress={() => router.back()}>
					<AntDesign
						name='leftcircleo'
						size={width * 0.08}
						color={colorScheme === 'dark' ? '#fafafa' : '#242424'}
					/>
				</Pressable>
				<Text style={[styles.navText, colorScheme === 'dark' ? darkStyle.h1 : lightStyle.h1]}>{name}</Text>
			</View>
			<Image
				resizeMode='stretch'
				source={{ uri: `${imguri}` }}
				style={[styles.image]}
			/>
			<View style={[{ marginTop: 20, marginBottom: height * 0.03, marginStart: -30 }]}>
				<Text style={[styles.resultText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>
					Kidney {result === 'normal' ? 'is Normal' : `has ${result}`}
				</Text>
				<BarChart
					noOfSections={3}
					barBorderRadius={2}
					yAxisThickness={0.3}
					yAxisTextStyle={{ color: labelColor }}
					xAxisColor={labelColor}
					yAxisColor={labelColor}
					data={chartData}
				/>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#242424',
	},
	nav: {
		marginTop: height * 0.065,
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		paddingStart: 15,
		paddingBottom: 15,
		borderBottomWidth: 2,
	},
	navText: {
		fontSize: 28,
		width: '80%',
		textAlign: 'center',
	},
	image: {
		width: width * 0.85,
		height: width * 0.7,
		borderRadius: 10,
		marginTop: 20,
	},
	resultText: {
		marginStart: '10%',
		fontSize: 26,
		fontWeight: '700',
		textAlign: 'center',
		marginVertical: 15,
	},
})

const darkStyle = StyleSheet.create({
	container: {
		backgroundColor: '#242424',
	},
	border: {
		borderColor: '#fafafa',
	},
	h1: {
		color: '#fafafa',
	},
})

const lightStyle = StyleSheet.create({
	container: {
		backgroundColor: '#fafafa',
	},
	border: {
		borderColor: '#242424',
	},
	h1: {
		color: '#242424',
	},
})

export default RecordItem
