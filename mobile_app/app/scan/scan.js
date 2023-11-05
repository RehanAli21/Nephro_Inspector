import { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { Button, Image, Text, SafeAreaView, StyleSheet, useColorScheme, Pressable, View, Dimensions } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { Link } from 'expo-router'

const { width, height } = Dimensions.get('window')
export default function Page() {
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
		<SafeAreaView style={[styles.container]}>
			<View style={[styles.v1]}>
				<Link
					href={'/'}
					asChild>
					<Pressable>
						<AntDesign
							name='leftcircleo'
							size={width * 0.07}
							color='black'
						/>
					</Pressable>
				</Link>
			</View>
			<View style={[styles.v2]}>
				<Pressable
					onPress={useCamera}
					style={[styles.headbtn, { paddingStart: 12, paddingEnd: 15 }]}>
					<Image
						resizeMode='contain'
						style={{ width: width * 0.09, height: width * 0.05, marginEnd: 10 }}
						source={require('../../assets/icons/bcameraicon.png')}
					/>
					<Text style={[styles.btnText]}>Use Camera</Text>
				</Pressable>
				<Pressable
					onPress={selectImage}
					style={[styles.headbtn, { paddingStart: 18, paddingEnd: 15 }]}>
					<Image
						resizeMode='contain'
						style={{ width: width * 0.05, height: width * 0.05, marginEnd: 15 }}
						source={require('../../assets/icons/bimageicon.png')}
					/>
					<Text style={[styles.btnText]}>Select Image</Text>
				</Pressable>
			</View>
			<View style={[styles.v3]}>
				{image ? (
					<>
						<Image
							style={[styles.imgPlaceholder]}
							resizeMode='contain'
							source={{ uri: image.uri }}
						/>
						<Pressable
							onPress={uploadimage}
							style={[styles.scanBtn]}>
							<Text style={[styles.scanText]}>Scan</Text>
						</Pressable>
					</>
				) : (
					<View style={[styles.imgPlaceholder]}>
						<Text style={[styles.textPlaceholder]}>Image For Scanning</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	)

	// return (
	// 	<SafeAreaView style={colorScheme === 'dark' ? darkStyles.container : lightStyles.container}>
	// 		<Button
	// 			title='Select Image'
	// 			onPress={selectImage}
	// 		/>
	// 		<Button
	// 			title='Camera'
	// 			onPress={useCamera}
	// 		/>
	// 		{image && (
	// 			<>
	// 				<Image
	// 					source={{ uri: image.uri }}
	// 					style={{ width: 250, height: 250, marginTop: 10, marginBottom: 10 }}
	// 				/>

	// 				<Button
	// 					title='Upload Image'
	// 					onPress={uploadimage}
	// 					style={{ marginTop: 10 }}
	// 				/>
	// 			</>
	// 		)}
	// 	</SafeAreaView>
	// )
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
	},
	v1: {
		marginTop: height * 0.05,
		flex: 0.5,
		width: '100%',
		justifyContent: 'center',
		paddingStart: 15,
	},
	v2: {
		flex: 0.9,
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'space-evenly',
	},
	v3: {
		flex: 5,
		width: '100%',
		alignItems: 'center',
	},
	headbtn: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignContent: 'center',
		alignSelf: 'center',
		alignItems: 'center',
		borderWidth: 2,
		padding: 7,
		borderRadius: 40,
	},
	btnImg: {
		marginEnd: 10,
	},
	btnText: {
		fontWeight: '600',
		fontSize: height * 0.023,
	},
	imgPlaceholder: {
		width: width * 0.8,
		borderWidth: 3,
		height: width * 0.8,
		marginTop: 10,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
	},
	textPlaceholder: {
		fontSize: height * 0.04,
		fontWeight: 600,
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
		fontSize: height * 0.03,
		fontWeight: 400,
	},
})

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
