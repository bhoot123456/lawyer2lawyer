import { useEffect, useState, useCallback } from "react";
import { Keyboard, KeyboardEvent, Platform, EmitterSubscription } from "react-native";

export interface KeyboardState {
  isVisible: boolean;
  keyboardHeight: number;
  keyboardAnimationDuration: number;
}

/**
 * useKeyboardManager - A hook that tracks keyboard visibility, height,
 * and animation duration across both Android and iOS.
 *
 * - On Android: keyboard height reports the actual keyboard frame.
 * - On iOS: keyboard height is reported via keyboardWillShow/keyboardWillHide.
 */
export function useKeyboardManager(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    isVisible: false,
    keyboardHeight: 0,
    keyboardAnimationDuration: 250,
  });

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setState({
        isVisible: true,
        keyboardHeight: event.endCoordinates.height,
        keyboardAnimationDuration: event.duration || 250,
      });
    };

    const onHide = (event: KeyboardEvent) => {
      setState({
        isVisible: false,
        keyboardHeight: 0,
        keyboardAnimationDuration: event.duration || 250,
      });
    };

    const showSubscription: EmitterSubscription = Keyboard.addListener(showEvent, onShow);
    const hideSubscription: EmitterSubscription = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return state;
}

/**
 * Dismisses the keyboard programmatically.
 */
export function dismissKeyboard(): void {
  Keyboard.dismiss();
}

/**
 * useKeyboardDismissOnTap - Provides a callback to dismiss keyboard
 * when tapping outside input fields. Use this with Pressable/TouchableOpacity
 * wrappers around your screen content.
 */
export function useKeyboardDismissOnTap(): () => void {
  return useCallback(() => {
    dismissKeyboard();
  }, []);
}