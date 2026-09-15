import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAuthToken } from "@/services/api";
import { getAIConversationById, sendAIChatMessage } from "../services/backendAI";
import { parseValidDate } from "@/utils/dateUtils";
import {
  AI_BG,
  AI_CARD_BG,
  AI_GOLD,
  AI_GOLD_LIGHT,
  AI_TEXT_MUTED,
  AI_TEXT_PRIMARY,
  AI_TEXT_SECONDARY,
} from "../constants";

const STORAGE_KEY_AI_POSITION = "@lawyer2lawyer/ai_agent_position";
const STORAGE_KEY_AI_PANEL_OPEN = "@lawyer2lawyer/ai_agent_panel_open";
const DEFAULT_POSITION = { x: 16, y: 160 };
const HIDDEN_ROUTES = ["/login", "/register"];

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    text: "Hello \uD83D\uDC4B\n\nHow can I assist you with your legal research today?",
    createdAt: new Date().toISOString(),
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatTimestamp = (iso: string) => {
  const parsed = parseValidDate(iso);
  return parsed
    ? parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
};

const getScreenContext = (pathname: string) => {
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
};

const renderMarkdown = (text: string) => {
  const codeBlockPattern = /```([\s\S]*?)```/g;
  const parts = text.split(codeBlockPattern);

  return parts.map((part, index) => {
    const isCode = index % 2 === 1;
    return (
      <Text
        key={`${part}-${index}`}
        style={isCode ? styles.codeBlockText : styles.messageText}
      >
        {part}
      </Text>
    );
  });
};

