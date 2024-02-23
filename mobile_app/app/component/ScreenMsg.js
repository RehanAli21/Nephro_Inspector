import { View, Text, StyleSheet, ActivityIndicator, Dimensions, useColorScheme } from 'react-native'

// to get width and height of device
// it helps in styling
const { width, height } = Dimensions.get('window')

// component for show messages
// this component cover whole screen to show message.
const ScreenMsg = ({ msg }) => {
	const colorScheme = useColorScheme() // get system theme mode i.e. dark, light
	return (
		<View style={[styles.container, { backgroundColor: colorScheme == 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.8)' }]}>
			<View style={[styles.section]}>
				<ActivityIndicator
					size='large'
					color={colorScheme === 'dark' ? '#fafafa' : '#242424'}
				/>
				<Text style={[styles.text, { color: colorScheme == 'dark' ? '#fafafa' : '#242424' }]}>{msg}</Text>
			</View>
		</View>
	)
}

// define your styles
const styles = StyleSheet.create({
	container: {
		width: width,
		height: height,
		zIndex: 99,
		position: 'absolute',
		top: 0,
		left: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	section: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
	},
	text: {
		fontSize: 20,
	},
})

//make this component available to the app
export default ScreenMsg
