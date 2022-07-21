import analytics from '@react-native-firebase/analytics';
import appCheck from '@react-native-firebase/app-check';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useCallback} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import LogoImage from '../assets/images/logo.png';
import {
  fontValue,
  heightPercentageToDP,
  widthPercentageToDP,
} from '../config/Dimensions';
import {COLORS, FONTS} from '../config/Miscellaneous';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from 'react-native-paper';
import {OnboardingMMKV} from '../config/MMKV/OnboardingMMKV';
import {getVersion} from 'react-native-device-info';
import {isNull} from 'lodash';

const SplashScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  /**
   * Passcode Checking
   */

  const [havePasscode, setHavePasscode] = React.useState(null);

  /**
   * Update variables, used in to check for required updates.
   */

  const [updatedRequired, setUpdateRequired] = React.useState(false);
  const [updateVersion, setUpdateVersion] = React.useState('');
  const [updateDateReleased, setUpdateDateReleased] = React.useState('');
  const [updateURL, setUpdateURL] = React.useState('');
  const [updateChangelog, setUpdateChangelog] = React.useState('');
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  const [currentAppVersion] = React.useState(getVersion());

  /**
   * Splash Screen animations.
   */
  const scaleX = useSharedValue(0.1);
  const scaleY = useSharedValue(0.1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [animationDisabled, setAnimationDisabled] = React.useState(false);

  const isViewPagerCompleted = () => {
    return (
      OnboardingMMKV.contains('onboardingComplete') &&
      OnboardingMMKV.getBoolean('onboardingComplete')
    );
  };

  async function enableFirebaseTools() {
    await crashlytics()?.setCrashlyticsCollectionEnabled(true);
    await analytics()?.setAnalyticsCollectionEnabled(true);
    await appCheck()?.activate('ignored', false);
  }

  const checkForPasscode = useCallback(async () => {
    await firestore()
      .collection('users')
      .doc(auth()?.currentUser?.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot?.exists) {
          if (documentSnapshot?.data()?.passcode?.passcode_enabled) {
            setHavePasscode(true);
          } else {
            setHavePasscode(false);
          }
        }
      });
  }, []);

  const checkForUpdates = useCallback(async () => {
    await firestore()
      .collection('updates')
      .doc('releasedUpdate')
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot?.exists) {
          setUpdateRequired(documentSnapshot?.data()?.updatedRequired);
          setUpdateVersion(documentSnapshot?.data()?.version);
          setUpdateChangelog(documentSnapshot?.data()?.changelog);
          setUpdateDateReleased(documentSnapshot?.data().dateReleased);
          setUpdateURL(documentSnapshot?.data()?.updateURL);
          if (updateVersion) {
            if (currentAppVersion != updateVersion) {
              setUpdateAvailable(true);
            }
          }
        }
      });
  }, [currentAppVersion, updateVersion]);

  const AnimateScene = useCallback(() => {
    scaleX.value = withDelay(30, withTiming(0.09, {duration: 275}));
    scaleY.value = withDelay(30, withTiming(0.09, {duration: 275}));
    opacity.value = withTiming(0, {duration: 275});
    translateY.value = withDelay(0, withTiming(375, {duration: 500}));
    translateY.value = withDelay(300, withTiming(0, {duration: 750}));
    scaleX.value = withSpring(0.09);
    scaleY.value = withSpring(0.09);
    scaleX.value = withSpring(0);
    scaleY.value = withSpring(0);
    opacity.value = withSpring(1);
    scaleX.value = withDelay(750, withTiming(0.09, {duration: 250}));
    scaleY.value = withDelay(
      750,
      withTiming(0.09, {duration: 250}, isFinished => {}),
    );
  }, [opacity, scaleX, scaleY, translateY]);

  useEffect(() => {
    checkForUpdates();
    enableFirebaseTools();
    const AnimateSceneTimerTask = setTimeout(() => {
      AnimateScene();
    }, 1000);
    const SplashScreenTimerTask = setTimeout(() => {
      if (updateVersion !== null && updateChangelog !== '') {
        if (updateAvailable) {
          console.log('update available');
          // TODO: add design for update bottomsheet
        } else {
          if (isViewPagerCompleted()) {
            if (auth()?.currentUser !== null) {
              checkForPasscode().finally(() => {
                if (!isNull(havePasscode)) {
                  if (havePasscode) {
                    navigation?.navigate('passcodeVerify');
                  } else {
                    navigation?.navigate('home');
                  }
                }
              });
            } else {
              navigation?.navigate('login');
            }
          } else {
            navigation?.navigate('onboarding');
          }
        }
      }
    }, 2000);
    return () => {
      clearTimeout(SplashScreenTimerTask);
      clearTimeout(AnimateSceneTimerTask);
    };
  }, [
    AnimateScene,
    checkForPasscode,
    checkForUpdates,
    havePasscode,
    navigation,
    updateAvailable,
    updateChangelog,
    updateVersion,
  ]);

  const viewAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scaleX: scaleX.value}, {scaleY: scaleY.value}],
      opacity: opacity.value,
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.fill_screen, {backgroundColor: COLORS.primaryLight}]}>
      <Animated.View style={[styles.container, viewAnimatedStyle]}>
        <Animated.Image
          style={[styles.logo, imageAnimatedStyle]}
          source={LogoImage}
        />
        <Text style={[styles.bottom_text, {color: COLORS.accentLight}]}>
          Moon Meet
        </Text>
        <Text style={styles.slogan_text}>
          We give people the closest distances
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fill_screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: heightPercentageToDP(300),
    width: widthPercentageToDP(800),
    position: 'relative',
    bottom: heightPercentageToDP(13.5),
  },
  bottom_text: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: fontValue(20),
    bottom: heightPercentageToDP(6.25),
    fontFamily: FONTS.bold,
  },
  slogan_text: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: fontValue(16),
    bottom: heightPercentageToDP(2.75),
    color: COLORS.black,
    fontFamily: FONTS.regular,
    opacity: 0.4,
  },
});

export default SplashScreen;
