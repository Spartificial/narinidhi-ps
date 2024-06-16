import { StyleSheet, Dimensions, Image  } from 'react-native';
import { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import homescreenImg from '../../assets/images/homescreenImg.png';
import { texts } from '../texts';

const dimensions = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      marginTop: 20,
      marginBottom: 20,
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    separator: {
      marginTop: 10,
      marginBottom: 20,
      height: 1,
      width: '80%',
    },
    languages:{
      fontSize: 15,
      marginTop: 15,
      width: dimensions.width/2,
      textAlign: 'center'
    },
    button:{
      borderWidth: 1,
      borderRadius: 3,
      borderColor: '#000',
      marginTop: 10,
      paddingVertical: 5,
      textAlign: 'center',
    }
  });


export default function TabOneScreen() {

  const [Display, setDisplay] = useState(false);
  const [Language, setLanguage] = useState('english');

  const checkLang = async () => {
    try {
      var result = await AsyncStorage.getItem('language')
        if (result == null){
          if (Display != false){
            setDisplay(false)
          }
        }
        else{
          if (Display != true){
            setDisplay(true)
          }
          if (Language != result){
            setLanguage(result)
          }
        }
    } catch (error) {
    }
  };
  
  checkLang();

  const saveLanguage = async (language)  => {
      try {
        await AsyncStorage.setItem('language',language);
        setDisplay(true);
      } catch (error) {
        console.error('Error saving data:', error);
      }
  };

  if (Display == true){
      var other_lang = Language=='hindi' ? 'english' : 'hindi';
      var Section = 
        <View>
          <Text style={styles.title}>{texts['welcome'][Language]}</Text>
          <Text style={{fontSize: 20}}>{texts['intro'][Language]}</Text>
          <Text style={styles.button}>{texts['calculator_button'][Language]}</Text>
          <Text style={styles.button}>{texts['govsch_button'][Language]}</Text>
          <Text style={styles.button}>{texts['chatbot_button'][Language]}</Text>
          <Text style={styles.button} onPress={() => saveLanguage(other_lang)}>{texts['change_language_button'][Language]}</Text>
        </View>;
  }
  else{
    var Section = 
      <View>
        <Text style={styles.title}>Welcome</Text>
        <Text style={{fontSize: 20, textAlign: 'center'}}>Select Language</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.languages} onPress={() => saveLanguage('english')}>English</Text>
          <Text style={styles.languages} onPress={() => saveLanguage('hindi')}>हिंदी</Text>
        </View>
      </View>;
  }
    return (
      <View style={styles.container}>
          <Image source={homescreenImg} style={{
            width: dimensions.width,
            height: 622*dimensions.width/720,
            resizeMode: 'contain'}}/>
        {Section}
      </View>
    );
  }