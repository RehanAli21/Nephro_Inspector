import { Pressable, Text, TextInput, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions, Keyboard } from 'react-native'
import { Link, router } from 'expo-router'
import { useEffect, useState } from 'react'
import axios from 'axios'
const { url } = require('./config.json')
import ScreenMsg from './component/ScreenMsg'
import * as secureStore from 'expo-secure-store'

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
export default function Login() {
	const colorScheme = useColorScheme() // get system theme mode i.e. dark, light

	const [username, setUsername] = useState('') // variable for username
	const [password, setPassword] = useState('') // variable for password
	const [error, setError] = useState('') // variable for error, it shows errors
	const [showMsg, setShowMsg] = useState('') // variable for Msg on ScreenMsg comp

	useEffect(() => {
		// calling function on component initialize
		checkForLoginData()
	}, [])

	// function for checking if already loggedIn by
	// checking if login data is already present
	async function checkForLoginData() {
		// getting login data
		const isloggedIn = await secureStore.getItemAsync('loggedIn')
		// if loggedIn
		if (isloggedIn == 'yes') {
			// checking if username exists
			const usernameValue = await secureStore.getItemAsync('username')
			if (usernameValue) {
				// got to the main menu screen
				router.replace('/main/main')
			}
		}
	}

	// function for login for user
	const loginFunc = async () => {
		// closes keyboard
		Keyboard.dismiss()

		// checking if username and password is not empty
		if (username == '' && password == '') return alert('Fill All Fields')

		if (username == 'rehan' || username == 'zainab') {
			if (password == 'rehan' || password == 'zainab') {
				await secureStore.setItemAsync('username', username)
				await secureStore.setItemAsync('loggedIn', 'yes')

				// go to the main menu screen
				router.replace('/main/main')
			}
		}
	}

	return (
		<SafeAreaView style={[styles.container, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>
			<Text style={[styles.text, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>Nephro Inspector</Text>
			<View style={[styles.secondary]}>
				<TextInput
					placeholder='Username'
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
					onChangeText={text => setUsername(text)}
				/>
				<TextInput
					secureTextEntry={true}
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholder='Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
					onChangeText={text => setPassword(text)}
				/>
				<Link
					href={'/Forget'}
					style={[styles.smallText, colorScheme === 'dark' ? darkStyle.text : lightStyle.text]}>
					<Text>Forget Password?</Text>
				</Link>
				<Pressable
					onPress={loginFunc}
					style={[styles.scanBtn, colorScheme === 'dark' ? darkStyle.scanBtn : lightStyle.scanBtn]}>
					<Text style={[styles.scanText, colorScheme === 'dark' ? darkStyle.text : lightStyle.text]}>LOGIN</Text>
				</Pressable>
				{error != '' && <Text style={styles.errText}>{error}</Text>}
				<View style={styles.footer}>
					<Link
						href={'/Signup'}
						style={[styles.footerText1, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}>
						<Text>New User?</Text>
					</Link>
					<Link
						href={'/quickscan/quickscan'}
						style={[styles.footerText2, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}>
						<Text>Quick Scan</Text>
					</Link>
				</View>
			</View>
			{showMsg != '' && <ScreenMsg msg={showMsg} />}
		</SafeAreaView>
	)
}

// general styles
const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flex: 1,
	},
	text: {
		fontWeight: '900',
		textAlign: 'center',
		fontSize: 25,
		marginTop: height * 0.12,
		height: height * 0.15,
	},
	secondary: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'top',
		height: height * 0.7,
	},
	smallText: {
		fontSize: 12,
		textAlign: 'right',
		marginTop: -10,
		width: width * 0.6,
	},
	input: {
		borderBottomWidth: 2,
		padding: 10,
		paddingStart: 15,
		paddingEnd: 15,
		margin: 20,
		borderRadius: 5,
		fontSize: 16,
		width: width * 0.6,
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
		fontSize: 16,
		fontWeight: 400,
	},
	footer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		position: 'absolute',
		bottom: 0,
		paddingBottom: 5,
	},
	footerText1: {
		borderRightWidth: 5,
		borderColor: '#fafafa',
		paddingEnd: 20,
		fontSize: width * 0.04,
	},
	footerText2: {
		borderLeftWidth: 5,
		borderColor: '#fafafa',
		paddingStart: 20,
		fontSize: width * 0.04,
	},
	errText: {
		color: 'rgb(255, 50, 50)',
		fontWeight: '700',
		letterSpacing: 1.5,
		fontSize: 20,
		marginTop: 50,
	},
})

// specific styles for light mode
const lightStyle = StyleSheet.create({
	text: {
		color: '#242424',
	},
	bg: {
		backgroundColor: '#fafafa',
	},
	bgAndText: {
		color: '#242424',
		backgroundColor: '#fafafa',
	},
	scanBtn: {
		borderColor: '#242424',
	},
	input: {
		color: '#242424',
		borderColor: '#242424',
	},
})

// specific styles for dark mode
const darkStyle = StyleSheet.create({
	text: {
		color: '#fafafa',
	},
	bg: {
		backgroundColor: '#242424',
	},
	bgAndText: {
		color: '#fafafa',
		backgroundColor: '#242424',
	},
	scanBtn: {
		borderColor: '#fafafa',
	},
	input: {
		color: '#fafafa',
		borderColor: '#fafafa',
	},
})
