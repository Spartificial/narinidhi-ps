import { StyleSheet, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Chat, MessageType, defaultTheme } from '@flyerhq/react-native-chat-ui'
import { texts } from '../texts';
import chatbot_img from '../../assets/images/chatbot_img.png';

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r % 4) + 8
    return v.toString(16)
  })
}

export default function ChatScreen(navigation) {
  const [Language, setLanguage] = useState('english');
  const [Messages, setMessages] = useState([{ role: 'system', content: texts['chatbot_system_prompt'][Language] }]);
  const [ChatMessages, setChatMessages] = useState<MessageType.Any[]>([])
  const user = { id: '0' }
  const assistant = { id: '1' }

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
    var outputMessage: MessageType.Text = {
      author: assistant,
      id: uuidv4(),
      text: output,
      type: 'text',
    }
    setChatMessages([outputMessage, ...ChatMessages.slice(1)]);
    setMessages([...Messages, {"content": output, "role": "assistant"}]);
    
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
            'Content-Type': 'application/json',
          },
        }
      )
      addMessages(JSON.parse(output['request']['_response'])['choices'][0]['message']['content']);
    } catch (error) {
      addMessages(texts['chat_error_msg'][Language]);
      console.log(error);
    }
  };

  const onSend = (newMessage) => {
    var textMessage: MessageType.Text = {
      author: user,
      id: uuidv4(),
      text: newMessage.text,
      type: 'text',
    }
    var waitMessage: MessageType.Text = {
      author: assistant,
      id: uuidv4(),
      text: texts['chatbot_please_wait'][Language],
      type: 'text',
    }
    setMessages([...Messages, {'role': 'user', 'content': newMessage.text}]);
    setChatMessages([waitMessage, textMessage, ...ChatMessages]);
  }

  const sendSuggestion = (prompt) =>{
    var textMessage: MessageType.Text = {
      author: user,
      id: uuidv4(),
      text: prompt,
      type: 'text',
    }
    var waitMessage: MessageType.Text = {
      author: assistant,
      id: uuidv4(),
      text: texts['chatbot_please_wait'][Language],
      type: 'text',
    }
    setMessages([...Messages, {'role': 'user', 'content': prompt}]);
    setChatMessages([waitMessage, textMessage, ...ChatMessages]);
  }

  var suggestionSection = null
  if (ChatMessages.length == 0)
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
      <Chat
        theme={{
          ...defaultTheme,
          colors: { ...defaultTheme.colors, inputBackground: '#EEE', inputText: 'black'},
          borders: { ...defaultTheme.borders, inputBorderRadius: 0},
          fonts: { ...defaultTheme.fonts, emptyChatPlaceholderTextStyle: {color: 'white'}}
        }}
        messages={ChatMessages}
        onSendPress={messages => onSend(messages)}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionContainer:{
    justifyContent: 'flex-end',
    height: '85%',
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