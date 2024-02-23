import { Pressable, Text, TextInput, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions, Keyboard } from 'react-native'
import { Link, router } from 'expo-router'
import axios from 'axios'
const { url } = require('./config.json')
import { useState } from 'react'
import ScreenMsg from './component/ScreenMsg'

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
export default function Signup() {
	const colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	const [username, setUsername] = useState('') // variable for username
	const [pwd, setPwd] = useState('') // variable for password
	const [confirmPwd, setConfirmPwd] = useState('') // variable for confirm password
	const [secret, setSecret] = useState('') // variable for secret

	const [showMsg, setShowMsg] = useState('') // variable for Msg on ScreenMsg comp

	// function to add user or create new user
	const addUser = async () => {
		// closes keyboard
		Keyboard.dismiss()

		// checking if,
		// username and password and confirm password and secret is not empty
		if (username != '' && pwd != '' && confirmPwd != '' && secret != '') {
			// checks if, password and confirm password is same
			if (pwd == confirmPwd) {
				// data for new user
				let user = {
					username: username,
					password: pwd,
					secret: secret,
				}

				try {
					// setting msg to tell user to wait
					setShowMsg('Wait, Creating New User')
					// api call to create new user
					const res = await axios.post(`${url}/users/add`, user)

					// checks if user is created
					if (res.status == 201) {
						// show msg that user is created
						setShowMsg('User Created Successfully!!!')
						// go to login screen after 0.5 sec
						setTimeout(() => router.replace('/'), 500)
					} else {
						setShowMsg('')
					}
				} catch (err) {
					// on error show different error messages.
					setShowMsg('')
					if (err.response.status == 400) {
						alert(`"${username}", This username Already exists!`)
					} else {
						alert(`An unexpected error occurred`)
					}
				}
			} else {
				// if password and confirm password is not same
				alert('Password and Confirm Password is not same!')
			}
		} else {
			// warn user to fill all fields
			alert('Fill All Fields')
		}
	}

	// this varibale helps to change style for confirm password field
	let confirmPwdBorderColor =
		confirmPwd != '' && pwd == confirmPwd
			? { borderColor: 'green', borderBottomWidth: 4 }
			: confirmPwd != '' && pwd != confirmPwd
			? { borderColor: 'red', borderBottomWidth: 4 }
			: {}

	return (
		<SafeAreaView style={[styles.container, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>
			<Text style={[styles.text, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>Nephro Inspector</Text>
			<View style={[styles.secondary]}>
				<TextInput
					onChangeText={text => setUsername(text)}
					placeholder='Enter Username'
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					onChangeText={text => setPwd(text)}
					secureTextEntry={true}
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholder='Enter Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					onChangeText={text => setConfirmPwd(text)}
					secureTextEntry={true}
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholder='Confirm Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input, confirmPwdBorderColor]}
				/>
				<TextInput
					onChangeText={text => setSecret(text)}
					placeholder='Text to recover password'
					autoCapitalize='none'
					autoComplete='off'
					autoCorrect={false}
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<Pressable
					onPress={addUser}
					style={[styles.scanBtn, colorScheme === 'dark' ? darkStyle.scanBtn : lightStyle.scanBtn]}>
					<Text style={[styles.scanText, colorScheme === 'dark' ? darkStyle.text : lightStyle.text]}>Create</Text>
				</Pressable>
				<Link
					href={'/'}
					style={[styles.footerText, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}>
					<Text>Already User?</Text>
				</Link>
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
		fontWeight: '500',
		textAlign: 'center',
		fontSize: 25,
		marginTop: height * 0.05,
		height: height * 0.1,
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
		margin: 15,
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
