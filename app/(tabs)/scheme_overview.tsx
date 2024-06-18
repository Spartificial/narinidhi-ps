import { StyleSheet, Image, Dimensions, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { texts } from '../texts';
import axios from 'axios';
import { Link } from 'expo-router';

const dimensions = Dimensions.get('window');

export default function SchemeOverview(navigation) {
  const [Language, setLanguage] = useState('english');
  const [Articles, setArticles] = useState([]);
  const [Error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  var content = null;

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

  const getSchemes = async () => {
    try {
      var output = await axios.get('https://serpapi.com/search.json?q='+texts["scheme_serp_query"][Language]+'&tbm=nws&api_key='+process.env.EXPO_PUBLIC_SERPAI_API_KEY)
      setArticles(JSON.parse(output['request']['_response'])['news_results']);
    } catch (error) {
      setError(true);
      console.error(error);
    }
  };
  useEffect(() => {
    if(Articles.length == 0){
      getSchemes();
    }
  }, [Language]);

  if (Error==true) {
    content = 
      <View style={styles.Container}>
        <Text style={styles.errorMessage}>{texts['schemes_overview_error_msg'][Language]}</Text>
      </View>
  }
  
  if(Articles.length != 0){
    content = <View>
      <Text style={styles.primaryTitle}>{texts['schemes_overview_title'][Language]}</Text>
      {Articles.map(article => (
          <View key={article['position']} style={styles.article_container}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <Image source={{ uri: article['thumbnail'] }} style={styles.article_image}/>
                  <Link href={{pathname:"/schemes_view",params: {Link: article['link']},}} style={styles.article_title}>{article['title']}</Link>
            </View>
            
            <Link href={{pathname:"/schemes_view",params: {Link: article['link']},}} style={styles.article_text}>{article['snippet'].replace(/\n/g, "")}</Link>
            <Link href={{pathname:"/schemes_view",params: {Link: article['link']},}} style={styles.article_subtext}>{article['source']} - {article['date']}</Link>
          </View>
      ))}
    </View>
  }
  
  const onRefresh = () => {
    getSchemes();
  };
  
  return (
    <RefreshControl style={styles.mainContainer} refreshing={refreshing} onRefresh={onRefresh}>
      <ScrollView>
          {content}
      </ScrollView>
    </RefreshControl>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    backgroundColor: '#fff',
  },
  Container:{
    borderWidth: 0.5,
    width: '80%',
    marginHorizontal: 'auto',
    paddingHorizontal: 10,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryTitle:{
    fontSize: 25,
    marginTop: 50,
    marginBottom:20,
    textAlign: 'center',
    width: '100%'
  },
  article_container:{
    borderWidth: 0.5,
    width: '80%',
    marginHorizontal: 'auto',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  article_title:{
    fontSize:15,
    fontWeight: 'bold',
    width:'60%',
    margin: '3%',
  },
  article_text:{
    fontSize:15,
    marginBottom: 5,
  },
  article_subtext:{
    color:'#808080',
    marginTop: 4,
    marginBottom: 10
  },
  article_image:{
    width: '33%', 
    height: dimensions['width']*0.3,
    resizeMode: 'contain'
  },
  errorMessage:{
    textAlign:'center',
    fontSize: 20,
    marginVertical: 10
  }
});