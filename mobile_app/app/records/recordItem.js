import { router, useLocalSearchParams, usePathname, useGlobalSearchParams } from 'expo-router'
import { View, Text, Pressable, SafeAreaView, StyleSheet, useColorScheme, Dimensions, Image } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { BarChart } from 'react-native-gifted-charts'
import { useEffect, useState } from 'react'

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
const RecordItem = () => {
	let colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	let labelColor = colorScheme == 'dark' ? 'white' : '#242424' // lable Color for graph based on theme mode
	const { favour, data, name, imguri } = useLocalSearchParams() // getting params passed by records component

	const [chartData, setChartData] = useState([]) // variable for graph data
	const [result, setResult] = useState('') // variable for kidney result
	const [recorName, setRecordName] = useState() // variable for recordName
	const [imageuri, setImageuri] = useState() // variable for image path/uri

	useEffect(() => {
		try {
			////////////////////////////////////
			// section for changing
			// 'leftParanthesisSign' to '('
			// 'rightParanthesisSign' to ')
			// in name and image name.
			let left = /leftParanthesisSign/g
			let right = /rightParanthesisSign/g
			// getting name from params
			let properName = name
			// if 'leftParanthesisSign' present then replace it with '(' in name
			if (left.test(properName)) properName = properName.replace(left, '(')
			// if 'rightParanthesisSign' present then replace it with ')' in name
			if (right.test(properName)) properName = properName.replace(right, ')')
			// setting name after fixing
			setRecordName(properName)

			// getting imguri from params
			let properuri = imguri
			// if 'leftParanthesisSign' present then replace it with '(' in imguri
			if (left.test(properuri)) properuri = properuri.replace(left, '(')
			// if 'rightParanthesisSign' present then replace it with ')' in imguri
			if (right.test(properuri)) properuri = properuri.replace(right, ')')
			// setting imguri after fixing
			setImageuri(properuri)
			//////////////////////////////////////

			/////////////////////////////////////
			// code for changing label color for graph and
			// determine the result
			////////////////////////////////////
			let newData = JSON.parse(data) // convert data from str to object format

			let stone = 0 // variable for stone disease
			let tumor = 0 // variable for tumor disease
			let cyst = 0 // variable for cyst disease

			// iterating to change labelColor and get diseases value
			for (let e of newData) {
				e.labelTextStyle = { color: labelColor }

				if (e.label == 'Stone') stone = e.value
				if (e.label == 'Tumor') tumor = e.value
				if (e.label == 'Cyst') cyst = e.value
			}
			// setting graph data after changing labelColor
			setChartData(newData)

			////////////////////////////////////////
			// now setting result based on favour and disease values
			if (favour == 'normal') {
				setResult('normal')
			} else if (favour == 'notnormal') {
				if (stone > tumor && stone > cyst) setResult('Stone')
				else if (cyst > tumor && cyst > stone) setResult('Cyst')
				else if (tumor > cyst && tumor > stone) setResult('Tumor')
			}
		} catch (err) {
			console.log(err)
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
				<Text style={[styles.navText, colorScheme === 'dark' ? darkStyle.h1 : lightStyle.h1]}>{recorName}</Text>
			</View>
			<Image
				resizeMode='stretch'
				source={{ uri: `${imageuri}` }}
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

// general styles
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
// specific styles for dark mode
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
// specific styles for light mode
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
