"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@largence/components/ui/skeleton";
import { ScrollArea } from "@largence/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@largence/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@largence/components/ui/popover";
import { Label } from "@largence/components/ui/label";
import { Textarea } from "@largence/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Hash,
  Lock,
  Plus,
  Search,
  Send,
  MoreHorizontal,
  Users,
  Settings,
  Trash2,
  Edit,
  MessageSquare,
  AtSign,
  Smile,
  FileText,
  Reply,
  X,
  Loader2,
  UserPlus,
  LogOut,
  Volume2,
  VolumeX,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@largence/lib/utils";
import {
  useNotificationSound,
  useMessageNotifications,
} from "@/hooks/use-notification-sound";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@largence/components/ui/tooltip";

// Common emoji list
const EMOJI_LIST = [
  "👍", "👎", "❤️", "😂", "😮", "😢", "🎉", "🔥",
  "✅", "❌", "👀", "🙌", "💯", "🚀", "💡", "⭐",
  "👏", "🤔", "😊", "😎", "🙏", "💪", "🎯", "✨",
];

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE" | "DIRECT" | "DOCUMENT" | "MATTER";
  createdByUserId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  isMember: boolean;
  lastMessage: Message | null;
  members?: ChannelMember[];
  _count: {
    members: number;
    messages: number;
  };
}

interface ChannelMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isMuted: boolean;
  lastReadAt: string | null;
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  type: "TEXT" | "DOCUMENT_SHARE" | "MATTER_UPDATE" | "SYSTEM";
  attachments: any[] | null;
  documentId: string | null;
  matterId: string | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  parentId: string | null;
  replyCount: number;
  reactions: { emoji: string; userIds: string[] }[] | null;
  mentionedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    replies: number;
  };
}

interface OrgMember {
  id: string;
  role: string;
  publicUserData: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    identifier: string;
    userId: string;
  };
}

