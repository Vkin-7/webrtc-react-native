import React from 'react';
import InitialScreen from './InitialScreen';
import Room from './Room';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const S = createStackNavigator();

      function Stack() {
        return (
          <NavigationContainer>
            <S.Navigator>
              <S.Screen name="InitialScreen" component={InitialScreen} />
              <S.Screen name="Room" component={Room} />
            </S.Navigator>
          </NavigationContainer>
        );
      }

    export default Stack