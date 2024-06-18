import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function FAI(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;}

function AntIcon(props: {
  name: React.ComponentProps<typeof AntDesign>['name'];
  color: string;
}) {return <AntDesign size={28} style={{ marginBottom: -3 }} {...props} />;}


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FAI name='home' color={color} />,

        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => <AntIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scheme_overview"
        options={{
          title: 'Govt. Schemes',
          tabBarIcon: ({ color }) => <FAI name="newspaper-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Chat Bot',
          tabBarIcon: ({ color }) => <AntIcon name="question" color={color} />,
        }}
      />
    </Tabs>
  );
}
