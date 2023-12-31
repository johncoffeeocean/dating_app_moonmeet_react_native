/*
 * This is the source code of Moon Meet CrossPlatform.
 * It is licensed under GNU GPL v. 3.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Rayen sbai, 2021-2022.
 */

import React, {useCallback, useMemo, useRef} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Paragraph,
  Portal,
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {FONTS, COLORS} from '../../config/Miscellaneous';
import {fontValue} from '../../config/Dimensions';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {isNull, uniqBy} from 'lodash';
import {DecryptAES} from '../../utils/crypto/cryptoTools';
import {PurpleBackground} from '../../index.d';
import firestore from '@react-native-firebase/firestore';
import ChatOptionsBottomSheet from './BottomSheet/ChatOptionsBottomSheet';
import {ThemeContext} from '../../config/Theme/Context';
import {ErrorToast} from '../ToastInitializer/ToastInitializer';
import {useBottomSheetModal} from '@gorhom/bottom-sheet';
import {waitForAnd} from '../../utils/timers/delay';

const MessagesList = ({ListData}) => {
  const navigation = useNavigation();

  const chatOptionsRef = useRef(null);
  const sheetSnapPoints = useMemo(() => ['20%'], []);
  const [alertDialogVisible, setAlertDialogVisible] = React.useState();

  const memorisedDialogState = useCallback(value => {
    setAlertDialogVisible(value);
  }, []);

  const handlePresentModal = useCallback(() => {
    chatOptionsRef?.current?.present();
  }, []);

  const listEmptyComponent = () => {
    return (
      <View style={styles.emptyView}>
        <Text style={styles.heading('center', false)}>No Chats, yet.</Text>
        <Text style={styles.subheading('center', false, true)}>
          Discover new people to chat with them.
        </Text>
      </View>
    );
  };

  const messageText = item => {
    if (
      isNull(item?.typing) === false &&
      firestore.Timestamp.fromDate(new Date())?.toDate() -
        item?.typing?.toDate() <
        10000
    ) {
      return 'typing...';
    } else if (item?.type === 'message') {
      let decryptedMessage = DecryptAES(item?.to_message_text);
      let messageLength = decryptedMessage?.length;
      let message =
        item?.last_uid === auth()?.currentUser?.uid
          ? `You: ${decryptedMessage}`
          : `${decryptedMessage}`;
      let modifiedtext =
        messageLength < 30 ? message : message?.substring(0, 30) + '...';
      return modifiedtext;
    } else if (item?.type === 'image') {
      let messageImage =
        item?.last_uid === auth()?.currentUser?.uid
          ? 'You sent an image'
          : 'Sent an image';
      return messageImage;
    } else {
      return `Start chatting with ${item?.to_first_name}.`;
    }
  };

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const {isThemeDark} = React.useContext(ThemeContext);

  const {dismissAll} = useBottomSheetModal();

  const updateCurrentMessageAsUnread = useCallback(async currentMessage => {
    const messageRef = firestore()
      .collection('chats')
      .doc(auth()?.currentUser?.uid)
      .collection('discussions')
      .get();
    const collectionSnapshot = await messageRef;
    collectionSnapshot?.docs.map(documentSnapshot => {
      if (documentSnapshot?.id === currentMessage?.id) {
        documentSnapshot?.ref?.update({read: false});
      }
    });
  }, []);

  const updateCurrentMessageAsRead = useCallback(async currentMessage => {
    const messageRef = firestore()
      .collection('chats')
      .doc(auth()?.currentUser?.uid)
      .collection('discussions')
      .get();
    const collectionSnapshot = await messageRef;
    collectionSnapshot?.docs?.map(documentSnapshot => {
      if (documentSnapshot?.id === currentMessage?.id) {
        documentSnapshot?.ref?.update({read: true});
      }
    });
  }, []);

  const renderItem = ({item, index}) => {
    return (
      <>
        <Pressable
          android_ripple={{color: COLORS.rippleColor}}
          onPress={() => {
            navigation?.navigate('chat', {
              item:
                item?.last_uid === auth()?.currentUser?.uid
                  ? item?.sent_to_uid
                  : item?.last_uid,
            });
          }}
          onLongPress={() => {
            setCurrentIndex(index);
            handlePresentModal();
          }}
          style={{
            flexDirection: 'row',
            padding: '2%',
          }}>
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Avatar.Image
              style={styles.userHaveStory}
              size={52.5}
              source={
                item?.to_avatar
                  ? {
                      uri: item?.to_avatar,
                    }
                  : PurpleBackground
              }
            />
          </View>
          <View
            style={{
              flexGrow: 1,
              padding: '2%',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.heading('left', item?.read)}>
              {item?.to_first_name + ' ' + item?.to_last_name}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.subheading('left', true, item?.read)}>
              {messageText(item)}
            </Text>
          </View>
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.subheading('right', false, item?.read)}>
              {moment(item?.time?.toDate())?.format('MMM ddd HH:MM A')}
            </Text>
          </View>
        </Pressable>
        <Divider leftInset />
      </>
    );
  };

  return (
    <>
      <FlatList
        data={uniqBy(ListData, 'id')}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={{
          paddingStart: '0.5%',
          paddingEnd: '0.5%',
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        keyExtractor={item => item?.id}
        renderItem={renderItem}
        nestedScrollEnabled
      />
      <>
        <Portal>
          <Dialog
            dismissable={true}
            visible={alertDialogVisible}
            onDismiss={() => memorisedDialogState(false)}>
            <Dialog.Title
              style={{
                color: isThemeDark ? COLORS.white : COLORS.black,
                opacity: 0.9,
              }}>
              Delete this entire conversation?
            </Dialog.Title>
            <Dialog.Content>
              <Paragraph
                style={{
                  fontSize: fontValue(14),
                  color: isThemeDark ? COLORS.white : COLORS.black,
                  opacity: isThemeDark ? 0.8 : 0.6,
                }}>
                Once you delete your copy of the conversation, it can't be
                undone.
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                uppercase={false}
                mode={'outlined'}
                color={isThemeDark ? COLORS.redDarkError : COLORS.redLightError}
                style={{margin: '0.5%'}}
                onPress={async () => {
                  memorisedDialogState(false);
                  try {
                    const lastChatsRef = firestore()
                      .collection('chats')
                      .doc(auth()?.currentUser.uid)
                      .collection('discussions')
                      .doc(ListData[currentIndex]?.id);
                    await lastChatsRef?.delete();
                    const discussionsRef = await firestore()
                      .collection('users')
                      .doc(auth()?.currentUser?.uid)
                      .collection('messages')
                      .doc(ListData[currentIndex]?.id)
                      .collection('discussions')
                      .get();
                    const batchDelete = firestore().batch();
                    discussionsRef?.forEach(documentSnapshot => {
                      batchDelete?.delete(documentSnapshot?.ref);
                    });
                    return batchDelete?.commit();
                  } catch (e) {
                    if (__DEV__) {
                      console?.error(e);
                    }
                    ErrorToast(
                      'bottom',
                      'Failed to delete entire conversation',
                      `${e}`,
                      true,
                      1500,
                    );
                  }
                }}>
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </>
      <>
        <ChatOptionsBottomSheet
          sheetRef={chatOptionsRef}
          index={0}
          snapPoints={sheetSnapPoints}
          currentMessage={ListData[currentIndex]}
          unReadFunction={() => {
            updateCurrentMessageAsUnread(ListData[currentIndex]);
            waitForAnd(0).then(() => dismissAll());
          }}
          readFunction={() =>
            updateCurrentMessageAsRead(ListData[currentIndex]).then(() =>
              waitForAnd(0).then(() => dismissAll()),
            )
          }
          deleteFunction={() => {
            waitForAnd(0).then(() => {
              memorisedDialogState(true);
              dismissAll();
            });
          }}
        />
      </>
    </>
  );
};

const styles = StyleSheet.create({
  userHaveStory: {
    overflow: 'hidden',
  },
  heading: (align, isRead) => {
    return {
      fontSize: 16,
      textAlign: align,
      color: COLORS.black,
      opacity: isRead ? 0.6 : 1,
      fontFamily: FONTS.regular,
    };
  },
  subheading: (align, isMessage, isRead) => {
    return {
      fontSize: isMessage ? fontValue(14) : fontValue(11.5),
      paddingTop: '1%',
      textAlign: align,
      color: COLORS.black,
      opacity: isRead ? 0.6 : 1,
      fontFamily: FONTS.regular,
    };
  },
  emptyView: {
    marginTop: 12 - 0.1 * 12,
    flex: 1,
    backgroundColor: COLORS.white,
    alignSelf: 'center',
    alignContent: 'center',
  },
});

export default MessagesList;
