import React, { useState } from 'react'
import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native'
import { v1 as uuid } from "uuid";

const InitialScreen = (props) => {

    const [text, setText] = useState('')

    const create = () => {
        const id = uuid()
        props.navigation.navigate('Room', { roomID: id })
    }
    return(
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <TextInput onChangeText={
                text => setText(text)
            }/>
            <TouchableOpacity onPress={
                () => props.navigation.navigate('Room', { roomID: text })
            }>
                <Text>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={create}>
                <Text>Criar sala</Text>
            </TouchableOpacity>
        </View>
    )
}

export default InitialScreen