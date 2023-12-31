/*
 * This is the source code of Moon Meet CrossPlatform.
 * It is licensed under GNU GPL v. 3.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Rayen sbai, 2021-2022.
 */

import React, {useEffect} from 'react';
import MiniBaseView from '../components/MiniBaseView/MiniBaseView';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS, FONTS} from '../config/Miscellaneous';
import {ActivityIndicator, Avatar} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import ScrollViewData from '../components/SettingsScreen/ScrollViewContainer';
import {ThemeContext} from '../config/Theme/Context';
import {PurpleBackground} from '../index.d';
import {fontValue} from '../config/Dimensions';
import {ScrollView} from 'react-native-gesture-handler';

const SettingsScreen = () => {
  const [Loading, setLoading] = React.useState(true);

  const navigation = useNavigation();

  const [avatarURL, setAvatarURL] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userBio, setUserBio] = React.useState('');
  const [activeStatus, setActiveStatus] = React.useState('');
  const [activeTime, setActiveTime] = React.useState('');

  const {isThemeDark} = React.useContext(ThemeContext);

  const styles = StyleSheet.create({
    under_header: {
      padding: '2%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    under_header_text: {
      position: 'relative',
      fontSize: fontValue(24),
      paddingLeft: '3%',
      paddingRight: '3%',
      paddingTop: '1%',
      textAlign: 'center',
      color: isThemeDark ? COLORS.white : COLORS.black,
      fontFamily: FONTS.regular,
    },
    bioText: userBio => {
      return {
        position: 'relative',
        fontSize: fontValue(16),
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        paddingTop: '1%',
        textAlign: 'center',
        color: isThemeDark ? COLORS.white : COLORS.black,
        opacity: userBio ? 0.6 : 0.4,
        fontFamily: FONTS.regular,
      };
    },
  });

  useEffect(() => {
    const usersSubsriber = firestore()
      .collection('users')
      .doc(auth()?.currentUser?.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          setAvatarURL(documentSnapshot?.data()?.avatar);
          setFirstName(documentSnapshot?.data()?.first_name);
          setLastName(documentSnapshot?.data()?.last_name);
          setUserName(documentSnapshot?.data()?.username);
          setActiveStatus(documentSnapshot?.data()?.active_status);
          setActiveTime(documentSnapshot?.data()?.active_time);
          if (documentSnapshot?.data()?.bio) {
            setUserBio(documentSnapshot?.data()?.bio);
          }
        }
        setLoading(false);
      });
    const activeStatusSubscribe = firestore()
      .collection('users')
      ?.doc(auth()?.currentUser?.uid)
      .get()
      ?.then(documentSnapshot => {
        documentSnapshot?.ref?.update({
          active_status:
            documentSnapshot?.data()?.active_status === 'normal'
              ? 'normal'
              : 'recently',
          active_time:
            documentSnapshot?.data()?.active_time === 'Last seen recently'
              ? 'Last seen recently'
              : firestore?.Timestamp?.fromDate(new Date()),
        });
      });
    return () => {
      usersSubsriber();
    };
  }, []);

  if (Loading) {
    return (
      <MiniBaseView>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            size={'large'}
            color={isThemeDark ? COLORS.accentDark : COLORS.accentLight}
          />
        </View>
      </MiniBaseView>
    );
  }
  return (
    <MiniBaseView>
      <ScrollView alwaysBounceVertical nestedScrollEnabled>
        <View style={styles.under_header}>
          <Avatar.Image
            size={85}
            source={
              auth()?.currentUser?.photoURL
                ? {uri: auth()?.currentUser?.photoURL}
                : avatarURL
                ? {uri: avatarURL}
                : PurpleBackground
            }
          />
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={styles.under_header_text}>
            {auth()?.currentUser?.displayName
              ? auth()?.currentUser?.displayName
              : `${firstName} ${lastName}`}
          </Text>
          {userBio ? (
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              onPress={() => navigation?.navigate('addBio')}
              style={styles.bioText(userBio)}>
              {userBio}
            </Text>
          ) : (
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={styles.bioText(userBio)}
              onPress={() => navigation?.navigate('addBio')}>
              Tap to add a bio
            </Text>
          )}
        </View>
        <ScrollViewData
          firstName={firstName}
          lastName={lastName}
          username={userName}
          avatar={avatarURL}
          activeStatus={activeStatus}
          activeTime={activeTime}
        />
      </ScrollView>
    </MiniBaseView>
  );
};

export default SettingsScreen;
