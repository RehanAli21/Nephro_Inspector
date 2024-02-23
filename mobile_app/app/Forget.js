import { Pressable, Text, TextInput, Keyboard, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import ScreenMsg from './component/ScreenMsg'
import axios from 'axios'
const { url } = require('../app/config.json')

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')
export default function Forget() {
	const colorScheme = useColorScheme() // get system theme mode i.e. dark, light

	const [username, setUsername] = useState('') // variable for username
	const [pwd, setPwd] = useState('') // variable for password
	const [confirmPwd, setConfirmPwd] = useState('') // variable for confirm password
	const [secret, setSecret] = useState('') // variable for secret

	const [showMsg, setShowMsg] = useState('') // variable for Msg on ScreenMsg comp

	// function for changing password based on secret text
	const changePwd = async () => {
		// closes keyboard
		Keyboard.dismiss()

		// checking if,
		// username and password and confirm password and secret is not empty
		if (username != '' && pwd != '' && confirmPwd != '' && secret != '') {
			// checks if, password and confirm password is same
			if (pwd == confirmPwd) {
				// data for the user
				let user = {
					username: username,
					password: pwd,
					secret: secret,
				}

				try {
					// setting msg to tell user to wait
					setShowMsg('Wait, Changing Password')
					// api call to change password using secret
					const res = await axios.post(`${url}/users/changePassword`, user)

					// checks if password is changes
					if (res.status == 200) {
						if (res.data.incorrectUsername) {
							// tells user that username is incorrect
							alert('Wrong Username.')
						} else if (res.data.incorrectSecret) {
							// tells user recover/secret text is wrong
							alert('Wrong Recover Text.')
						} else {
							// tells user that password is changed
							alert('Password Changed Successfully!!!')
							// go to login page after 1 sec
							setTimeout(() => router.replace('/'), 1000)
						}
					}

					setShowMsg('')
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
			<Text style={[styles.text, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>Reset Password</Text>
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
					onChangeText={text => setSecret(text)}
					placeholder='Recover Text'
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
					placeholder='Enter New Password'
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
				<Pressable
					onPress={changePwd}
					style={[styles.scanBtn, colorScheme === 'dark' ? darkStyle.scanBtn : lightStyle.scanBtn]}>
					<Text style={[styles.scanText, colorScheme === 'dark' ? darkStyle.text : lightStyle.text]}>Change Password</Text>
				</Pressable>
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
