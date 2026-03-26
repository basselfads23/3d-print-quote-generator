import { useRef, useEffect, useCallback } from "react";
import { ScrollView, View, Keyboard } from "react-native";

/**
 * Provides reliable keyboard-aware scrolling for Android (adjustResize mode).
 * When the keyboard appears, automatically scrolls the most recently focused
 * input field into the visible area — works on all screen sizes.
 */
export function useKeyboardScroll() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const focusedView = useRef<View | null>(null);

  const scrollToFocused = useCallback(() => {
    const view = focusedView.current;
    const scroll = scrollViewRef.current;
    if (!view || !scroll) return;

    view.measureInWindow((_x, pageY) => {
      // Target: field appears 140px from the top of the screen
      // (clears the ~60px navigation header with room to breathe)
      const DESIRED_TOP_OFFSET = 140;
      if (pageY > DESIRED_TOP_OFFSET) {
        const newScrollY =
          scrollY.current + (pageY - DESIRED_TOP_OFFSET);
        scroll.scrollTo({ y: newScrollY, animated: true });
      }
    });
  }, []);

  useEffect(() => {
    // keyboardDidShow fires after the keyboard is fully visible,
    // so the layout has already resized before we scroll.
    const sub = Keyboard.addListener("keyboardDidShow", scrollToFocused);
    return () => sub.remove();
  }, [scrollToFocused]);

  /** Pass to the ScrollView's onScroll prop to track current scroll position. */
  const onScrollViewScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollY.current = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  /**
   * Returns an onFocus handler for a given View ref.
   * Attach to the TextInput's onFocus prop, pointing at the wrapping View.
   *
   * Example:
   *   const myRef = useRef<View>(null);
   *   <View ref={myRef}>
   *     <TextInput onFocus={onFocusFor(myRef)} />
   *   </View>
   */
  const onFocusFor = useCallback((viewRef: React.RefObject<View | null>) => {
    return () => {
      if (viewRef.current) {
        focusedView.current = viewRef.current;
      }
    };
  }, []);

  return { scrollViewRef, onScrollViewScroll, onFocusFor };
}
