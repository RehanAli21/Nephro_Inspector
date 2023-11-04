import { Pressable, Text, Image, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions } from 'react-native'
const wscanicon = require('../assets/icons/wscanicon.png')
const bscanicon = require('../assets/icons/bscanicon.png')
const wrecordicon = require('../assets/icons/wrecordicon.png')
const brecordicon = require('../assets/icons/brecordicon.png')

const { width, height } = Dimensions.get('window')
export default function Main() {
	let colorScheme = useColorScheme()

	return (
		<SafeAreaView style={colorScheme === 'dark' ? darkStyles.container : lightStyles.container}>
			<View style={colorScheme === 'dark' ? darkStyles.main : lightStyles.main}>
				<Image
					style={colorScheme === 'dark' ? darkStyles.image : lightStyles.image}
					resizeMode='contain'
					source={colorScheme === 'dark' ? require('../assets/icons/wkidneyicon.png') : require('../assets/icons/bkidneyicon.png')}
				/>
				<Text style={colorScheme === 'dark' ? darkStyles.text : lightStyles.text}>Nephro Inspector</Text>
			</View>
			<View style={colorScheme === 'dark' ? darkStyles.secondary : lightStyles.secondary}>
				<View style={colorScheme === 'dark' ? darkStyles.secondView : lightStyles.secondView}>
					<Pressable
						onPress={() => console.log('scan')}
						style={{ alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
						<Image
							style={{ width: width * 0.27, height: width * 0.27 }}
							resizeMode='contain'
							source={colorScheme === 'dark' ? wscanicon : bscanicon}
						/>
						<Text style={colorScheme === 'dark' ? darkStyles.secondText : lightStyles.secondText}>Scan</Text>
					</Pressable>
				</View>
				<View style={colorScheme === 'dark' ? darkStyles.secondView : lightStyles.secondView}>
					<Pressable
						onPress={() => console.log('record')}
						style={{ alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
						<Image
							style={{ width: width * 0.25, height: width * 0.262 }}
							source={colorScheme === 'dark' ? wrecordicon : brecordicon}
						/>
						<Text style={colorScheme === 'dark' ? darkStyles.secondText : lightStyles.secondText}>Record</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	)
}

const lightStyles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		backgroundColor: '#fafafa',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
	},
	text: {
		color: '#2c2c2c',
		fontWeight: '900',
		textAlign: 'center',
		fontSize: 25,
	},
	image: {
		width: width * 0.9,
		height: height * 0.4,
	},
	main: {
		flex: 2,
		borderBottomColor: 'black',
		borderBottomWidth: 2,
		width: '100%',
		display: 'flex',
		gap: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondary: {
		width: width,
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		gap: 2,
		justifyContent: 'space-evenly',
		backgroundColor: '#2c2c2c',
	},
	secondView: {
		backgroundColor: '#fafafa',
		width: '50%',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center',
	},
	secondText: {
		color: '#2c2c2c',
		fontWeight: '800',
		fontSize: 15,
		textAlign: 'center',
		marginTop: 10,
	},
})

const darkStyles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		backgroundColor: '#2c2c2c',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
		overflow: 'hidden',
	},
	text: {
		color: '#fafafa',
		textAlign: 'center',
		fontWeight: 'bold',
		fontSize: 25,
	},
	image: {
		width: width * 0.9,
		height: height * 0.4,
	},
	main: {
		flex: 2,
		borderBottomColor: '#fafafa',
		borderBottomWidth: 2,
		width: '100%',
		display: 'flex',
		gap: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondary: {
		width: width,
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		gap: 2,
		justifyContent: 'space-evenly',
		backgroundColor: '#fafafa',
	},
	secondView: {
		backgroundColor: '#2c2c2c',
		width: '50%',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center',
	},
	secondText: {
		color: '#fafafa',
		fontWeight: '800',
		fontSize: 15,
		textAlign: 'center',
		marginTop: 10,
	},
})
