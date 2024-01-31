import { Pressable, Text, TextInput, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions, Keyboard } from 'react-native'
import { Link, router } from 'expo-router'
import { useEffect, useState } from 'react'
import axios from 'axios'
const { url } = require('./config.json')
import ScreenMsg from './component/ScreenMsg'
import * as secureStore from 'expo-secure-store'

const { width, height } = Dimensions.get('window')
export default function Login() {
	const colorScheme = useColorScheme()

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [showMsg, setShowMsg] = useState('')

	async function checkForLoginData() {
		const isloggedIn = await secureStore.getItemAsync('loggedIn')
		if (isloggedIn == 'yes') {
			const usernameValue = await secureStore.getItemAsync('username')
			if (usernameValue) {
				router.replace('/main/main')
			}
		}
	}

	checkForLoginData()

	const loginFunc = async () => {
		Keyboard.dismiss()
		if (username == '' && password == '') return alert('Fill All Fields')

		try {
			setShowMsg('Please Wait, Signing In.')
			const res = await axios.post(`${url}/users/getUser`, { username, password })

			setShowMsg('')

			if (res.data['passwordWrong'] == true) return setError('Password is incorrect')

			if (res.data['userFound'] == false) return setError('Username is incorrect')

			await secureStore.setItemAsync('username', username)
			await secureStore.setItemAsync('loggedIn', 'yes')

			router.replace('/main/main')
		} catch (err) {
			console.log(err)
			setShowMsg('')
			alert('Error occured, Please try agan.')
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
				<Link
					href={'/Signup'}
					style={[styles.footerText, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}>
					<Text>New User?</Text>
				</Link>
			</View>
			{showMsg != '' && <ScreenMsg msg={showMsg} />}
		</SafeAreaView>
	)
}

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
	footerText: {
		position: 'absolute',
		bottom: 0,
		paddingBottom: 5,
		borderBottomWidth: 2,
	},
	errText: {
		color: 'rgb(255, 50, 50)',
		fontWeight: '700',
		letterSpacing: 1.5,
		fontSize: 20,
		marginTop: 50,
	},
})

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
