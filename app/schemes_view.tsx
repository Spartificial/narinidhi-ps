import { StyleSheet, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {useLocalSearchParams} from 'expo-router';
import { ActivityIndicator, PanResponder } from 'react-native';
import { WebView } from 'react-native-webview';
import { texts } from './texts';

const dimensions = Dimensions.get('window');

export default function SchemeView(navigation) {
  const { Link }= useLocalSearchParams();
  const [Language, setLanguage] = useState('english');
  
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currscale, setCurrScale] = useState(1);
  const [zoom, setZoom] = useState(false);
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.numberActiveTouches === 2;
    },
    onPanResponderGrant: () => {
        setZoom(true);
    },
    onPanResponderMove: (evt, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
            const distance = Math.sqrt(
                Math.pow(gestureState.dx, 2) + Math.pow(gestureState.dy, 2)
            );
            const newScale = (currscale + (distance - 20) / 1000).toFixed(2);
            if (newScale >= 1) {
                setCurrScale(newScale);
            }
        }
    },
    zoomFunction: () => {
        setZoom(false);
    },
  });

  useFocusEffect(
    React.useCallback(() => {
    const getStoredData = async () => {
      try {
        const value = await AsyncStorage.getItem('language');
        setLanguage(value);
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    };

    getStoredData();
  }, [navigation]), 
  );

return (
    <View style={styles.webviewContainer}>
      <WebView  ref={webviewRef}
                source={{ uri: Link }}
                onLoad={() => setLoading(false)}
                scalesPageToFit={false}
                javaScriptEnabled={true}
                bounces={false}
                startInLoadingState={true}
                originWhitelist={['*']}
                style={{transform: [{ scale: currscale }]}}
        {...(zoom ? panResponder.panHandlers : {})}/>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  webviewContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});