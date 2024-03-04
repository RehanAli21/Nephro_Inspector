import { useEffect, useState } from 'react'
import { BarChart } from 'react-native-gifted-charts'
import { AntDesign } from '@expo/vector-icons'
import { Image, Text, SafeAreaView, Alert, StyleSheet, useColorScheme, Pressable, View, Dimensions, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { Link } from 'expo-router'
const { url } = require('../config.json')
const bCameraIcon = require('../../assets/icons/bcameraicon.png')
const bImageIcon = require('../../assets/icons/bimageicon.png')
const wCameraIcon = require('../../assets/icons/wcameraicon.png')
const wImageIcon = require('../../assets/icons/wimageicon.png')

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
export default function Page() {
	let colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	let labelColor = colorScheme == 'dark' ? 'white' : '#242424' // lable Color for graph based on theme mode
	// variable for graph data
	const [data, setData] = useState([
		{ value: 0, label: 'onr', frontColor: 'green', labelTextStyle: { color: labelColor } },
		{ value: 0, label: 'two', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
		{ value: 0, label: 'three', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
		{ value: 0, label: 'four', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
	])

	const [image, setImage] = useState(null) // variable for image
	const [loading, setLoading] = useState(false) // variable for loading state
	const [result, setResult] = useState('') // variable for result

	// getting username on compoent initial start
	useEffect(() => {
		Alert.alert(
			'Warning',
			'Using this page, you can scan image using camera or gallery but can not save record of the scan, to save record of scan please login.\n\nIf you scan image using quickscan, there will be no records save in your device.',
			[{ text: 'OK' }]
		)
	}, [])

	// function to get and select image from device gallery
	const selectImage = async () => {
		// requesting gallery access
		const request = await ImagePicker.requestMediaLibraryPermissionsAsync()
		// if access is granted
		if (request.granted) {
			try {
				// getting image after selecting and editing
				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
				})

				// if image is not canceled
				if (!result.canceled) {
					// Resize the selected image to 250x250
					const resizedImage = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 250, height: 250 } }], {
						format: 'jpeg',
						compress: 1,
					})
					// setting image
					setImage(resizedImage)
				}
			} catch (err) {
				console.log(err)
			}
		} else {
			// if access to gallery is not granted
			alert('Cannot Access Images')
		}
	}

	// function to capture image from device camera
	const useCamera = async () => {
		// requesting camera access
		const request = await ImagePicker.requestCameraPermissionsAsync()
		// if access is granted
		if (request.granted) {
			try {
				// getting image after capturing and editing
				const result = await ImagePicker.launchCameraAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
				})

				// if image is not canceled
				if (!result.canceled) {
					// Resize the selected image to 250x250
					const resizedImage = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 250, height: 250 } }], {
						format: 'jpeg',
						compress: 1,
					})
					// setting image
					setImage(resizedImage)
				}
			} catch (err) {
				console.log(err)
			}
		} else {
			// if access to camera is not granted
			alert('Cannot Access Camera')
		}
	}

	// function to upload image to server for scanning
	const uploadimage = async () => {
		// setting loading to true, to tell user to wait for scanning
		await setLoading(true)
		try {
			// uploading image to the API and getting response from API
			const res = await FileSystem.uploadAsync(`${url}/checkImage/quickScan`, image.uri, {
				httpMethod: 'POST',
				uploadType: FileSystem.FileSystemUploadType.MULTIPART,
				fieldName: 'image',
			})

			// getting message from API response
			const message = JSON.parse(res.body).message
			// checking if message has favour key
			if (message.favour) {
				// setting data for graph
				setData([
					{ value: message.normal, label: 'Normal', frontColor: 'green', labelTextStyle: { color: labelColor } },
					{ value: message.stone, label: 'Stone', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
					{ value: message.cyst, label: 'Cyst', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
					{ value: message.tumor, label: 'Tumor', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
				])

				////////////////////////////////////
				// code for setting result based on favour and disease value
				if (message.favour == 'normal') {
					setResult('normal')
				} else if (message.favour == 'not Normal') {
					if (message.stone > message.tumor && message.stone > message.cyst) setResult('Stone')
					else if (message.cyst > message.tumor && message.cyst > message.stone) setResult('Cyst')
					else if (message.tumor > message.cyst && message.tumor > message.stone) setResult('Tumor')
				}
			}
		} catch (err) {
			// handling error and showing message on error
			console.log(err)

			alert('Something Went wrong!! Try Again')
			setLoading(false)
		}
	}

	// function to reset garph, result and loading.
	const resetResults = () => {
		setLoading(false)
		setResult('')
		setData([
			{ value: 0, label: 'onr', frontColor: 'green', labelTextStyle: { color: labelColor } },
			{ value: 0, label: 'two', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
			{ value: 0, label: 'three', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
			{ value: 0, label: 'four', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
		])
	}

	return (
		<SafeAreaView style={[styles.container, colorScheme === 'dark' ? darkStyles.container : lightStyles.container]}>
			<View style={[styles.v1]}>
				<Link
					href={'/'}
					asChild>
					<Pressable>
						<AntDesign
							name='leftcircleo'
							size={width * 0.08}
							color={colorScheme === 'dark' ? '#fafafa' : '#242424'}
						/>
					</Pressable>
				</Link>
			</View>
			<View style={[styles.v2]}>
				<Pressable
					onPress={useCamera}
					style={[styles.headbtn, colorScheme === 'dark' ? darkStyles.headbtn : lightStyles.headbtn, { paddingStart: 12, paddingEnd: 15 }]}>
					<Image
						resizeMode='contain'
						style={{ width: width * 0.09, height: width * 0.05, marginEnd: 10 }}
						source={colorScheme === 'dark' ? wCameraIcon : bCameraIcon}
					/>
					<Text style={[styles.btnText, colorScheme === 'dark' ? darkStyles.btnText : lightStyles.btnText]}>Use Camera</Text>
				</Pressable>
				<Pressable
					onPress={selectImage}
					style={[styles.headbtn, colorScheme === 'dark' ? darkStyles.headbtn : lightStyles.headbtn, { paddingStart: 18, paddingEnd: 15 }]}>
					<Image
						resizeMode='contain'
						style={{ width: width * 0.05, height: width * 0.05, marginEnd: 15 }}
						source={colorScheme === 'dark' ? wImageIcon : bImageIcon}
					/>
					<Text style={[styles.btnText, colorScheme === 'dark' ? darkStyles.btnText : lightStyles.btnText]}>Select Image</Text>
				</Pressable>
			</View>
			<View style={[styles.v3]}>
				{image ? (
					<>
						<Image
							style={[styles.imgPlaceholder, colorScheme === 'dark' ? darkStyles.imgPlaceholder : lightStyles.imgPlaceholder]}
							resizeMode='contain'
							source={{ uri: image.uri }}
						/>
						<Pressable
							onPress={uploadimage}
							style={[styles.scanBtn, colorScheme === 'dark' ? darkStyles.scanBtn : lightStyles.scanBtn]}>
							<Text style={[styles.scanText, colorScheme === 'dark' ? darkStyles.scanText : lightStyles.scanText]}>Scan</Text>
						</Pressable>
					</>
				) : (
					<View style={[styles.imgPlaceholder, colorScheme === 'dark' ? darkStyles.imgPlaceholder : lightStyles.imgPlaceholder]}>
						<Text style={[styles.textPlaceholder, colorScheme === 'dark' ? darkStyles.textPlaceholder : lightStyles.textPlaceholder]}>
							Image For Scanning
						</Text>
					</View>
				)}
			</View>
			{loading && (
				<View style={[styles.loading]}>
					{result === '' ? (
						<View style={[styles.loadingSec, colorScheme === 'dark' ? darkStyles.loadingSec : lightStyles.loadingSec, { height: 250 }]}>
							<View style={[styles.loadSec1]}>
								<ActivityIndicator
									size='large'
									color={colorScheme === 'dark' ? '#fafafa' : '#242424'}
								/>
								<Text style={[styles.loadText, colorScheme === 'dark' ? darkStyles.loadText : lightStyles.loadText]}>
									Scanning, Wait.
								</Text>
							</View>
						</View>
					) : (
						<View style={[styles.loadingSec, colorScheme === 'dark' ? darkStyles.loadingSec : lightStyles.loadingSec]}>
							<View style={[styles.loadSec1, { marginTop: height * 0.06 }]}>
								<Text style={[styles.loadText, colorScheme === 'dark' ? darkStyles.loadText : lightStyles.loadText]}>
									Kidney {result === 'normal' ? 'is Normal' : `has ${result}`}
								</Text>
							</View>
							<View style={[{ marginTop: height * 0.03, marginBottom: height * 0.03, marginStart: -50 }]}>
								<BarChart
									noOfSections={3}
									barBorderRadius={2}
									yAxisThickness={0.3}
									yAxisTextStyle={{ color: labelColor }}
									xAxisColor={labelColor}
									yAxisColor={labelColor}
									data={data}
								/>
							</View>
							<View
								style={[
									{ width: width * 0.9, height: height * 0.005, backgroundColor: colorScheme === 'dark' ? '#aaaaaa' : '#242424' },
								]}></View>
							<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
								<Pressable
									onPress={resetResults}
									style={[
										styles.loadBtn,
										{ marginBottom: -30 },
										colorScheme === 'dark' ? darkStyles.scanBtn : lightStyles.scanBtn,
									]}>
									<Text style={[styles.btnText, colorScheme === 'dark' ? darkStyles.scanText : lightStyles.scanText]}>Discard</Text>
								</Pressable>
							</View>
						</View>
					)}
				</View>
			)}
		</SafeAreaView>
	)
}

// for general styling
const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
	},
	v1: {
		marginTop: height * 0.05,
		flex: 0.5,
		width: '100%',
		justifyContent: 'center',
		paddingStart: 15,
	},
	v2: {
		flex: 0.9,
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'space-evenly',
	},
	v3: {
		flex: 5,
		width: '100%',
		alignItems: 'center',
		paddingTop: height * 0.05,
	},
	headbtn: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignContent: 'center',
		alignSelf: 'center',
		alignItems: 'center',
		borderWidth: 2,
		padding: 7,
		borderRadius: 40,
	},
	btnImg: {
		marginEnd: 10,
	},
	btnText: {
		fontWeight: '600',
		fontSize: height * 0.023,
	},
	imgPlaceholder: {
		width: width * 0.8,
		borderWidth: 3,
		height: width * 0.8,
		marginTop: 10,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
	},
	textPlaceholder: {
		fontSize: height * 0.04,
		fontWeight: 600,
	},
	scanBtn: {
		borderWidth: 2,
		padding: 5,
		paddingStart: 40,
		paddingEnd: 40,
		borderRadius: 40,
		marginTop: 40,
	},
	scanText: {
		fontSize: height * 0.03,
		fontWeight: 400,
	},
	loading: {
		position: 'absolute',
		width: width,
		height: height,
		backgroundColor: 'rgba(0,0,0,0.8)',
	},
	loadingSec: {
		width: width * 0.9,
		height: height * 0.65,
		top: height * 0.2,
		left: width * 0.05,
		borderRadius: 20,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	loadSec1: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
		marginTop: height * 0.1,
	},
	loadText: {
		fontSize: height * 0.035,
	},
	loadBtn: {
		borderWidth: 2,
		padding: 5,
		paddingStart: 20,
		paddingEnd: 20,
		borderRadius: 40,
		marginTop: 40,
		marginStart: 15,
	},
})
// styles for light mode
const lightStyles = StyleSheet.create({
	container: {
		backgroundColor: '#fafafa',
	},
	headbtn: {
		borderColor: '#242424',
	},
	btnText: {
		color: '#242424',
	},
	imgPlaceholder: {
		borderColor: '#242424',
	},
	textPlaceholder: {
		color: '#242424',
	},
	scanBtn: {
		borderColor: '#242424',
	},
	scanText: {
		color: '#242424',
	},
	loadingSec: {
		backgroundColor: '#fafafa',
		borderColor: '#242424',
	},
	loadText: {
		color: '#242424',
	},
})
// styles for dark mode
const darkStyles = StyleSheet.create({
	container: {
		backgroundColor: '#242424',
	},
	headbtn: {
		borderColor: '#fafafa',
	},
	btnText: {
		color: '#fafafa',
	},
	imgPlaceholder: {
		borderColor: '#fafafa',
	},
	textPlaceholder: {
		color: '#fafafa',
	},
	scanBtn: {
		borderColor: '#fafafa',
	},
	scanText: {
		color: '#fafafa',
	},
	loadingSec: {
		backgroundColor: '#242424',
		borderColor: '#fafafa',
	},
	loadText: {
		color: '#fafafa',
	},
})
