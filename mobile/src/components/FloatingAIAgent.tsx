import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalizeApiError } from "@/services/api";
import { SHELL_TAB_BAR_MIN_HEIGHT } from "@/components/BottomTabs";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { getAIConversationById, sendAIChatMessage, resetConversation } from "../modules/aiAssistant/services/backendAI";
import type { AIChatConversation } from "../modules/aiAssistant/services/backendAI";
import { clearAllAIData } from "../modules/aiAssistant/utils/storage";

import {
  AI_BG,
  AI_CARD_BG,
  AI_GOLD,
  AI_GOLD_LIGHT,
  AI_TEXT_MUTED,
  AI_TEXT_PRIMARY,
  AI_TEXT_SECONDARY,
} from "../modules/aiAssistant/constants";


type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

const STORAGE_KEY_AI_POSITION = "@lawyer2lawyer/ai_agent_position";
const STORAGE_KEY_AI_PANEL_OPEN = "@lawyer2lawyer/ai_agent_panel_open";
const STORAGE_KEY_AI_CONVERSATION_ID = "@lawyer2lawyer/ai_conversation_id";

const DEFAULT_POSITION = { x: 16, y: 160 };
// Keep the draggable copilot clear of the bottom tab bar + central action.
const BOTTOM_TAB_CLEARANCE = SHELL_TAB_BAR_MIN_HEIGHT + 88;
const HIDDEN_ROUTES = ["/login", "/register"];
const DRAG_THRESHOLD = 5;

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    text: "Hello, I'm your legal copilot. Ask me about legal research, case summaries, drafting notices, court procedure, or workflow recommendations.",
    createdAt: new Date().toISOString(),
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function getScreenContext(pathname: string) {
  if (!pathname) return "General app context";
  if (pathname.startsWith("/cases/")) return "Case Details";
  if (pathname.startsWith("/court-diary")) return "Court Diary";
  if (pathname.startsWith("/revenue-court")) return "Revenue Case";
  if (pathname.startsWith("/tax-corporate")) return "Tax & Corporate";
  if (pathname.startsWith("/knowledge-hub")) return "Knowledge Hub";
  if (pathname.startsWith("/bare-acts")) return "Bare Acts";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/ai-assistant")) return "AI Assistant";
  return pathname.replace("/", "").replace(/-/g, " ") || "General";
}

function renderMarkdownLike(text: any) {
  try {
    const safeText = typeof text === "string" ? text : String(text || "");
    const codeBlockPattern = /```([\s\S]*?)```/g;
    const parts = safeText.split(codeBlockPattern);
    return parts.map((part: string, index: number) => {
      const isCode = index % 2 === 1;
      if (isCode) {
        return (
          <Text key={`code-${index}`} style={styles.codeBlockText}>
            {part || ""}
          </Text>
        );
      }
      return (
        <Text key={`text-${index}`} style={styles.messageText}>
          {part || ""}
        </Text>
      );
    });
  } catch (error) {
    console.error("renderMarkdownLike error:", error);
    return (
      <Text style={styles.messageText}>
        {typeof text === "string" ? text : "Error rendering message"}
      </Text>
    );
  }
}

function isConversationNotFoundError(err: any) {
  const msg = String(err?.message || "");
  const backendMsg = String(err?.response?.data?.message || "");
  const title = msg || backendMsg;
  return /conversation not found/i.test(title);
}

async function safeLoadConversation(conversationId: string): Promise<AIChatConversation | null> {
  if (!conversationId) return null;
  try {
    const c = await getAIConversationById(conversationId);
    return c || null;
  } catch {
    return null;
  }
}

async function clearStoredConversationId() {
  await AsyncStorage.removeItem(STORAGE_KEY_AI_CONVERSATION_ID);
}

