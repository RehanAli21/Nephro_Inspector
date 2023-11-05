import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: '#242424',
				},
				headerTintColor: '#fafafa',
				headerTitleStyle: {
					fontWeight: 'bold',
				},
			}}>
			<Stack.Screen
				name='index'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='scan/scan'
				options={{ headerShown: false }}
			/>
		</Stack>
	)
}

export default Layout
