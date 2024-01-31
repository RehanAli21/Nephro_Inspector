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

const { width, height } = Dimensions.get('window')
const Records = () => {
	let username = ''
	let colorScheme = useColorScheme()
	const [data, setData] = useState([])
	const [dataAvailable, setDataAvailable] = useState('')
	const [showMsg, setShowMsg] = useState('')
	const [reload, setReload] = useState(true)

	useEffect(() => {
		getDeviceData()
	}, [reload])

	const getDeviceData = async () => {
		console.log('getting data')
		try {
			username = await secureStore.getItemAsync('username')

			let recordData = await AsyncStorage.getItem('nephro_data')

			if (recordData != null) {
				let compData = []

				recordData = JSON.parse(recordData)

				if (recordData.length > 0) {
					for (const record of recordData) {
						compData.push({
							recordName: record.recordName,
							imageName: record.imageName,
							data: record.result,
							favour: record.favour,
						})
					}

					const album = await MediaLibrary.getAlbumAsync('nephro_app')

					const assets = await MediaLibrary.getAssetsAsync({ album: album })

					for (let asset of assets.assets) {
						for (let comp of compData) {
							if (asset.filename == comp.imageName) {
								comp['imageuri'] = asset.uri
							}
						}
					}
					setData(compData)
					setDataAvailable('present')
				} else {
					checkDataFromAPI()
				}
			} else {
				checkDataFromAPI()
			}
		} catch (err) {
			console.log(err)
			setDataAvailable('noData')
		}
	}

	const checkDataFromAPI = async () => {
		try {
			const res = await axios.get(`${url}/checkData/${username}`)

			if (res.status == 200) {
				if (res.data.details == 'Data') setDataAvailable('data')
				else if (res.data.details == 'NoData') setDataAvailable('noData')
			}
		} catch (err) {
			console.log(err)
			setDataAvailable('noData')
		}
	}

	const goToRecordItemPage = (favour, data, name, imguri) => {
		let leftParanthesis = /\(/g
		let rightParanthesis = /\)/g
		name = name.replace(leftParanthesis, 'leftParanthesisSign')
		name = name.replace(rightParanthesis, 'rightParanthesisSign')
		imguri = imguri.replace(leftParanthesis, 'leftParanthesisSign')
		imguri = imguri.replace(rightParanthesis, 'rightParanthesisSign')

		router.push({ pathname: '/records/recordItem', params: { favour: favour, data: JSON.stringify(data), name: name, imguri: imguri } })
	}

	const deleteRecord = async data => {
		setShowMsg('Deleting Record, please wait')
		try {
			const username = await secureStore.getItemAsync('username')

			const deleteRecord = {
				username: username,
				imgname: data['imageName'],
				recordname: data['recordName'],
			}

			const album = await MediaLibrary.getAlbumAsync('nephro_app')

			const assets = await (await MediaLibrary.getAssetsAsync({ album: album })).assets

			for (let asset of assets) {
				if (asset.uri == data['imageuri']) {
					await MediaLibrary.removeAssetsFromAlbumAsync(asset, album)
				}
			}

			let recordData = await AsyncStorage.getItem('nephro_data')

			if (recordData != null) {
				let newData = []

				recordData = JSON.parse(recordData)

				if (recordData.length > 0) {
					for (let record of recordData) {
						if (
							record.username == deleteRecord.username &&
							record.imageName == deleteRecord.imgname &&
							record.recordName == deleteRecord.recordname
						) {
							console.log('found, and deleted')
						} else {
							newData.push(record)
						}
					}
				}

				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))
			}

			const res = await axios.post(`${url}/deleteDataForUser`, deleteRecord)

			if (res.status == 200 && res.data['deleted']) {
				alert('Record Deleted.')
			} else {
				alert('An error occurred while deleting record.')
			}

			setShowMsg('')
		} catch (err) {
			console.log(err)
			alert('An error occurred while deleting record.')
			setShowMsg('')
		}

		setReload(!reload)
	}

	const downloadData = async () => {
		setShowMsg('Downloading Data')
		try {
			const username = await secureStore.getItemAsync('username')

			const res = await axios.get(`${url}/downloadData/${username}`)

			const newData = []
			let labelColor = colorScheme == 'dark' ? 'white' : '#242424'
			const imagesToDownload = []

			if (res.data) {
				for (let record of res.data) {
					resultData = [
						{ value: JSON.parse(record.result).normal, label: 'Normal', frontColor: 'green', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).stone, label: 'Stone', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).cyst, label: 'Cyst', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
						{ value: JSON.parse(record.result).tumor, label: 'Tumor', frontColor: '#bb0000', labelTextStyle: { color: labelColor } },
					]

					newData.push({
						recordName: record.recordName,
						username: record.username,
						result: resultData,
						favour: JSON.parse(record.result).favour == 'not Normal' ? 'notnormal' : 'normal',
						imageName: record.imageName,
					})

					imagesToDownload.push({ imageName: record.imageName, recordName: record.recordName, username: record.username })
				}

				await AsyncStorage.setItem('nephro_data', JSON.stringify(newData))

				if (imagesToDownload.length > 0) downloadImages(imagesToDownload)
				else setShowMsg('')
			}
		} catch (err) {
			console.log(err)
			setShowMsg('')
			alert('Error occured during downloading')
		}
	}

	const downloadImages = async imagesInfo => {
		setShowMsg('Download Images')
		try {
			for (let i = 0; i < imagesInfo.length; i++) {
				setShowMsg(`Download Images No: ${i + 1}`)

				const { imageName, username, recordName } = imagesInfo[i]

				const fileRes = await FileSystem.downloadAsync(
					`${url}/downloadImage/?username=${username}&imageName=${imageName}&recordName=${recordName}`,
					FileSystem.documentDirectory + imageName
				)

				const asset = await MediaLibrary.createAssetAsync(fileRes.uri)

				const album = await MediaLibrary.getAlbumAsync('nephro_app')

				if (album == null) {
					await MediaLibrary.createAlbumAsync('nephro_app', asset, true)
				} else {
					await MediaLibrary.addAssetsToAlbumAsync([asset], album, true)
				}

				await axios.get(
					`${url}/changeImageName/?username=${username}&recordName=${recordName}&oldImageName=${imageName}&newImageName=${asset.filename}`
				)

				let recordData = await AsyncStorage.getItem('nephro_data')

				if (recordData != null) {
					recordData = JSON.parse(recordData)

					if (recordData.length > 0) {
						for (const record of recordData) {
							if (record.imageName == imageName) {
								record.imageName = asset.filename
							}
						}
					}

					await AsyncStorage.setItem('nephro_data', JSON.stringify(recordData))
				}
			}

			setShowMsg('')
		} catch (err) {
			console.log(err)
			setShowMsg('')
		}

		setReload(!reload)
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
		justifyContent: 'center',
		paddingStart: 15,
		paddingBottom: 15,
		borderBottomWidth: 2,
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

//make this component available to the app
export default Records