function useSafeInsets() {
  try {
    const insets = useSafeAreaInsets();
    if (!insets) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    return insets;
  } catch {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
}

export default function FloatingAIAgent() {
  const pathname = usePathname();
  const safeArea = useSafeInsets();
  const windowDims = useMemo(() => Dimensions.get("window"), []);
    const buttonSize: number = 60;

  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [autoRecoveryAttempting, setAutoRecoveryAttempting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const translateX = useSharedValue(DEFAULT_POSITION.x);
  const translateY = useSharedValue(DEFAULT_POSITION.y);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowRadius = useSharedValue(16);
  const shadowOpacity = useSharedValue(0.35);
  const shadowOffsetY = useSharedValue(10);
  const messagesScrollRef = useRef<ScrollView | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);

  const isHiddenRoute = useMemo(
    () => HIDDEN_ROUTES.some((route) => String(pathname || "").startsWith(route)),
    [pathname]
  );

  const screenContext = useMemo(() => getScreenContext(String(pathname || "")), [pathname]);

  const minX = useMemo(() => 12, []);
  const maxX = useMemo(
    () => Math.max(12, windowDims.width - buttonSize - 12),
    [windowDims.width, buttonSize]
  );
  const minY = useMemo(() => Math.max(80, safeArea.top + 16), [safeArea.top]);
  const maxY = useMemo(
    () =>
      Math.max(
        80,
        windowDims.height - buttonSize - BOTTOM_TAB_CLEARANCE - safeArea.bottom
      ),
    [windowDims.height, buttonSize, safeArea.bottom]
  );

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const storedPosition = await AsyncStorage.getItem(STORAGE_KEY_AI_POSITION);
        const storedPanelOpen = await AsyncStorage.getItem(STORAGE_KEY_AI_PANEL_OPEN);
        const storedConversationId = await AsyncStorage.getItem(STORAGE_KEY_AI_CONVERSATION_ID);

        if (storedPosition) {
          // Malformed stored position must not abort the rest of agent
          // initialization (panel state / conversation restore below).
          try {
            const parsed = JSON.parse(storedPosition);
            const clampedX = clamp(parsed?.x, minX, maxX);
            const clampedY = clamp(parsed?.y, minY, maxY);
            const next = { x: clampedX, y: clampedY };
            setPosition(next);
            translateX.value = clampedX;
            translateY.value = clampedY;
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEY_AI_POSITION);
          }
        }

        if (storedPanelOpen === "true") setIsOpen(true);

        if (storedConversationId) {
          setConversationId(storedConversationId);

          const restoredConversation = await safeLoadConversation(storedConversationId);
          if (restoredConversation?.messages?.length) {
            setMessages(
              restoredConversation.messages.map((m, index) => ({
                id: `restored-${index}-${m.role}`,
                role: m.role,
                text: m.content,
                createdAt: new Date().toISOString(),
              }))
            );
          } else {
            setConversationId(null);
            await AsyncStorage.removeItem(STORAGE_KEY_AI_CONVERSATION_ID);
            setMessages(DEFAULT_MESSAGES);
          }
        }
      } catch (err) {
        console.error("FloatingAIAgent initialize error:", err);
      }
    };

    initializeAgent();
    // Intentionally omit pathname so the floating agent maintains conversation and position state across screen navigation
  }, [windowDims.height, windowDims.width, minX, maxX, minY, maxY, translateX, translateY]);

  const savePosition = useCallback(async (next: { x: number; y: number }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AI_POSITION, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const savePanelState = useCallback(async (open: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AI_PANEL_OPEN, String(open));
    } catch {
      // ignore
    }
  }, []);

  const saveConversationId = useCallback(async (id: string | null) => {
    try {
      if (!id) {
        await AsyncStorage.removeItem(STORAGE_KEY_AI_CONVERSATION_ID);
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEY_AI_CONVERSATION_ID, id);
    } catch {
      // ignore
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      try {
        messagesScrollRef.current?.scrollToEnd({ animated: true });
      } catch {
        // ignore
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleNewConversation = useCallback(async () => {
    if (resetting) return;
    setResetting(true);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const currentId = conversationId?.trim() ? conversationId : null;
      if (currentId) {
        try {
          const newConversation = await resetConversation({
            conversationId: currentId,
          });
          if (newConversation?._id) {
            setConversationId(newConversation._id);
            await saveConversationId(newConversation._id);
          } else {
            setConversationId(null);
            await saveConversationId(null);
          }
        } catch (resetErr) {
          console.error("handleNewConversation: resetConversation failed", resetErr);
          appendMessage({
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            text: "Could not clear chat history. Please try again.",
            createdAt: new Date().toISOString(),
          });
          return;
        }
      }

      try {
        await clearAllAIData();
      } catch (storageErr) {
        console.error("handleNewConversation: clearAllAIData failed", storageErr);
      }

      setMessages(DEFAULT_MESSAGES);
      setDraft("");
      setSending(false);
      setCopySuccess(false);
      setAutoRecoveryAttempting(false);
    } finally {
      setResetting(false);
    }
  }, [appendMessage, conversationId, resetting, saveConversationId]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    savePanelState(false);
  }, [savePanelState]);

  // Android back button: close AI panel if open
  useEffect(() => {
    if (!isOpen) return;
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => backSub.remove();
  }, [isOpen, handleClose]);

  const handleTogglePanel = useCallback(() => {
    if (isDragging.current || hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    setIsOpen((prev) => {
      const next = !prev;
      savePanelState(next);
      if (!next) Keyboard.dismiss();
      return next;
    });
  }, [savePanelState]);

  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await Clipboard.setStringAsync(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    } catch {
      // ignore
    }
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    appendMessage(userMessage);
    setSending(true);

    const metadata = { screenContext, path: pathname };

    try {
      const safeConversationId = conversationId?.trim() ? conversationId : undefined;

      let response = await sendAIChatMessage({
        prompt: trimmed,
        conversationId: safeConversationId || undefined,
        metadata,
      });

      const assistantText = response?.messages?.slice(-1)?.[0]?.content;

      if (response?._id) {
        setConversationId(response._id);
        await saveConversationId(response._id);
      }

      appendMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text:
          typeof assistantText === "string" && assistantText.trim().length
            ? assistantText
            : "I'm sorry, I couldn't generate a response. Please try again.",
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      if (isConversationNotFoundError(err)) {
        if (!autoRecoveryAttempting) {
          setAutoRecoveryAttempting(true);
          try {
            await clearStoredConversationId();
            setConversationId(null);

            const newResponse = await sendAIChatMessage({
              prompt: trimmed,
              metadata,
            });

            if (newResponse?._id) {
              setConversationId(newResponse._id);
              await saveConversationId(newResponse._id);
            }

            const assistantText = newResponse?.messages?.slice(-1)?.[0]?.content;

            appendMessage({
              id: `assistant-${Date.now()}`,
              role: "assistant",
              text:
                typeof assistantText === "string" && assistantText.trim().length
                  ? assistantText
                  : "I'm sorry, I couldn't generate a response. Please try again.",
              createdAt: new Date().toISOString(),
            });

            return;
          } catch {
            // fall through to generic error message
          } finally {
            setAutoRecoveryAttempting(false);
          }
        }
      }

      const errorMessage = normalizeApiError(err);
      appendMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: errorMessage,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
      setAutoRecoveryAttempting(false);
    }
  }, [autoRecoveryAttempting, appendMessage, conversationId, draft, pathname, saveConversationId, sending, screenContext]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          isDragging.current = true;
          hasDragged.current = false;
          dragStartX.current = translateX.value;
          dragStartY.current = translateY.value;
        })
        .onUpdate((event) => {
          const dx = event.translationX;
          const dy = event.translationY;
          const totalDx = dragStartX.current + dx;
          const totalDy = dragStartY.current + dy;

          if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            hasDragged.current = true;
          }

          const clampedX = clamp(totalDx, minX, maxX);
          const clampedY = clamp(totalDy, minY, maxY);

          translateX.value = clampedX;
          translateY.value = clampedY;
          scale.value = interpolate(Math.abs(dx) + Math.abs(dy), [0, 100], [1, 1.08], Extrapolation.CLAMP);
          opacity.value = interpolate(Math.abs(dx) + Math.abs(dy), [0, 100], [1, 0.85], Extrapolation.CLAMP);
          shadowRadius.value = interpolate(Math.abs(dx) + Math.abs(dy), [0, 100], [16, 24], Extrapolation.CLAMP);
          shadowOpacity.value = interpolate(Math.abs(dx) + Math.abs(dy), [0, 100], [0.35, 0.5], Extrapolation.CLAMP);
          shadowOffsetY.value = interpolate(Math.abs(dx) + Math.abs(dy), [0, 100], [10, 16], Extrapolation.CLAMP);
        })
        .onEnd(() => {
          const nearestEdgeX = Math.round(translateX.value / windowDims.width) * windowDims.width - buttonSize - 12;
          const snappedX = nearestEdgeX < windowDims.width / 2 ? minX : maxX;

          translateX.value = withSpring(snappedX, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          translateY.value = withSpring(translateY.value, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          scale.value = withSpring(1, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          opacity.value = withSpring(1, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          shadowRadius.value = withSpring(16, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          shadowOpacity.value = withSpring(0.35, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });
          shadowOffsetY.value = withSpring(10, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          });

          runOnJS(savePosition)({ x: snappedX, y: translateY.value });
          runOnJS(setPosition)({ x: snappedX, y: translateY.value });

          setTimeout(() => {
            isDragging.current = false;
          }, 100);
        }),
    [minX, maxX, minY, maxY, translateX, translateY, scale, opacity, shadowRadius, shadowOpacity, shadowOffsetY, savePosition, windowDims.width, buttonSize]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: 1000,
    elevation: 1000,
    shadowRadius: shadowRadius.value,
    shadowOpacity: shadowOpacity.value,
    shadowOffset: { width: 0, height: shadowOffsetY.value },
  }));

  if (isHiddenRoute) return null;

  return (
      // pointerEvents must live in a StyleSheet.create style: react-native-web only
      // compiles the `box-none` polyfill (element pe:none + children pe:auto) for
      // registered styles. An inline `{ pointerEvents: "box-none" }` object is emitted
      // as raw CSS `pointer-events: box-none`, which browsers drop as invalid — the
      // overlay then has pe:auto and swallows every click on the page.
      <View style={styles.overlay}>
      {isOpen && <View style={styles.panelBackdrop} />}

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.floatingButtonContainer, animatedStyle]}>
                    <Pressable
            onPress={handleTogglePanel}
            style={styles.floatingButton}
            disabled={isDragging.current}
            accessibilityLabel={isOpen ? "Close AI legal assistant" : "Open AI legal assistant"}
            accessibilityRole="button"
            accessibilityHint="Opens the AI legal copilot chat"
            hitSlop={8}
          >
            <View style={styles.robotInner}>
              <Ionicons name="sparkles-outline" size={28} color={AI_BG} />
            </View>
            <View style={styles.pulseRing} />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      {isOpen && (
        <View style={styles.panelWrapper}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleWrap}>
              <Text style={styles.panelTitle}>Legal Copilot</Text>
              <Text style={styles.panelSubtitle}>{screenContext}</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton} accessibilityLabel="Close AI chat">
              <Ionicons name="close" size={18} color={AI_GOLD} />
            </Pressable>
          </View>

          <View style={styles.panelBody}>
            <ScrollView
              ref={(ref) => {
                messagesScrollRef.current = ref;
              }}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === "assistant" ? styles.assistantBubble : styles.userBubble,
                  ]}
                >
                  <Text style={styles.messageTimestamp}>
                    {formatTimestamp(message.createdAt)} • {message.role === "assistant" ? "Copilot" : "You"}
                  </Text>
                  {renderMarkdownLike(message.text)}

                  {message.role === "assistant" && (
                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => handleCopyMessage(message.text)}
                        style={styles.actionPill}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Copy AI response"
                        accessibilityHint="Copies this response to the clipboard"
                      >
                        <Ionicons name="copy-outline" size={14} color={AI_GOLD} />
                        <Text style={styles.actionText}>Copy</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}

              {(sending || autoRecoveryAttempting) && (
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <Text style={styles.messageTimestamp}>{formatTimestamp(new Date().toISOString())} • Copilot</Text>
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={AI_GOLD} />
                    <Text style={styles.loadingText}>Thinking…</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask the AI legal copilot..."
                placeholderTextColor={AI_TEXT_MUTED}
                value={draft}
                onChangeText={setDraft}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                multiline
                blurOnSubmit={false}
                autoCorrect
                accessibilityLabel="Ask the AI legal copilot"
                accessibilityHint="Type your legal question, then press send on the keyboard"
              />

              <Pressable
                style={[styles.sendButton, (sending || autoRecoveryAttempting) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={sending || autoRecoveryAttempting}
                accessibilityRole="button"
                accessibilityLabel={sending ? "Sending message" : "Send message"}
                accessibilityHint="Sends your question to the AI legal copilot"
                accessibilityState={{ disabled: sending || autoRecoveryAttempting, busy: sending }}
                hitSlop={8}
              >
                <Ionicons
                  name={sending || autoRecoveryAttempting ? "hourglass-outline" : "send"}
                  size={20}
                  color={AI_BG}
                />
              </Pressable>
            </View>

            <View style={styles.bottomActions}>
              <Pressable
                style={styles.secondaryAction}
                onPress={handleNewConversation}
                accessibilityRole="button"
                accessibilityLabel="Start new conversation"
                accessibilityHint="Clears the current chat and starts fresh"
                hitSlop={8}
              >
                <Ionicons name="refresh-outline" size={16} color={AI_GOLD} />
                <Text style={styles.secondaryActionText}>New conversation</Text>
              </Pressable>
              <Text style={styles.copyHint}>{copySuccess ? "Copied" : "Chat is stored per conversation"}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Must be declared in StyleSheet.create (see render comment above):
    // inline `box-none` is invalid CSS on web and blocks the whole app.
    pointerEvents: "box-none",
    zIndex: 999,
    elevation: 999,
  },
  panelBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    pointerEvents: "none",
  },
    floatingButtonContainer: {
    position: "absolute",
    width: 60,
    height: 60,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AI_GOLD,
    borderWidth: 1,
    borderColor: AI_BG,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    boxShadow: "0px 10px 16px rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  robotInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AI_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderColor: colors.border.goldLight,
    borderWidth: 1,
    top: -4,
    left: -4,
    opacity: 0.6,
  },

  panelWrapper: {
    position: "absolute",
    bottom: SHELL_TAB_BAR_MIN_HEIGHT + 88,
    right: 16,
    left: 16,
    maxHeight: "84%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(10, 10, 12, 0.96)",
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    boxShadow: "0px 16px 28px rgba(0,0,0,0.4)",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 18, 20, 0.85)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: AI_GOLD_LIGHT,
  },
  panelTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  panelTitle: {
    color: AI_TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  panelSubtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  panelBody: {
    padding: 14,
    backgroundColor: AI_BG,
  },

  messageList: {
    maxHeight: 340,
    marginBottom: 12,
  },
  messageListContent: {
    paddingBottom: 8,
  },

  messageBubble: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  assistantBubble: {
    backgroundColor: "rgba(24, 24, 28, 0.95)",
    borderColor: AI_GOLD_LIGHT,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignSelf: "flex-end",
  },

  messageTimestamp: {
    color: AI_TEXT_MUTED,
    fontSize: 10,
    marginBottom: 8,
    fontWeight: "600",
  },
  messageText: {
    color: AI_TEXT_PRIMARY,
    fontSize: 12,
    lineHeight: 20,
  },
  codeBlockText: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: AI_GOLD,
    fontFamily: "monospace",
    fontSize: 12,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.border.goldLight,
  },
  actionText: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 16,
    backgroundColor: AI_CARD_BG,
    color: AI_TEXT_PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: AI_GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },

  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.border.goldLight,
  },
  secondaryActionText: {
    color: AI_TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: "700",
  },
  copyHint: {
    color: AI_TEXT_MUTED,
    fontSize: 12,
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
  },
});