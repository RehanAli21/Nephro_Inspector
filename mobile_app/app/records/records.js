//import liraries
import {
	View,
	Text,
	Image,
	StyleSheet,
	SafeAreaView,
	useColorScheme,
	Pressable,
	Dimensions,
	ScrollView,
	ActivityIndicator,
	Platform,
	TextInput,
} from 'react-native'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as secureStore from 'expo-secure-store'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import ScreenMsg from '../component/ScreenMsg'
import axios from 'axios'
const { url } = require('../config.json')

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
const Records = () => {
	let username = '' // variable for username
	let colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	const [data, setData] = useState([]) // varibale for storing records
	const [dataAvailable, setDataAvailable] = useState('') // variable to tell if data is available on the server
	const [showMsg, setShowMsg] = useState('') // to show message on ScreenMsg component
	const [reload, setReload] = useState(true) // variable to trigger UI changes
	const [query, setQuery] = useState('')

	// getting data from device on compo start and UI change trigger
	useEffect(() => {
		getDeviceData()
	}, [reload])

	// function to get records data from device
	const getDeviceData = async () => {
		console.log('getting data')
		try {
			// getting username from device
			username = await secureStore.getItemAsync('username')
			// getting records data from device
			let recordData = await AsyncStorage.getItem('nephro_data')
			// await AsyncStorage.removeItem('nephro_data')
			// if records are availabel
			if (recordData != null) {
				let compData = [] // to store records data after modification
				// convert records data from str to object
				recordData = JSON.parse(recordData)
				// checking if records length is greater then 0
				if (recordData.length > 0) {
					// iterating each record in records
					for (const record of recordData) {
						// added record in compData in specific format
						if (record.username == username) {
							compData.push({
								recordName: record.recordName,
								imageName: record.imageName,
								data: record.result,
								favour: record.favour,
							})
						}
					}
					// getting 'nephro_app' album
					const album = await MediaLibrary.getAlbumAsync('nephro_app')
					// getting assets (images) from album
					const assets = await MediaLibrary.getAssetsAsync({ album: album })
					// iteraring asset in assets
					for (let asset of assets.assets) {
						// iterating each comp (data) from compData
						for (let comp of compData) {
							// if current asset name is same as any comp image name
							if (asset.filename == comp.imageName) {
								// then add image uri in comp
								comp['imageuri'] = asset.uri
							}
						}
					}
					// setting data which shows records
					setData(compData)
					// setting data availability to present
					setDataAvailable(compData.length > 0 ? 'present' : 'noData')
				} else {
					// records length is not greater then 0, then check from server
					// checkDataFromAPI()
				}
			} else {
				// records is not present, then check from server
				// checkDataFromAPI()
			}
		} catch (err) {
			// if there is a error, means there is no records data available
			console.log(err)
			setDataAvailable('noData')
		}
	}

	useEffect(() => {
		recordDataQuery()
	}, [query])

	const recordDataQuery = async () => {
		if (query == '') {
			getDeviceData()
			return
		}

		console.log('getting data using query')
		try {
			// getting username from device
			username = await secureStore.getItemAsync('username')
			// getting records data from device
			let recordData = await AsyncStorage.getItem('nephro_data')
			// await AsyncStorage.removeItem('nephro_data')
			// if records are availabel
			if (recordData != null) {
				let compData = [] // to store records data after modification
				// convert records data from str to object
				recordData = JSON.parse(recordData)
				// checking if records length is greater then 0
				if (recordData.length > 0) {
					// iterating each record in records
					for (const record of recordData) {
						// added record in compData in specific format
						if (record.username == username && record.recordName.includes(query)) {
							compData.push({
								recordName: record.recordName,
								imageName: record.imageName,
								data: record.result,
								favour: record.favour,
							})
						}
					}
					// getting 'nephro_app' album
					const album = await MediaLibrary.getAlbumAsync('nephro_app')
					// getting assets (images) from album
					const assets = await MediaLibrary.getAssetsAsync({ album: album })
					// iteraring asset in assets
					for (let asset of assets.assets) {
						// iterating each comp (data) from compData
						for (let comp of compData) {
							// if current asset name is same as any comp image name
							if (asset.filename == comp.imageName) {
								// then add image uri in comp
								comp['imageuri'] = asset.uri
							}
						}
					}
					// setting data which shows records
					setData(compData)
					// setting data availability to present
					setDataAvailable(compData.length > 0 ? 'present' : 'NotFound')
				}
			}
		} catch (err) {
			// if there is a error, means there is no records data available
			console.log(err)
			setDataAvailable('noData')
		}
	}

	// function to check if records data are available for download
	const checkDataFromAPI = async () => {
		try {
			// API call to check data
			const res = await axios.get(`${url}/checkData/${username}`)

			if (res.status == 200) {
				//setting data availability according to response from API

				if (res.data.details == 'Data') setDataAvailable('data')
				else if (res.data.details == 'NoData') setDataAvailable('noData')
			}
		} catch (err) {
			// if there is a error, means there is no records data available
			console.log(err)
			setDataAvailable('noData')
		}
	}

	// function to delte record from device and API call to delete data on server
	const deleteRecord = async data => {
		// message to tell user to wait
		setShowMsg('Deleting Record, please wait')
		try {
			// getting username from device
			const username = await secureStore.getItemAsync('username')
			// record tp delete
			const deleteRecord = {
				username: username,
				imgname: data['imageName'],
				recordname: data['recordName'],
			}
			// getting album 'nephro_app'
			const album = await MediaLibrary.getAlbumAsync('nephro_app')
			// getting assets (image) from album
			const assets = await (await MediaLibrary.getAssetsAsync({ album: album })).assets

			// iterating asset from assets
			for (let asset of assets) {
				// if asset uri is same as uri of delete record
				if (asset.uri == data['imageuri']) {
					// then remove/delete this image from album
					await MediaLibrary.removeAssetsFromAlbumAsync(asset, album)
				}
			}

			// getting records from device
			let recordData = await AsyncStorage.getItem('nephro_data')

			// if records are available
			if (recordData != null) {
				// variable for storing records except record to delete
				let newData = []
				// convert records from str to object
				recordData = JSON.parse(recordData)
				// checking if records length is greater then 0
				if (recordData.length > 0) {
					// iterating each record in records
					// and added record in newData except the record to delete
					for (let record of recordData) {
						if (
							record.username == deleteRecord.username &&
							record.imageName == deleteRecord.imgname &&
							record.recordName == deleteRecord.recordname
						) {
							console.log('found, and deleted')
						} else {
							// added record in newData, which does not match delete record
							newData.push(record)
						}
					}
				}
				// setting new data
				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))
			}
			// API call to delete record from server
			// const res = await axios.post(`${url}/deleteDataForUser`, deleteRecord)

			// if response is ok and response has deleted key
			// if (res.status == 200 && res.data['deleted']) {
			// 	// then telling user the record has been deleted/
			// 	alert('Record Deleted.')
			// } else {
			// 	// else telling user error occurred.
			// 	alert('An error occurred while deleting record.')
			// }
			// removing message from screen
			setShowMsg('')
		} catch (err) {
			// hadnling error and telling user about error.
			console.log(err)
			alert('An error occurred while deleting record.')
			setShowMsg('')
		}

		// trigger UI change after record delete
		setReload(!reload)
	}

	// function to download data (records) from server without images
	const downloadData = async () => {
		// telling user to wait downloading data
		setShowMsg('Downloading Data')
		try {
			// getting username from device
			const username = await secureStore.getItemAsync('username')
			// API call for records data (if there are present is server)
			const res = await axios.get(`${url}/downloadData/${username}`)

			const newData = [] // variable for storing records from server
			let labelColor = colorScheme == 'dark' ? 'white' : '#242424' // labelColor for graph data from server
			const imagesToDownload = [] // variable to store image name to donwload

			// if response has data
			if (res.data) {
				// iterating each record from data
				for (let record of res.data) {
					// variable for getting graph data and formating it.
					let resultData = [
						{ value: JSON.parse(record.result).normal, label: 'Normal', frontColor: 'green', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).stone, label: 'Stone', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).cyst, label: 'Cyst', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).tumor, label: 'Tumor', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
					]
					// adding record in newData
					newData.push({
						recordName: record.recordName,
						username: record.username,
						result: resultData,
						favour: JSON.parse(record.result).favour == 'not Normal' ? 'notnormal' : 'normal',
						imageName: record.imageName,
					})
					// image data to download images from server
					imagesToDownload.push({ imageName: record.imageName, recordName: record.recordName, username: record.username })
				}
				// setting records in device
				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))

				// imageToDownload length is greater then 0, then call function to download images
				if (imagesToDownload.length > 0) downloadImages(imagesToDownload)
				else setShowMsg('') // else remove message from screen
			}
		} catch (err) {
			// handling error, and tell user the error occurred
			console.log(err)
			setShowMsg('')
			alert('Error occured during downloading')
		}
	}

	// function which download image from server and save them in device
	const downloadImages = async imagesInfo => {
		// tellinn user, downloading images
		setShowMsg('Download Images')
		try {
			// iterating each imageInfo
			for (let i = 0; i < imagesInfo.length; i++) {
				// telling user the downloading image number
				setShowMsg(`Download Images No: ${i + 1}`)
				// getting image name, username and record name from imageinfo
				const { imageName, username, recordName } = imagesInfo[i]
				// API call to download the images from server
				const fileRes = await FileSystem.downloadAsync(
					`${url}/downloadImage/?username=${username}&imageName=${imageName}&recordName=${recordName}`,
					FileSystem.documentDirectory + imageName
				)
				// creating asset from downloaded images
				const asset = await MediaLibrary.createAssetAsync(fileRes.uri)
				// getting album 'mephro_app'
				const album = await MediaLibrary.getAlbumAsync('nephro_app')

				// if there is no album
				if (album == null) {
					// creating album and added asset
					await MediaLibrary.createAlbumAsync('nephro_app', asset, true)
				} else {
					// else only adding asset in album
					await MediaLibrary.addAssetsToAlbumAsync([asset], album, true)
				}

				// API call to change image name
				// changing image name because after creating asset the image name changes
				await axios.get(
					`${url}/changeImageName/?username=${username}&recordName=${recordName}&oldImageName=${imageName}&newImageName=${asset.filename}`
				)

				// getting records from device
				let recordData = await AsyncStorage.getItem('nephro_data')

				// if records are available
				if (recordData != null) {
					// convert record from str to object
					recordData = JSON.parse(recordData)
					// if records are more then zero
					if (recordData.length > 0) {
						// iterating record in records
						for (const record of recordData) {
							// if record image name is same as imageName (old image name)
							if (record.imageName == imageName) {
								// then change record image name to new image name
								record.imageName = asset.filename
							}
						}
					}

					// set records after changes.
					await AsyncStorage.setItem('nephro_data', JSON.stringify(recordData))
				}
			}
			// remove message from screen
			setShowMsg('')
		} catch (err) {
			// handling error, and tell user the error occurred
			console.log(err)
			setShowMsg('')
		}
		// trigger UI change after images is downloaded
		setReload(!reload)
	}

	// function to go to perticular record item to show detailed view.
	const goToRecordItemPage = (favour, data, name, imguri) => {
		//////////////////////////////////
		// code which covert
		// '(' to leftParanthesisSign
		// ')' to rightParanthesisSign
		// in recordname and imguri
		// because having '(', ')' in params the expo router does not work
		let leftParanthesis = /\(/g
		let rightParanthesis = /\)/g
		name = name.replace(leftParanthesis, 'leftParanthesisSign')
		name = name.replace(rightParanthesis, 'rightParanthesisSign')
		imguri = imguri.replace(leftParanthesis, 'leftParanthesisSign')
		imguri = imguri.replace(rightParanthesis, 'rightParanthesisSign')
		///////////////////////////////////////////////////////////

		// go to record Item screen with param data to show detailed view
		router.push({ pathname: '/records/recordItem', params: { favour: favour, data: JSON.stringify(data), name: name, imguri: imguri } })
	}

	return (
		<SafeAreaView style={[styles.container, colorScheme == 'dark' ? darkStyle.container : lightStyle.container]}>
			<View style={[styles.nav, colorScheme == 'dark' ? darkStyle.border : lightStyle.border]}>
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
				<TextInput
					onChangeText={text => setQuery(text)}
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholder='Search'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
			</View>
			<Text style={[styles.h1, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>Records</Text>
			{dataAvailable == 'present' || dataAvailable == '' ? (
				data.length > 0 ? (
					<ScrollView style={styles.cardContainer}>
						{data.map((e, i) => (
							<View
								key={i}
								style={[styles.card, colorScheme == 'dark' ? darkStyle.border : lightStyle.border]}>
								<Pressable onPress={() => goToRecordItemPage(e.favour, e.data, e.recordName, e.imageuri)}>
									<Image
										style={[styles.cardImg]}
										resizeMode='stretch'
										source={{ uri: `${e.imageuri}` }}
									/>
								</Pressable>
								<View style={[styles.cardFooter, colorScheme == 'dark' ? darkStyle.border : lightStyle.border]}>
									<Pressable
										style={[styles.cardFooterbtn1]}
										onPress={() => goToRecordItemPage(e.favour, e.data, e.recordName, e.imageuri)}>
										<AntDesign
											name='eye'
											size={26}
											color={colorScheme == 'dark' ? '#fafafa' : '#242424'}
										/>
										<Text style={[styles.recordName, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>{e.recordName}</Text>
									</Pressable>
									<Pressable
										style={[styles.cardFooterbtn2]}
										onPress={() => deleteRecord(e)}>
										<FontAwesome5
											name='trash'
											size={22}
											color='white'
										/>
									</Pressable>
								</View>
							</View>
						))}
					</ScrollView>
				) : (
					<View style={[{ marginTop: height * 0.2 }]}>
						<ActivityIndicator
							color={colorScheme == 'dark' ? '#fafafa' : '#242424'}
							size={Platform.OS == 'ios' ? 'large' : 100}
							style={{ marginBottom: 10 }}
						/>
						<Text style={[styles.dataText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>Loading Please Wait</Text>
					</View>
				)
			) : dataAvailable == 'data' ? (
				<View style={{ alignItems: 'center' }}>
					<Text style={[{ marginTop: height * 0.2 }, styles.dataText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>
						You have saved data available.
					</Text>
					<Text style={[styles.dataText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>Do you want to download?</Text>
					<Pressable
						style={[styles.dataBtn, colorScheme == 'dark' ? darkStyle.border : lightStyle.border]}
						onPress={downloadData}>
						<Text style={[styles.databtntext, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>Download</Text>
					</Pressable>
				</View>
			) : dataAvailable == 'noData' ? (
				<View>
					<Text style={[{ marginTop: height * 0.2 }, styles.dataText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>
						You have no Data to Show
					</Text>
				</View>
			) : dataAvailable == 'NotFound' ? (
				<View>
					<Text style={[{ marginTop: height * 0.2 }, styles.dataText, colorScheme == 'dark' ? darkStyle.h1 : lightStyle.h1]}>
						Search not matched
					</Text>
				</View>
			) : null}
			{showMsg != '' ? <ScreenMsg msg={showMsg} /> : null}
		</SafeAreaView>
	)
}

// define your styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#242424',
	},
	nav: {
		marginTop: height * 0.065,
		width: '100%',
		paddingStart: 25,
		paddingBottom: 15,
		borderBottomWidth: 2,
		display: 'flex',
		flexDirection: 'row',
	},
	input: {
		borderWidth: 1,
		padding: 5,
		paddingHorizontal: 15,
		marginHorizontal: 15,
		borderRadius: 5,
		fontSize: 18,
		width: width * 0.6,
		marginStart: width * 0.2,
	},
	h1: {
		fontSize: 28,
		fontWeight: '500',
		width: width * 0.8,
		margin: 10,
	},
	cardContainer: {
		marginTop: 20,
		width: '100%',
		textAlign: 'center',
	},
	card: {
		width: '60%',
		borderWidth: 1,
		borderTopWidth: 2,
		borderBottomWidth: 2,
		borderRadius: 10,
		marginBottom: 20,
		marginStart: '20%',
	},
	cardImg: {
		height: 200,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	recordName: {
		fontSize: 17,
		marginStart: 10,
		fontWeight: '700',
	},
	cardFooter: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 40,
		borderTopWidth: 2,
	},
	cardFooterbtn1: {
		width: '80%',
		display: 'flex',
		flexDirection: 'row',
		height: 50,
		alignItems: 'center',
		paddingStart: 10,
	},
	cardFooterbtn2: {
		width: '20%',
		height: 'auto',
		backgroundColor: 'red',
		height: 37,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomRightRadius: 10,
	},
	dataText: {
		width: width,
		textAlign: 'center',
		fontSize: width * 0.065,
		fontWeight: '700',
		marginBottom: 20,
	},
	dataBtn: {
		borderWidth: 2,
		width: width * 0.4,
		borderRadius: 15,
		padding: 10,
		marginTop: 20,
	},
	databtntext: {
		fontSize: 22,
		textAlign: 'center',
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
	input: {
		color: '#fafafa',
		borderColor: '#fafafa',
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
	input: {
		color: '#242424',
		borderColor: '#242424',
	},
})

//make this component available to the app
export default Records
