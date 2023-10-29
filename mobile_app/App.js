import { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

const imgDir = FileSystem.documentDirectory + 'images/'

const CheckDirExists = async () => {
	const dirInfo = await FileSystem.getInfoAsync(imgDir)

	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true })
	}
}

export default function App() {
	const [image, setImage] = useState(null)

	const selectImage = async () => {
		const request = await ImagePicker.requestMediaLibraryPermissionsAsync()

		if (request.granted) {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
			})

			if (!result.canceled) {
				console.log(result.assets[0].uri)
			}
		} else {
			alert('Cannot Access Images')
		}
	}

	return (
		<View style={styles.container}>
			<Button
				title='Select Image'
				onPress={selectImage}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
