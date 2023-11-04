import { useEffect, useState } from 'react'
import { Button, Image, SafeAreaView, StyleSheet, useColorScheme } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'

export default function Scan() {
	let colorScheme = useColorScheme()

	const [image, setImage] = useState(null)

	const selectImage = async () => {
		const request = await ImagePicker.requestMediaLibraryPermissionsAsync()

		if (request.granted) {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
			})

			if (!result.canceled) {
				// Resize the selected image to 250x250
				const resizedImage = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 250, height: 250 } }], {
					format: 'jpeg',
					compress: 1,
				})

				setImage(resizedImage)
			}
		} else {
			alert('Cannot Access Images')
		}
	}

	const useCamera = async () => {
		const request = await ImagePicker.requestCameraPermissionsAsync()

		if (request.granted) {
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
			})

			if (!result.canceled) {
				// Resize the selected image to 250x250
				const resizedImage = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 250, height: 250 } }], {
					format: 'jpeg',
					compress: 1,
				})

				setImage(resizedImage)
			}
		} else {
			alert('Cannot Access Camera')
		}
	}

	const uploadimage = async () => {
		try {
			const res = await FileSystem.uploadAsync('http://192.168.10.4:8000/checkImage', image.uri, {
				httpMethod: 'POST',
				uploadType: FileSystem.FileSystemUploadType.MULTIPART,
				fieldName: 'image',
			})

			console.log('res')

			const message = JSON.parse(res.body).message

			alert(`Your Results are: ${message}`)
		} catch (err) {
			console.log('err')
			console.log(err)
		}
	}

	return (
		<SafeAreaView style={colorScheme === 'dark' ? darkStyles.container : lightStyles.container}>
			<Button
				title='Select Image'
				onPress={selectImage}
			/>
			<Button
				title='Camera'
				onPress={useCamera}
			/>
			{image && (
				<>
					<Image
						source={{ uri: image.uri }}
						style={{ width: 250, height: 250, marginTop: 10, marginBottom: 10 }}
					/>

					<Button
						title='Upload Image'
						onPress={uploadimage}
						style={{ marginTop: 10 }}
					/>
				</>
			)}
		</SafeAreaView>
	)
}

const lightStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fafafa',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
	},
})

const darkStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#2c2c2c',
		alignItems: 'center',
		justifyContent: 'center',
		rowGap: 10,
	},
})