interface Document {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { organization, memberships } = useOrganization({
    memberships: { infinite: true },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Notification sound hook
  const { isEnabled: isSoundEnabled, toggleSound } = useNotificationSound();

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    searchParams.get("channelId")
  );
  const [messageInput, setMessageInput] = useState("");
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isShareDocOpen, setIsShareDocOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [newChannelType, setNewChannelType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelDescription, setEditChannelDescription] = useState("");

  // Get org members for mentions and invites
  const orgMembers = (memberships?.data || []).map((m: any) => ({
    id: m.id,
    visage: m.id,
    role: m.role,
    publicUserData: {
      firstName: m.publicUserData?.firstName || null,
      lastName: m.publicUserData?.lastName || null,
      imageUrl: m.publicUserData?.imageUrl || "",
      identifier: m.publicUserData?.identifier || "",
      userId: m.publicUserData?.userId || m.id,
    },
  }));

  // Fetch channels
  const { data: channelsData, isLoading: loadingChannels } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const response = await fetch("/api/channels");
      if (!response.ok) throw new Error("Failed to fetch channels");
      return response.json();
    },
  });

  const channels: Channel[] = channelsData?.channels || [];
  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  // Fetch messages for selected channel
  const {
    data: messagesData,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return { messages: [] };
      const response = await fetch(`/api/channels/${selectedChannelId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!selectedChannelId,
    refetchInterval: 5000,
  });

  // Fetch documents for sharing
  const { data: documentsData } = useQuery({
    queryKey: ["documents-for-share"],
    queryFn: async () => {
      const response = await fetch("/api/documents?limit=50");
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: isShareDocOpen,
  });

  const documents: Document[] = documentsData?.documents || [];
  const messages: Message[] = messagesData?.messages || [];

  // Use message notification hook to play sound on new messages
  useMessageNotifications(messages, user?.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update URL when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      router.replace(`/messages?channelId=${selectedChannelId}`, { scroll: false });
    }
  }, [selectedChannelId, router]);

  // Set edit channel values when settings open
  useEffect(() => {
    if (isSettingsOpen && selectedChannel) {
      setEditChannelName(selectedChannel.name);
      setEditChannelDescription(selectedChannel.description || "");
    }
  }, [isSettingsOpen, selectedChannel]);

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; type: string; memberUserIds?: string[] }) => {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create channel");
      return response.json();
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setSelectedChannelId(channel.id);
      setIsCreateChannelOpen(false);
      setNewChannelName("");
      setNewChannelDescription("");
      setSelectedMembers([]);
      toast.success("Channel created");
    },
    onError: () => {
      toast.error("Failed to create channel");
    },
  });

  // Update channel mutation
  const updateChannelMutation = useMutation({
    mutationFn: async (data: { name?: string; description?: string; isArchived?: boolean }) => {
      const response = await fetch(`/api/channels/${selectedChannelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setIsSettingsOpen(false);
      toast.success("Channel updated");
    },
    onError: () => {
      toast.error("Failed to update channel");
    },
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/channels/${selectedChannelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setSelectedChannelId(null);
      setIsSettingsOpen(false);
      toast.success("Channel deleted");
    },
    onError: () => {
      toast.error("Failed to delete channel");
    },
  });

  // Add members mutation
  const addMembersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await fetch(`/api/channels/${selectedChannelId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      if (!response.ok) throw new Error("Failed to add members");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setIsInviteOpen(false);
      setSelectedMembers([]);
      toast.success("Members added");
    },
    onError: () => {
      toast.error("Failed to add members");
    },
  });

  // Leave channel mutation
  const leaveChannelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/channels/${selectedChannelId}/members`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to leave channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setSelectedChannelId(null);
      toast.success("Left channel");
    },
    onError: () => {
      toast.error("Failed to leave channel");
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      type?: string;
      parentId?: string;
      documentId?: string;
      mentionedUserIds?: string[];
      userName: string;
      userAvatar?: string;
    }) => {
      const response = await fetch(`/api/channels/${selectedChannelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      setReplyingTo(null);
      refetchMessages();
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const response = await fetch(
        `/api/channels/${selectedChannelId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (!response.ok) throw new Error("Failed to edit message");
      return response.json();
    },
    onSuccess: () => {
      setEditingMessage(null);
      setEditContent("");
      refetchMessages();
      toast.success("Message edited");
    },
    onError: () => {
      toast.error("Failed to edit message");
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(
        `/api/channels/${selectedChannelId}/messages/${messageId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete message");
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
      toast.success("Message deleted");
    },
    onError: () => {
      toast.error("Failed to delete message");
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const message = messages.find((m) => m.id === messageId);
      const reactions = message?.reactions || [];
      const existingReaction = reactions.find((r) => r.emoji === emoji);

      let newReactions;
      if (existingReaction) {
        if (existingReaction.userIds.includes(user?.id || "")) {
          // Remove user from reaction
          newReactions = reactions.map((r) =>
            r.emoji === emoji
              ? { ...r, userIds: r.userIds.filter((id) => id !== user?.id) }
              : r
          ).filter((r) => r.userIds.length > 0);
        } else {
          // Add user to existing reaction
          newReactions = reactions.map((r) =>
            r.emoji === emoji
              ? { ...r, userIds: [...r.userIds, user?.id || ""] }
              : r
          );
        }
      } else {
        // Add new reaction
        newReactions = [...reactions, { emoji, userIds: [user?.id || ""] }];
      }

      const response = await fetch(
        `/api/channels/${selectedChannelId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactions: newReactions }),
        }
      );
      if (!response.ok) throw new Error("Failed to add reaction");
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Extract mentions from message
  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[2]); // User ID
    }
    return mentions;
  }, []);

  // Handle message input change with mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Check for @ symbol to trigger mentions
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("[")) {
        setShowMentions(true);
        setMentionQuery(textAfterAt.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention into message
  const insertMention = (member: OrgMember) => {
    const name = member.publicUserData.firstName
      ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
      : member.publicUserData.identifier;
    const lastAtIndex = messageInput.lastIndexOf("@");
    const newMessage =
      messageInput.slice(0, lastAtIndex) + `@[${name.trim()}](${member.publicUserData.userId}) `;
    setMessageInput(newMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannelId) return;

    const mentionedUserIds = extractMentions(messageInput);
    // Convert mention format for display
    const displayContent = messageInput.replace(
      /@\[([^\]]+)\]\([^)]+\)/g,
      "@$1"
    );

    sendMessageMutation.mutate({
      content: displayContent,
      parentId: replyingTo?.id,
      mentionedUserIds,
      userName: user?.fullName || user?.username || "Unknown User",
      userAvatar: user?.imageUrl,
    });
  };

  // Handle share document
  const handleShareDocument = (doc: Document) => {
    if (!selectedChannelId) return;

    sendMessageMutation.mutate({
      content: `Shared document: **${doc.title}**`,
      type: "DOCUMENT_SHARE",
      documentId: doc.id,
      userName: user?.fullName || user?.username || "Unknown User",
      userAvatar: user?.imageUrl,
    });
    setIsShareDocOpen(false);
    toast.success("Document shared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === "Escape") {
      setShowMentions(false);
      setReplyingTo(null);
    }
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, "h:mm a");
    }
    if (isYesterday(d)) {
      return `Yesterday at ${format(d, "h:mm a")}`;
    }
    return format(d, "MMM d, h:mm a");
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = orgMembers.filter((member: OrgMember) => {
    const name = member.publicUserData.firstName
      ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
      : member.publicUserData.identifier;
    return name.toLowerCase().includes(mentionQuery);
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "PRIVATE":
      case "DIRECT":
        return <Lock className="h-4 w-4" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const renderMessageContent = (content: string, type: string, documentId?: string | null) => {
    if (type === "DOCUMENT_SHARE" && documentId) {
      return (
        <div
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => router.push(`/documents/${documentId}`)}
        >
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm">{content.replace("Shared document: ", "").replace(/\*\*/g, "")}</span>
        </div>
      );
    }
    // Highlight mentions
    const highlightedContent = content.replace(
      /@([^\s]+)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );
    return (
      <p
        className="text-sm text-foreground/90 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Channel List */}
      <div className="w-64 border-r bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Messages</h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsCreateChannelOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs rounded-sm"
            />
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {loadingChannels ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))
            ) : filteredChannels.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No channels found
              </p>
            ) : (
              filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-sm text-left hover:bg-muted/50 transition-colors",
                    selectedChannelId === channel.id && "bg-muted"
                  )}
                >
                  <span className="text-muted-foreground">
                    {getChannelIcon(channel.type)}
                  </span>
                  <span className="flex-1 truncate text-sm">{channel.name}</span>
                  {channel.unreadCount > 0 && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {getChannelIcon(selectedChannel.type)}
                </span>
                <span className="font-medium">{selectedChannel.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedChannel._count.members} members
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleSound}
                  title={isSoundEnabled ? "Mute notifications" : "Unmute notifications"}
                >
                  {isSoundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMembersOpen(true)}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsInviteOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Channel Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsShareDocOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Share Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm("Are you sure you want to leave this channel?")) {
                          leaveChannelMutation.mutate();
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Channel
                    </DropdownMenuItem>
                    {selectedChannel.createdByUserId === user?.id && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this channel? This cannot be undone.")) {
                              deleteChannelMutation.mutate();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Channel
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full max-w-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to send a message!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "group flex items-start gap-3",
                        message.type === "SYSTEM" && "justify-center"
                      )}
                    >
                      {message.type === "SYSTEM" ? (
                        <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.userAvatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {message.userName?.slice(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {message.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.isEdited && (
                                <span className="text-[10px] text-muted-foreground">
                                  (edited)
                                </span>
                              )}
                            </div>
                            {editingMessage?.id === message.id ? (
                              <div className="mt-1 flex gap-2">
                                <Input
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() =>
                                    editMessageMutation.mutate({
                                      messageId: message.id,
                                      content: editContent,
                                    })
                                  }
                                  disabled={editMessageMutation.isPending}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => {
                                    setEditingMessage(null);
                                    setEditContent("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              renderMessageContent(message.content, message.type, message.documentId)
                            )}

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction) => (
                                  <button
                                    key={reaction.emoji}
                                    onClick={() =>
                                      addReactionMutation.mutate({
                                        messageId: message.id,
                                        emoji: reaction.emoji,
                                      })
                                    }
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                                      reaction.userIds.includes(user?.id || "")
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-muted/50 border-transparent hover:border-muted-foreground/20"
                                    )}
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-muted-foreground">{reaction.userIds.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {message.replyCount > 0 && (
                              <button className="text-xs text-primary mt-1 hover:underline">
                                {message.replyCount} replies
                              </button>
                            )}
                          </div>

                          {/* Message Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                            {/* Emoji Picker */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Smile className="h-3.5 w-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2" align="end">
                                <div className="grid grid-cols-8 gap-1">
                                  {EMOJI_LIST.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() =>
                                        addReactionMutation.mutate({
                                          messageId: message.id,
                                          emoji,
                                        })
                                      }
                                      className="p-1.5 hover:bg-muted rounded text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="h-3.5 w-3.5" />
                            </Button>
                            {message.userId === user?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setEditContent(message.content);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => {
                                    if (confirm("Delete this message?")) {
                                      deleteMessageMutation.mutate(message.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-sm text-sm">
                  <Reply className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Replying to{" "}
                    <span className="font-medium">{replyingTo.userName}</span>
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">
                    {replyingTo.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Mentions Popup */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="mb-2 border rounded-sm bg-card shadow-lg max-h-48 overflow-y-auto">
                  {filteredMembers.slice(0, 8).map((member: OrgMember) => (
                    <button
                      key={member.publicUserData.userId}
                      onClick={() => insertMention(member)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 text-left"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.publicUserData.imageUrl} />
                        <AvatarFallback className="text-[10px]">
                          {(member.publicUserData.firstName?.[0] || member.publicUserData.identifier[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {member.publicUserData.firstName
                          ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
                          : member.publicUserData.identifier}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={inputRef}
                    placeholder={`Message #${selectedChannel.name} (use @ to mention)`}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="min-h-10 max-h-32 resize-none pr-24 text-sm rounded-sm"
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsShareDocOpen(true)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" align="end">
                        <div className="grid grid-cols-8 gap-1">
                          {EMOJI_LIST.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setMessageInput((prev) => prev + emoji);
                                inputRef.current?.focus();
                              }}
                              className="p-1.5 hover:bg-muted rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setMessageInput((prev) => prev + "@");
                        setShowMentions(true);
                        setMentionQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-sm"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Hash className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-medium">Select a channel</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a channel from the sidebar or create a new one
            </p>
            <Button onClick={() => setIsCreateChannelOpen(true)} className="rounded-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </div>
        )}
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your team to communicate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channelName">Channel Name</Label>
              <Input
                id="channelName"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., general, project-alpha"
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelDescription">Description (optional)</Label>
              <Textarea
                id="channelDescription"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What's this channel about?"
                rows={2}
                className="rounded-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Channel Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={newChannelType === "PUBLIC" ? "default" : "outline"}
                  className="flex-1 rounded-sm"
                  onClick={() => setNewChannelType("PUBLIC")}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Public
                </Button>
                <Button
                  variant={newChannelType === "PRIVATE" ? "default" : "outline"}
                  className="flex-1 rounded-sm"
                  onClick={() => setNewChannelType("PRIVATE")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Private
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newChannelType === "PUBLIC"
                  ? "Anyone in your organization can see and join"
                  : "Only invited members can see and access"}
              </p>
            </div>

            {/* Invite Members on Creation */}
            {newChannelType === "PRIVATE" && orgMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Invite Members</Label>
                <ScrollArea className="h-32 border rounded-sm p-2">
                  {orgMembers.map((member: OrgMember) => (
                    <label
                      key={member.publicUserData.userId}
                      className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedMembers.includes(member.publicUserData.userId)}
                        onCheckedChange={(checked: boolean | "indeterminate") => {
                          if (checked === true) {
                            setSelectedMembers([...selectedMembers, member.publicUserData.userId]);
                          } else {
                            setSelectedMembers(selectedMembers.filter((id) => id !== member.publicUserData.userId));
                          }
                        }}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.publicUserData.imageUrl} />
                        <AvatarFallback className="text-[10px]">
                          {(member.publicUserData.firstName?.[0] || member.publicUserData.identifier[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {member.publicUserData.firstName
                          ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
                          : member.publicUserData.identifier}
                      </span>
                    </label>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateChannelOpen(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                createChannelMutation.mutate({
                  name: newChannelName,
                  description: newChannelDescription,
                  type: newChannelType,
                  memberUserIds: selectedMembers,
                })
              }
              disabled={!newChannelName.trim() || createChannelMutation.isPending}
              className="rounded-sm"
            >
              {createChannelMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
            <DialogDescription>
              Update channel name, description, or delete it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editChannelName">Channel Name</Label>
              <Input
                id="editChannelName"
                value={editChannelName}
                onChange={(e) => setEditChannelName(e.target.value)}
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editChannelDescription">Description</Label>
              <Textarea
                id="editChannelDescription"
                value={editChannelDescription}
                onChange={(e) => setEditChannelDescription(e.target.value)}
                rows={2}
                className="rounded-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedChannel?.createdByUserId === user?.id && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this channel?")) {
                    deleteChannelMutation.mutate();
                  }
                }}
                className="rounded-sm sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Channel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                updateChannelMutation.mutate({
                  name: editChannelName,
                  description: editChannelDescription,
                })
              }
              disabled={updateChannelMutation.isPending}
              className="rounded-sm"
            >
              {updateChannelMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Members Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Add team members to #{selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-64 border rounded-sm p-2">
              {orgMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members found
                </p>
              ) : (
                orgMembers.map((member: OrgMember) => (
                  <label
                    key={member.publicUserData.userId}
                    className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.publicUserData.userId)}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        if (checked === true) {
                          setSelectedMembers([...selectedMembers, member.publicUserData.userId]);
                        } else {
                          setSelectedMembers(selectedMembers.filter((id) => id !== member.publicUserData.userId));
                        }
                      }}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.publicUserData.imageUrl} />
                      <AvatarFallback className="text-[10px]">
                        {(member.publicUserData.firstName?.[0] || member.publicUserData.identifier[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1">
                      {member.publicUserData.firstName
                        ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
                        : member.publicUserData.identifier}
                    </span>
                  </label>
                ))
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInviteOpen(false);
                setSelectedMembers([]);
              }}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addMembersMutation.mutate(selectedMembers)}
              disabled={selectedMembers.length === 0 || addMembersMutation.isPending}
              className="rounded-sm"
            >
              {addMembersMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Channel Members</DialogTitle>
            <DialogDescription>
              {selectedChannel?._count.members} members in #{selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-64 border rounded-sm p-2">
              {orgMembers.map((member: OrgMember) => (
                <div
                  key={member.publicUserData.userId}
                  className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.publicUserData.imageUrl} />
                    <AvatarFallback className="text-xs">
                      {(member.publicUserData.firstName?.[0] || member.publicUserData.identifier[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.publicUserData.firstName
                        ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ""}`
                        : member.publicUserData.identifier}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.publicUserData.identifier}
                    </p>
                  </div>
                  {member.publicUserData.userId === selectedChannel?.createdByUserId && (
                    <Badge variant="secondary" className="text-[10px]">Owner</Badge>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMembersOpen(false)}
              className="rounded-sm"
            >
              Close
            </Button>
            <Button onClick={() => { setIsMembersOpen(false); setIsInviteOpen(true); }} className="rounded-sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite More
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Document Dialog */}
      <Dialog open={isShareDocOpen} onOpenChange={setIsShareDocOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share a document with the channel
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-64 border rounded-sm">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No documents found</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleShareDocument(doc)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0 text-left"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {doc.status}
                    </Badge>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareDocOpen(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <div className="w-64 border-r bg-card/50 p-3">
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
