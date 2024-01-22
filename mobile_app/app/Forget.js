import { Pressable, Text, TextInput, Keyboard, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import ScreenMsg from './component/ScreenMsg'
import axios from 'axios'
const { url } = require('../app/config.json')

const { width, height } = Dimensions.get('window')
export default function Forget() {
	const colorScheme = useColorScheme()

	const [username, setUsername] = useState('')
	const [pwd, setPwd] = useState('')
	const [confirmPwd, setConfirmPwd] = useState('')
	const [secret, setSecret] = useState('')

	const [showMsg, setShowMsg] = useState('')

	const changePwd = async () => {
		console.log(url)
		Keyboard.dismiss()

		if (username != '' && pwd != '' && confirmPwd != '' && secret != '') {
			if (pwd == confirmPwd) {
				let user = {
					username: username,
					password: pwd,
					secret: secret,
				}

				try {
					setShowMsg('Wait, Changing Password')
					const res = await axios.post(`${url}/users/changePassword`, user)

					if (res.status == 200) {
						if (res.data.incorrectUsername) {
							alert('Wrong Username.')
						} else if (res.data.incorrectSecret) {
							alert('Wrong Recover Text.')
						} else {
							alert('Password Changed Successfully!!!')
							setTimeout(() => router.replace('/'), 1000)
						}
					}

					setShowMsg('')
				} catch (err) {
					setShowMsg('')
					if (err.response.status == 400) {
						alert(`"${username}", This username Already exists!`)
					} else {
						alert(`An unexpected error occurred`)
					}
				}
			} else {
				alert('Password and Confirm Password is not same!')
			}
		} else {
			alert('Fill All Fields')
		}
	}

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
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					onChangeText={text => setSecret(text)}
					placeholder='Recover Text'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					onChangeText={text => setPwd(text)}
					secureTextEntry={true}
					autoCorrect={false}
					placeholder='Enter New Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					onChangeText={text => setConfirmPwd(text)}
					secureTextEntry={true}
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
