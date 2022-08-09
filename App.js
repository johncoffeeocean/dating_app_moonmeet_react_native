import React, {useEffect} from 'react';
import StackNavigator from './src/config/Stack';
import {StatusBar, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import {COLORS} from './src/config/Miscellaneous';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {ThemeContext} from './src/config/Theme/Context';
import {ThemeMMKV} from './src/config/MMKV/ThemeMMKV';
import {MoonMeetDarkTheme} from './src/config/Theme/Theme';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {initializeMMKVFlipper} from 'react-native-mmkv-flipper-plugin';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

/**
 * Enabling the experimental freeze of react-native-screens
 * enableFreeze(true);
 * Will enable this soon
 **/

async function enableFirebaseTools() {
  await crashlytics()?.setCrashlyticsCollectionEnabled(true);
  await analytics()?.setAnalyticsCollectionEnabled(true);
}

if (__DEV__) {
  initializeMMKVFlipper({default: ThemeMMKV});
}

const App = () => {
  const [isThemeDark, setIsThemeDark] = React.useState(false);

  useEffect(() => {
    enableFirebaseTools();
    if (ThemeMMKV.contains('isThemeDark')) {
      if (ThemeMMKV.getBoolean('isThemeDark')) {
        if (!isThemeDark) {
          toggleTheme();
        }
      } else {
        ThemeMMKV.set('isThemeDark', false);
      }
    } else {
      if (isThemeDark) {
        toggleTheme();
        ThemeMMKV.set('isThemeDark', false);
      }
    }
  }, [isThemeDark, toggleTheme]);

  let theme = isThemeDark ? MoonMeetDarkTheme : DefaultTheme;

  const toggleTheme = React.useCallback(() => {
    return setIsThemeDark(!isThemeDark);
  }, [isThemeDark]);

  const themePrefernces = React.useMemo(
    () => ({
      toggleTheme,
      isThemeDark,
    }),
    [toggleTheme, isThemeDark],
  );
  return (
    <>
      <StatusBar
        backgroundColor={isThemeDark ? COLORS.primaryDark : COLORS.primaryLight}
        animated={true}
        barStyle={isThemeDark ? 'light-content' : 'dark-content'}
      />
      <ThemeContext.Provider value={themePrefernces}>
        <PaperProvider theme={theme}>
          <GestureHandlerRootView style={styles.GHRV}>
            <BottomSheetModalProvider>
              <StackNavigator />
              <Toast />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </PaperProvider>
      </ThemeContext.Provider>
    </>
  );
};

const styles = StyleSheet.create({
  GHRV: theme => {
    return {
      flex: 1,
      flexGrow: 1,
      backgroundColor: theme ? COLORS.primaryDark : COLORS.primaryLight,
    };
  },
});

export default App;
