"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  X,
  FileText,
  AlertTriangle,
  Info,
  CheckCheck,
  Clock,
  Share2,
  Pen,
  Users,
  Mail,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Button } from "@largence/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@largence/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  documentId?: string;
  complianceId?: string;
  actionUrl?: string;
  createdAt: string;
}

export function NotificationDrawer() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when drawer opens
  useEffect(() => {
    if (open) {
      fetchNotifications(true);
    }
  }, [open, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COMPLIANCE_COMPLETED":
        return <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "COMPLIANCE_FAILED":
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "DOCUMENT_SHARED":
        return <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "DOCUMENT_CREATED":
      case "DOCUMENT_UPDATED":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "SIGNATURE_REQUEST":
        return <Pen className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "TEAM_INVITE":
        return <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "SYSTEM_ALERT":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "COMPLIANCE_COMPLETED":
        return "bg-green-50 dark:bg-green-950/30";
      case "COMPLIANCE_FAILED":
        return "bg-red-50 dark:bg-red-950/30";
      case "DOCUMENT_SHARED":
        return "bg-purple-50 dark:bg-purple-950/30";
      case "SIGNATURE_REQUEST":
        return "bg-orange-50 dark:bg-orange-950/30";
      case "SYSTEM_ALERT":
        return "bg-yellow-50 dark:bg-yellow-950/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-sm relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-card">
        <SheetHeader className="border-b border-border px-6 py-4 pr-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold text-foreground">
                Notifications
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "You're all caught up!"}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="h-8 gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-4">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">No notifications yet</p>
                <p className="text-xs text-muted-foreground">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 hover:bg-accent transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm leading-tight text-foreground",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