const FloatingAIAgent: React.FC = () => {
  const pathname = usePathname();
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const floatY = useRef(new Animated.Value(0)).current;
  const window = Dimensions.get("window");
  const panStart = useRef({ x: 0, y: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const isHiddenRoute = useMemo(
    () => HIDDEN_ROUTES.some((route) => pathname?.startsWith(route)),
    [pathname]
  );

  const screenContext = useMemo(() => getScreenContext(pathname || ""), [pathname]);

  useEffect(() => {
    let cancelled = false;

    const initializeAgent = async () => {
      try {
        // If the component unmounts while awaiting, avoid setting state.
        if (cancelled) return;

        const storedPosition = await AsyncStorage.getItem(STORAGE_KEY_AI_POSITION);
        const storedPanelOpen = await AsyncStorage.getItem(STORAGE_KEY_AI_PANEL_OPEN);
        const storedConversationId = await AsyncStorage.getItem(
          "@lawyer2lawyer/ai_conversation_id"
        );

        // getAuthToken may throw if storage/network is unavailable.
        const token = await getAuthToken().catch(() => null);

        if (cancelled) return;

        if (storedPosition) {
          try {
            const parsed = JSON.parse(storedPosition) as { x?: number; y?: number };
            setPosition({
              x: clamp(
                Number(parsed?.x ?? DEFAULT_POSITION.x),
                12,
                Math.max(12, window.width - 88)
              ),
              y: clamp(
                Number(parsed?.y ?? DEFAULT_POSITION.y),
                80,
                Math.max(80, window.height - 260)
              ),
            });
          } catch {
            // Ignore corrupt AsyncStorage payload.
          }
        }

        if (storedPanelOpen === "true") {
          setIsOpen(true);
        }

        if (storedConversationId) {
          setConversationId(storedConversationId);
          try {
            const restoredConversation = await getAIConversationById(
              storedConversationId
            );

            const rawMessages = Array.isArray(restoredConversation?.messages)
              ? restoredConversation.messages
              : [];

            if (rawMessages.length) {
              setMessages(
                rawMessages.map((message: any, index: number) => {
                  const role = (message?.role ?? "assistant") as ChatRole;
                  const content = message?.content;
                  return {
                    id: `restored-${index}-${String(role)}`,
                    role,
                    text:
                      typeof content === "string" ? content : String(content ?? ""),
                    createdAt: new Date().toISOString(),
                  };
                })
              );
            }
          } catch {
            // Ignore if conversation cannot be restored; continue with new session.
          }
        }

        setIsAuthenticated(!!token);
      } catch {
        // Never let AI init crash the dashboard.
        if (!cancelled) setIsAuthenticated(false);
      }
    };

    initializeAgent();

    return () => {
      cancelled = true;
    };
  }, [pathname]);


  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -4,
          duration: 1800,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(floatY, {
          toValue: 2,
          duration: 1800,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatY]);

  const savePosition = useCallback(async (next: { x: number; y: number }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AI_POSITION, JSON.stringify(next));
    } catch {
      // ignore storage failure
    }
  }, []);

  const savePanelState = useCallback(async (open: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AI_PANEL_OPEN, String(open));
    } catch {
      // ignore storage failure
    }
  }, []);

  const saveConversationId = useCallback(async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem("@lawyer2lawyer/ai_conversation_id", id);
      } else {
        await AsyncStorage.removeItem("@lawyer2lawyer/ai_conversation_id");
      }
    } catch {
      // ignore storage failure
    }
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          panStart.current = position;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = clamp(
            panStart.current.x + gestureState.dx,
            12,
            window.width - 88
          );
          const nextY = clamp(
            panStart.current.y + gestureState.dy,
            80,
            window.height - 240,
          );
          setPosition({ x: nextX, y: nextY });
        },
        onPanResponderRelease: () => savePosition(position),
      }),
    [position, savePosition, window.height, window.width]
  );

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = useCallback(async () => {
    if (!draft.trim()) return;

    // Abort any existing in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    appendMessage(userMessage);
    setSending(true);

    try {
      const response = await sendAIChatMessage({
        prompt: draft.trim(),
        conversationId: conversationId || undefined,
        metadata: { screenContext, path: pathname },
      });

      // If aborted, discard the response
      if (abortController.signal.aborted) return;

      const assistantText = response?.messages?.slice(-1)?.[0]?.content ??
        "I'm sorry, I couldn't generate a response. Please try again.";

      const assistantResponse: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: assistantText,
        createdAt: new Date().toISOString(),
      };

      if (response?._id) {
        setConversationId(response._id);
        await saveConversationId(response._id);
      }

      appendMessage(assistantResponse);
    } catch (error) {
      // If the request was aborted intentionally, do not show an error
      if (abortController.signal.aborted) return;

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to reach the AI service. Please try again.";
      appendMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: errorMessage,
        createdAt: new Date().toISOString(),
      });
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setSending(false);
    }
  }, [appendMessage, conversationId, draft, pathname, screenContext, saveConversationId]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    savePanelState(false);
  }, [savePanelState]);

  const handleTogglePanel = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      savePanelState(next);
      return next;
    });
  }, [savePanelState]);

  const handleLoginRequired = useCallback(() => {
    // Avoid showing backend errors for unauthenticated users.
    // Floating copilot remains draggable, but the panel will not send requests.
    setSending(false);
    appendMessage({
      id: `assistant-login-${Date.now()}`,
      role: "assistant",
      text: "Please login to use the Legal Copilot.",
      createdAt: new Date().toISOString(),
    });
  }, [appendMessage]);

  const handleCopyMessage = useCallback(async (content: string) => {

    try {
      await Clipboard.setStringAsync(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    } catch {
      // ignore copy failure
    }
  }, []);


  const handleShareMessage = useCallback(async (content: string) => {
    try {
      await Share.share({ message: content });
    } catch {
      // ignore share failure
    }
  }, []);

  const handleNewConversation = useCallback(() => {
    Alert.alert(
      "Start New Conversation?",
      "This will clear the current chat history and begin a new AI conversation.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New Chat",
          style: "destructive",
          onPress: async () => {
            // Cancel any active request first
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
              abortControllerRef.current = null;
            }

            // Reset all state atomically
            try {
              await saveConversationId(null);
              setConversationId(null);
              setMessages(DEFAULT_MESSAGES);
              setDraft("");
              setSending(false);
              setCopySuccess(false);
            } catch (storageError) {
              // If clearing storage fails, keep the existing conversation intact
              // and show a user-friendly error message
              appendMessage({
                id: `assistant-error-${Date.now()}`,
                role: "assistant",
                text: "Could not clear chat history. Please try again.",
                createdAt: new Date().toISOString(),
              });
              console.error("Failed to clear conversation from storage:", storageError);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [appendMessage, saveConversationId]);

  if (!isAuthenticated || isHiddenRoute) {
    return null;
  }

  return (
    <View style={[styles.overlay, { pointerEvents: isOpen ? "auto" : "none" }]}>
      {isOpen && (
        <View style={[styles.panelBackdrop, { pointerEvents: "none" }]} />
      )}
      <Animated.View
        style={[
          styles.floatingButtonContainer,
          {
            transform: [{ translateY: floatY }],
            top: position.y,
            left: position.x,
          },
        ]}
        {...panResponder.panHandlers}
      >
<Pressable onPress={handleTogglePanel} style={styles.floatingButton}>
          <View style={styles.robotInner}>
            <Ionicons name="chatbubble-outline" size={28} color={AI_BG} />
          </View>
          <View style={styles.pulseRing} />
        </Pressable>
      </Animated.View>

      {isOpen && (
        <View style={styles.panelWrapper}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleWrap}>
              <Text style={styles.panelTitle}>Legal Copilot</Text>
              <Text style={styles.panelSubtitle}>{screenContext}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={handleNewConversation}
                style={styles.refreshButton}
                accessibilityLabel="Start new conversation"
              >
                <Ionicons name="refresh-outline" size={18} color={AI_GOLD} />
              </Pressable>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={AI_GOLD} />
              </Pressable>
            </View>
          </View>

          <View style={styles.panelBody}>
            <ScrollView
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
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
                  {renderMarkdown(message.text)}
                  {message.role === "assistant" && (
                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => handleCopyMessage(message.text)}
                        style={styles.actionPill}
                      >
                        <Ionicons name="copy-outline" size={14} color={AI_GOLD} />
                        <Text style={styles.actionText}>Copy</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleShareMessage(message.text)}
                        style={styles.actionPill}
                      >
                        <Ionicons name="share-social-outline" size={14} color={AI_GOLD} />
                        <Text style={styles.actionText}>Share</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
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
              />
              <Pressable
                style={[styles.sendButton, sending ? styles.sendButtonDisabled : null]}
                onPress={handleSend}
                disabled={sending}
              >
                <Ionicons
                  name={sending ? "hourglass-outline" : "send"}
                  size={20}
                  color={AI_BG}
                />
              </Pressable>
            </View>

            <View style={styles.bottomActions}>
              <Pressable style={styles.secondaryAction} onPress={handleNewConversation}>
                <Ionicons name="refresh-outline" size={16} color={AI_GOLD} />
                <Text style={styles.secondaryActionText}>New conversation</Text>
              </Pressable>
              <Text style={styles.copyHint}>
                {copySuccess ? "Copied to clipboard" : "Drag the robot anywhere; tap to expand."}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },
  panelBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  floatingButtonContainer: {
    position: "absolute",
    width: 72,
    height: 72,
    zIndex: 1000,
  },
  floatingButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AI_GOLD,
    borderWidth: 1,
    borderColor: AI_BG,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    boxShadow: "0px 10px 16px rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  robotInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AI_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderColor: colors.border.goldLight,
    borderWidth: 1,
    top: -6,
    left: -6,
  },
  panelWrapper: {
    position: "absolute",
    bottom: 24,
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
    elevation: 8,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    fontSize: 12,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 16,
    backgroundColor: AI_CARD_BG,
    color: AI_TEXT_PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
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
    paddingVertical: 10,
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
  },
});

export default FloatingAIAgent;

