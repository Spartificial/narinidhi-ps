import { StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import chatbot_img from '../../assets/images/chatbot_img.png';
import go_img from '../../assets/images/go_icon.png';
import { texts } from '../texts';
import axios from 'axios';

export default function Calculator(navigation) {
  const [Language, setLanguage] = useState('english');
  const [Input, setInput] = useState('');
  const [Output, setOutput] = useState('');

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

  const sendPrompt = async () => {
    setOutput(texts['calculator_please_wait'][Language])
    try {
      var output = await axios.post('https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: texts['calculator_system_prompt'][Language] },
            { role: 'user', content: Input }
          ],
        },
        {
          headers: {
            Authorization: 'Bearer '+ process.env.EXPO_PUBLIC_OPENAI_API_KEY,
          },
        }
      )
      setOutput(JSON.parse(output['request']['_response'])['choices'][0]['message']['content']);
    } catch (error) {
      setOutput(texts['calculator_error_msg'][Language]);
      console.log(error);
    }
  };
  
  const sendSuggestion = (suggestion) => {
    setInput(suggestion)
  }

  const handleChangeText = (input) => {
    setInput(input)
  }
  
  var suggestionSection = null;
  var outputSection = null;

  if (Input.length == 0)
  {
      suggestionSection = 
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>{texts['calc_suggestionTitle'][Language]}</Text>
    
        <Text style={styles.suggestionText} onPress={() => sendSuggestion(texts['calc_suggestionText1'][Language]) }>{texts['calc_suggestionText1'][Language]}</Text>
        <Text style={styles.suggestionText} onPress={() => sendSuggestion(texts['calc_suggestionText2'][Language]) }>{texts['calc_suggestionText2'][Language]}</Text>
        <Text style={styles.suggestionText} onPress={() => sendSuggestion(texts['calc_suggestionText3'][Language]) }>{texts['calc_suggestionText3'][Language]}</Text>
      </View>
  }

  if(Output.length != 0)
  {
    outputSection = <View style={styles.suggestionContainer}>
      <Text style={styles.suggestionText}>{Output}</Text>
    </View>
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.primaryTitle}>{texts['calc_title'][Language]}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={texts['calculator_placeholder'][Language]}
          onChangeText={handleChangeText}
          value={Input}
        />
        <TouchableOpacity onPress={sendPrompt}>
          <Image style={styles.go_button} source={go_img}/>
        </TouchableOpacity>
      </View>
      {suggestionSection}
      {outputSection}
    </View>
  );
}
const styles = StyleSheet.create({
  go_button:{
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  mainContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer:{
    borderWidth: 0.5,
    display: 'flex',    
    flexDirection: 'row',
    width: '80%',
    marginHorizontal: 'auto',
    paddingHorizontal: 10,
    height: 40,
    marginTop: 20,
    alignItems: 'center',
  },
  input:{
    flex: 1,
  },
  suggestionContainer:{
    width: '80%',
    marginHorizontal: 'auto',
    marginTop: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 20,
  },
  primaryTitle:{
    fontSize: 25,
    marginTop: 50,
    textAlign: 'center',
    width: '100%'
  },
  suggestionTitle:{
    fontSize: 20
  },
  suggestionText:{
      fontSize: 15,
      paddingVertical: 5,
      textAlign: 'center',
      width: '80%',
      marginTop: 5,
  }
});