"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// Notification sound settings key
const NOTIFICATION_SOUND_KEY = "largence:notification-sound-enabled";

// Default notification sound (base64 encoded short beep sound)
// This is a simple notification sound that works without external files
const DEFAULT_NOTIFICATION_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+NAwAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+NAwHsAAADSAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

export interface NotificationSoundOptions {
  volume?: number; // 0 to 1
  playOnce?: boolean; // Only play once per batch of notifications
}

export function useNotificationSound(options: NotificationSoundOptions = {}) {
  const { volume = 0.5, playOnce = true } = options;
  const { user, isLoaded } = useUser();
  
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const cooldownMs = 2000; // Minimum 2 seconds between sounds

  // Load initial state from localStorage or user metadata
  useEffect(() => {
    if (!isLoaded) return;

    const loadSettings = async () => {
      // Check localStorage first for immediate response
      const localSetting = localStorage.getItem(NOTIFICATION_SOUND_KEY);
      if (localSetting !== null) {
        setIsEnabled(localSetting === "true");
        return;
      }

      // Check user metadata
      if (user) {
        const metadata = (user.unsafeMetadata as Record<string, any>) || {};
        const userSetting = metadata.notificationSoundEnabled;
        if (userSetting !== undefined) {
          setIsEnabled(userSetting);
          localStorage.setItem(NOTIFICATION_SOUND_KEY, String(userSetting));
          return;
        }
      }

      // Default to enabled
      setIsEnabled(true);
      localStorage.setItem(NOTIFICATION_SOUND_KEY, "true");
    };

    loadSettings();
  }, [isLoaded, user]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(DEFAULT_NOTIFICATION_SOUND);
    audio.volume = volume;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [volume]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!isEnabled || !audioRef.current) return;

    const now = Date.now();
    if (playOnce && now - lastPlayedRef.current < cooldownMs) {
      return; // Still in cooldown period
    }

    lastPlayedRef.current = now;
    
    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
      // Autoplay might be blocked by browser
      console.log("Could not play notification sound:", error);
    });
  }, [isEnabled, playOnce]);

  // Toggle notification sound
  const toggleSound = useCallback(async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem(NOTIFICATION_SOUND_KEY, String(newValue));

    // Also save to user metadata for persistence
    if (user) {
      try {
        const metadata = (user.unsafeMetadata as Record<string, any>) || {};
        await user.update({
          unsafeMetadata: {
            ...metadata,
            notificationSoundEnabled: newValue,
          },
        });
      } catch (error) {
        console.error("Failed to save notification sound setting:", error);
      }
    }
  }, [isEnabled, user]);

  // Set enabled state explicitly
  const setEnabled = useCallback(async (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem(NOTIFICATION_SOUND_KEY, String(enabled));

    if (user) {
      try {
        const metadata = (user.unsafeMetadata as Record<string, any>) || {};
        await user.update({
          unsafeMetadata: {
            ...metadata,
            notificationSoundEnabled: enabled,
          },
        });
      } catch (error) {
        console.error("Failed to save notification sound setting:", error);
      }
    }
  }, [user]);

  return {
    isEnabled: isEnabled ?? true,
    playSound,
    toggleSound,
    setEnabled,
  };
}

// Hook to track new messages and play sound
export function useMessageNotifications(
  messages: any[],
  currentUserId: string | undefined | null
) {
  const { playSound, isEnabled } = useNotificationSound();
  const previousMessagesRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!currentUserId || messages.length === 0) return;

    // Skip sound on initial load
    if (initialLoadRef.current) {
      // Store initial message IDs
      previousMessagesRef.current = new Set(messages.map((m) => m.id));
      initialLoadRef.current = false;
      return;
    }

    // Check for new messages (not from current user)
    const currentMessageIds = new Set(messages.map((m) => m.id));
    const newMessages = messages.filter(
      (m) =>
        !previousMessagesRef.current.has(m.id) &&
        m.userId !== currentUserId
    );

    // If there are new messages from other users, play sound
    if (newMessages.length > 0 && isEnabled) {
      playSound();
    }

    // Update previous messages
    previousMessagesRef.current = currentMessageIds;
  }, [messages, currentUserId, playSound, isEnabled]);
}
