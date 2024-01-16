import { Pressable, Text, TextInput, SafeAreaView, StyleSheet, useColorScheme, View, Dimensions } from 'react-native'
import { Link } from 'expo-router'

const { width, height } = Dimensions.get('window')
export default function Signup() {
	const colorScheme = useColorScheme()

	return (
		<SafeAreaView style={[styles.container, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>
			<Text style={[styles.text, colorScheme === 'dark' ? darkStyle.bgAndText : lightStyle.bgAndText]}>Nephro Inspector</Text>
			<View style={[styles.secondary]}>
				<TextInput
					placeholder='Enter Username'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					placeholder='Enter Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					placeholder='Confirm Password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<TextInput
					placeholder='Text to recover password'
					placeholderTextColor={colorScheme == 'dark' ? '#fafafa' : '#242424'}
					style={[styles.input, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}
				/>
				<Pressable
					onPress={() => alert('Signup')}
					style={[styles.scanBtn, colorScheme === 'dark' ? darkStyle.scanBtn : lightStyle.scanBtn]}>
					<Text style={[styles.scanText, colorScheme === 'dark' ? darkStyle.text : lightStyle.text]}>Create</Text>
				</Pressable>
				<Link
					href={'/'}
					style={[styles.footerText, colorScheme === 'dark' ? darkStyle.input : lightStyle.input]}>
					<Text>Already User?</Text>
				</Link>
			</View>
		</SafeAreaView>
	)
}

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
