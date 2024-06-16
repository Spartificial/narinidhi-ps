import { StyleSheet, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { GiftedChat } from 'react-native-gifted-chat';
import { texts } from '../texts';
import chatbot_img from '../../assets/images/chatbot_img.png';


export default function ChatScreen(navigation) {
  const [Language, setLanguage] = useState('english');
  const [Messages, setMessages] = useState([{ role: 'system', content: texts['chatbot_system_prompt'][Language] }]);
  const [GiftedMessages, setGiftedMessages] = useState([]);

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

  useEffect(() => {
    if(Messages[Messages.length-1]["role"] == 'user'){
      sendMessage();
    }
  }, [Messages]);

  const addMessages = (output) => {
    setMessages([...Messages, {"content": output, "role": "assistant"}]);
    setGiftedMessages(GiftedChat.append(GiftedMessages, {_id: GiftedMessages.length+1,text: output, user: {_id: 2}}));
  }

  const sendMessage = async () => {
    try {
      var output = await axios.post('https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: Messages,
        },
        {
          headers: {
            Authorization: 'Bearer '+ process.env.EXPO_PUBLIC_OPENAI_API_KEY,
          },
        }
      )
      addMessages(output['choices'][0]['message']);
    } catch (error) {
      addMessages(texts['chat_error_msg'][Language]);
      // console.error('Error sending message to ChatGPT:', error);
    }
  };

  const onSend = (newMessage) => {
    setMessages([...Messages, {'role': 'user', 'content': newMessage[0]['text']}]);
    setGiftedMessages(GiftedChat.append(GiftedMessages, {_id: GiftedMessages.length+1,text: newMessage[0]['text'], user: {_id: 1}}));
  }

  const sendSuggestion = (prompt) =>{
    setMessages([...Messages, {'role': 'user', 'content': prompt}]);
    setGiftedMessages(GiftedChat.append(GiftedMessages, {_id: GiftedMessages.length+1,text: prompt, user: {_id: 1}}));
  }

  var suggestionSection = null
  if (GiftedMessages.length == 0)
    {
    suggestionSection = <View style={styles.suggestionContainer}>
    <Image source={chatbot_img} style={{
        width: 40,
        resizeMode: 'contain'}}/>
    <Text style={styles.suggestionText} onPress={() => sendSuggestion(texts['suggestionText1'][Language]) }>{texts['suggestionText1'][Language]}</Text>
    <Text style={styles.suggestionText} onPress={() => sendSuggestion(texts['suggestionText2'][Language]) }>{texts['suggestionText2'][Language]}</Text>
  </View>
  }

  return(
    <View style={styles.mainContainer}>
      {suggestionSection}
      <GiftedChat
        messages={GiftedMessages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionContainer:{
    justifyContent: 'flex-end',
    height: '90%',
    alignItems: 'center',
  },

  mainContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  suggestionText:{
      borderRadius: 50,
      backgroundColor: '#F4F4F4',
      color: '#3E3E3E',
      paddingVertical: 10,
      textAlign: 'center',
      width: '80%',
      marginTop: 5,
  }
});