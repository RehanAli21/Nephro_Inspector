import { useEffect, useState } from 'react'
import { BarChart } from 'react-native-gifted-charts'
import { AntDesign } from '@expo/vector-icons'
import { Image, Text, SafeAreaView, Alert, StyleSheet, useColorScheme, Pressable, View, Dimensions, ActivityIndicator, TextInput } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import * as secureStore from 'expo-secure-store'
import * as MediaLibrary from 'expo-media-library'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Link } from 'expo-router'
import axios from 'axios'
const { url } = require('../config.json')
const bCameraIcon = require('../../assets/icons/bcameraicon.png')
const bImageIcon = require('../../assets/icons/bimageicon.png')
const wCameraIcon = require('../../assets/icons/wcameraicon.png')
const wImageIcon = require('../../assets/icons/wimageicon.png')

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
let imageNameFromAsset = '' // vairable for storing image name
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
	const [username, setUsername] = useState('') // variable for username
	// to get image path from API, it helps in record in database
	const [imagePathFromScanAPI, setImagePathFromScanAPI] = useState('')
	const [recordName, setRecordName] = useState('') // variable for record Name

	// hook to get permission to access media library of device
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()

	// getting username on compoent initial start
	useEffect(() => {
		getUsername()
	}, [])

	//function to get username from device
	const getUsername = async () => {
		const res = await secureStore.getItemAsync('username')
		if (res) setUsername(res)
	}

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
			const res = await FileSystem.uploadAsync(`${url}/checkImage/${username}`, image.uri, {
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

			// getting imagePath from API response
			const { imagePath } = JSON.parse(res.body)
			// setting imagepath
			setImagePathFromScanAPI(imagePath)
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

	// funtion to check and confirm record name.
	// this is like double check on record name.
	const CheckBeforeSaveResult = () => {
		// if record name is empty then asking user if they does not have to name record.
		if (recordName == '') {
			Alert.alert('Confirmation', 'Do you want save record without name?', [{ text: 'Yes', onPress: saveResult }, { text: 'No' }])
		} else {
			// if record name is not empty, then checking
			// that record name has only alphabets, numbers and space in it.

			let RegExp = /^[a-zA-Z0-9 ]+$/
			// if record name has only alphabets, numbers and space in it, then save result/
			if (RegExp.test(recordName)) {
				saveResult()
			} else {
				// if record name is not correct, warn user
				Alert.alert('Warning', 'Only alphabets, numbers and spaces are allowed in Record Name.', [{ text: 'OK' }])
			}
		}
	}

	// function to save record in device and API call to save data on the server
	const saveResult = async () => {
		// if media library permission is not granted, warn user
		if (permissionResponse.granted != true) alert('Please give permission to access media')
		// check permission from user
		await requestPermission()
		// if permission not grapnted from user the don't save
		if (permissionResponse.granted != true) return alert('Permission denied to access media')

		try {
			// create asset from image uri (asset means files accessible from media library)
			const asset = await MediaLibrary.createAssetAsync(image.uri)
			// getting album 'mephro_app', this album has images of saved records
			const album = await MediaLibrary.getAlbumAsync('nephro_app')

			if (album == null) {
				// if album is not present, then create album and add the image
				await MediaLibrary.createAlbumAsync('nephro_app', asset, true)
			} else {
				// if album is present, then only add asset in the album
				await MediaLibrary.addAssetsToAlbumAsync([asset], album, true)
			}
			// image name from asset, this will be used in saving record data on device
			imageNameFromAsset = asset.filename
			// image name
			const imageName = asset.filename
			// record name
			const recordNameAPIPARAM = recordName == '' ? 'unknown' : recordName

			// save record on the server
			await axios.get(
				`${url}/saveImage/?imagePath=${imagePathFromScanAPI}&username=${username}&name=${imageName}&recordName=${recordNameAPIPARAM}`
			)

			// getting records saved on the device
			const recordData = await AsyncStorage.getItem('nephro_data')

			console.log(recordData)

			// if records are present
			if (recordData !== null) {
				// then add record in that data
				saveRecordData(recordData)
			} else {
				// if records is not present, then save newly create record
				saveRecordData(null)
			}
		} catch (err) {
			console.log(err)

			// if error is of recordData (means 'nephro_data' is not present)
			if (err instanceof ReferenceError) {
				// then save newly create record
				saveRecordData(null)
			} else {
				alert('Something Went wrong!! Try Again')
			}
		}

		// reseting all data of scan
		resetResults()
	}

	// function to save record on the device
	// this function runs after image is saved
	const saveRecordData = async records => {
		let err = false // variable for error state

		console.log('image name: ', imageNameFromAsset)
		// record Name
		let rName = recordName == '' ? 'unknown' : recordName
		// new record data to save
		// record has record name, username, results, favour and image name
		const d = {
			recordName: rName,
			username: username,
			result: data,
			favour: result == 'normal' ? 'normal' : 'notnormal',
			imageName: imageNameFromAsset,
		}

		// if records is null (means there is not records)
		if (records == null) {
			// array with new record
			let newData = [d]

			try {
				// create npehro_data and save new record in it in str form.
				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))
			} catch (e) {
				// handling error
				console.log(e)
				err = true
			}
		} else {
			// if there are records.

			// convert records from str to object
			let newData = JSON.parse(records)

			// adding new record in records
			newData.push(d)

			try {
				// save data with new record added.
				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))
			} catch (e) {
				// handling error
				console.log(e)
				err = true
			}
		}

		if (err) alert('Something went wrong on saving') //if err, then warn user
		else alert('Record has been saved.') // else tell user that record has been saved
		// reseting image name
		imageNameFromAsset = ''
	}

	return (
		<SafeAreaView style={[styles.container, colorScheme === 'dark' ? darkStyles.container : lightStyles.container]}>
			<View style={[styles.v1]}>
				<Link
					href={'main/main'}
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
							<TextInput
								onChangeText={text => setRecordName(text)}
								autoCapitalize='none'
								autoComplete='off'
								autoCorrect={false}
								style={[styles.loadInput, colorScheme === 'dark' ? darkStyles.loadInput : lightStyles.loadInput]}
								placeholder='Save Record by Name'
								placeholderTextColor={colorScheme === 'dark' ? '#aaaaaa' : '#242424'}
							/>
							<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
								<Pressable
									onPress={CheckBeforeSaveResult}
									style={[
										styles.loadBtn,
										{ marginBottom: -30 },
										colorScheme === 'dark' ? darkStyles.scanBtn : lightStyles.scanBtn,
									]}>
									<Text style={[styles.btnText, colorScheme === 'dark' ? darkStyles.scanText : lightStyles.scanText]}>Save</Text>
								</Pressable>
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
		height: height * 0.75,
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
	loadInput: {
		borderBottomWidth: 2,
		borderRadius: 10,
		fontSize: height * 0.02,
		width: width * 0.5,
		marginTop: 20,
		marginBottom: -10,
		padding: 5,
		paddingStart: 10,
		paddingEnd: 10,
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
	loadInput: {
		color: '#fafafa',
		borderColor: '#fafafa',
	},
})
