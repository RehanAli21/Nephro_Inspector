import { Pressable, Text, Image, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions } from 'react-native'
import { Link, useNavigation, router } from 'expo-router'
import { useEffect, useState } from 'react'
const wscanicon = require('../../assets/icons/wscanicon.png')
const bscanicon = require('../../assets/icons/bscanicon.png')
const wrecordicon = require('../../assets/icons/wrecordicon.png')
const brecordicon = require('../../assets/icons/brecordicon.png')
const wsignout = require('../../assets/icons/whiteSignout.png')
const bsignout = require('../../assets/icons/blackSignout.png')
import * as secureStore from 'expo-secure-store'
import * as MediaLibrary from 'expo-media-library'
import AsyncStorage from '@react-native-async-storage/async-storage'

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
export default function Main() {
	const colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	const navigation = useNavigation() // hook to control navigation

	const [username, setUsername] = useState('') // variable for username
	const [goBack, setGoBack] = useState(false) // variable to track to go back or not

	useEffect(() => {
		// this helps in presenting user from going back
		navigation.addListener('beforeRemove', e => {
			// if goback is false then user can not go back
			// this prevent user to go to login page without signout
			if (goBack == false) {
				e.preventDefault()
				console.log('onback')
			}
			// if goback is true then user can go back
			// this helps in signout, so that user can go back to login
			if (goBack == true) {
				navigation.dispatch(e.data.action)
			}
		})

		checkForLoginData() // checking user
	}, [goBack, navigation])

	// function for checking if already loggedIn by
	// checking if login data is already present
	async function checkForLoginData() {
		// getting login data
		const isloggedIn = await secureStore.getItemAsync('loggedIn')
		// if loggedIn is not yes, then go to login page
		if (isloggedIn != 'yes') {
			setGoBack(true)
			router.replace('/')
			return
		}

		// getting username
		const usernameValue = await secureStore.getItemAsync('username')
		// setting username value
		setUsername(usernameValue)
	}

	// function for signout
	const logout = async () => {
		// enabling go to back functinality
		setGoBack(true)

		try {
			// deleting login data information
			await secureStore.deleteItemAsync('loggedIn')
			await secureStore.deleteItemAsync('username')
			await AsyncStorage.removeItem('nephro_data')
			const album = await MediaLibrary.getAlbumAsync('nephro_app')

			await MediaLibrary.deleteAlbumsAsync(album, true)
		} catch (err) {
			console.log(err)
		}

		// going to login screen
		router.replace('/')
		return
	}

	return (
		<SafeAreaView style={colorScheme === 'dark' ? darkStyles.container : lightStyles.container}>
			<View style={colorScheme == 'dark' ? darkStyles.nav : lightStyles.nav}>
				<Text style={colorScheme == 'dark' ? darkStyles.navText : lightStyles.navText}>{username}</Text>
				<View style={{ width: width * 0.5, alignItems: 'flex-end' }}>
					<Pressable
						onPress={logout}
						style={colorScheme == 'dark' ? darkStyles.navbtn : lightStyles.navbtn}>
						<Text style={[{ color: colorScheme == 'dark' ? '#fafafa' : '#242424' }, lightStyles.navBtnText]}>Sign Out</Text>
						<Image
							resizeMode='contain'
							source={colorScheme == 'dark' ? wsignout : bsignout}
							style={{ width: width * 0.07, height: width * 0.07 }}
						/>
					</Pressable>
				</View>
			</View>
			<View style={colorScheme === 'dark' ? darkStyles.main : lightStyles.main}>
				<Image
					style={colorScheme === 'dark' ? darkStyles.image : lightStyles.image}
					resizeMode='contain'
					source={colorScheme === 'dark' ? require('../../assets/icons/wkidneyicon.png') : require('../../assets/icons/bkidneyicon.png')}
				/>
				<Text style={colorScheme === 'dark' ? darkStyles.text : lightStyles.text}>Nephro Inspector</Text>
			</View>
			<View style={colorScheme === 'dark' ? darkStyles.secondary : lightStyles.secondary}>
				<View style={colorScheme === 'dark' ? darkStyles.secondView : lightStyles.secondView}>
					<Link
						href={'/scan/scan'}
						asChild>
						<Pressable style={{ alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
							<Image
								style={{ width: width * 0.27, height: width * 0.27 }}
								resizeMode='contain'
								source={colorScheme === 'dark' ? wscanicon : bscanicon}
							/>
							<Text style={colorScheme === 'dark' ? darkStyles.secondText : lightStyles.secondText}>Scan</Text>
						</Pressable>
					</Link>
				</View>
				<View style={colorScheme === 'dark' ? darkStyles.secondView : lightStyles.secondView}>
					<Link
						href={'/records/records'}
						asChild>
						<Pressable style={{ alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
							<Image
								style={{ width: width * 0.25, height: width * 0.262 }}
								source={colorScheme === 'dark' ? wrecordicon : brecordicon}
							/>
							<Text style={colorScheme === 'dark' ? darkStyles.secondText : lightStyles.secondText}>Record</Text>
						</Pressable>
					</Link>
				</View>
			</View>
		</SafeAreaView>
	)
}
// styles for light mode.
const lightStyles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		backgroundColor: '#fafafa',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
	},
	nav: {
		width: width,
		marginTop: 30,
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		borderTopWidth: 1,
		borderColor: '#242424',
		paddingTop: 10,
	},
	navText: {
		width: width * 0.5,
		color: '#242424',
		textAlign: 'left',
		fontWeight: 'bold',
		fontSize: 22,
		paddingStart: 25,
		marginTop: 6,
	},
	navbtn: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#242424',
		width: width * 0.32,
		padding: 2,
		marginEnd: 10,
		borderRadius: 15,
		marginTop: 10,
	},
	navBtnText: {
		marginStart: 5,
		marginEnd: 5,
		fontWeight: '500',
		fontSize: 16,
	},
	text: {
		color: '#242424',
		fontWeight: '900',
		textAlign: 'center',
		fontSize: 25,
	},
	image: {
		width: width * 0.9,
		height: height * 0.4,
	},
	main: {
		flex: 1.8,
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
		backgroundColor: '#242424',
	},
	secondView: {
		backgroundColor: '#fafafa',
		width: '50%',
		display: 'flex',
		alignContent: 'center',
		justifyContent: 'center',
	},
	secondText: {
		color: '#242424',
		fontWeight: '800',
		fontSize: 15,
		textAlign: 'center',
		marginTop: 10,
	},
})
// styles for dark mode.
const darkStyles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		backgroundColor: '#242424',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
		overflow: 'hidden',
	},
	nav: {
		width: width,
		marginTop: 30,
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		borderTopWidth: 1,
		borderColor: '#fafafa',
		paddingTop: 10,
	},
	navText: {
		width: width * 0.5,
		color: '#fafafa',
		textAlign: 'left',
		fontWeight: 'bold',
		fontSize: 22,
		paddingStart: 25,
		marginTop: 6,
	},
	navbtn: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fafafa',
		width: width * 0.32,
		padding: 2,
		marginEnd: 10,
		borderRadius: 15,
		marginTop: 10,
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
		flex: 1.8,
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
		backgroundColor: '#242424',
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
