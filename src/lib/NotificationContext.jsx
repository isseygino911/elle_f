import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadMessageCount,
} from '../api/client.js'

// How many unread notifications the drawer holds. The server caps `limit` at
// 100; asking for fewer keeps each poll small, and a user with more than 30
// unread has a backlog to clear rather than a list to read.
const NOTIFICATION_PAGE_SIZE = 30

const POLL_INTERVAL_MS = 15000

// The app-wide live-count layer, feeding the shell's notification bell and its
// messages nav badge.
//
// WHY THIS IS A CONTEXT AND NOT PAGE STATE
//
// This poll used to live inside DashboardPage, so its clearInterval fired on
// navigation: a user sitting on /courses or /videos received no notification
// signal at all, and the count they had last seen was however stale the moment
// they left the dashboard. Hoisting it into a provider mounted in AppShell is
// what makes "live" true on every page rather than on one.
//
// It also gives managers a notification surface for the first time. The
// dashboard never rendered notifications for them (ManagerDashboard has no
// notification section at all), even though the server has always served
// them. GET /notifications is fenced by user_id AND org_id, so a manager
// reading their own notifications crosses no privacy boundary -- these are
// rows addressed to them.
//
// POLLING, NOT PUSH
//
// Deliberately the same 15s interval the rest of the app uses, not SSE or a
// websocket. The backend has no realtime layer, and adding one would mean a
// held connection per signed-in user plus proxy buffering config. Everything
// live is funnelled through this one file, so swapping the transport later
// means rewriting `refresh` and nothing else -- no consumer touches fetching.
//
// ONE INTERVAL, BOTH COUNTS
//
// Notifications and unread mail are fetched together on the same tick. Two
// independent pollers would double the request rate for two numbers that sit
// six pixels apart in the same sidebar.
const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { accessToken } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  // Mirrors accessToken for the interval closure. Without it the effect would
  // have to re-create the interval on every token refresh, restarting the
  // 15s clock each time -- the same reason MessageThreadPage keeps a ref for
  // its messages.
  const accessTokenRef = useRef(accessToken)
  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  const refresh = useCallback(async () => {
    const token = accessTokenRef.current
    if (!token) return

    // Settled, not all: an unread-mail failure must not blank the notification
    // list, and vice versa. Each count updates only if its own request
    // succeeded, so a partial outage degrades one badge rather than both.
    const [notificationResult, messageResult] = await Promise.allSettled([
      listNotifications(token, { unreadOnly: true, limit: NOTIFICATION_PAGE_SIZE }),
      getUnreadMessageCount(token),
    ])

    if (notificationResult.status === 'fulfilled') {
      setNotifications(notificationResult.value.notifications)
      // The server's own COUNT(*) over every unread row, not the length of the
      // page above -- a user with 40 unread must see 40, not the 30 fetched.
      setUnreadCount(notificationResult.value.unread_count)
    }

    if (messageResult.status === 'fulfilled') {
      setUnreadMessageCount(messageResult.value.total_count)
    }
    // Errors are otherwise swallowed: a failed poll keeps the last known-good
    // counts on screen, which is the established behaviour of both pollers
    // this replaces. A badge that blanks on one dropped request reads as
    // "nothing waiting", which is worse than reading as slightly stale.
  }, [])

  useEffect(() => {
    if (!accessToken) {
      // Signed out: drop the counts so the next user never sees the previous
      // one's badges during the moment before the first poll lands.
      setNotifications([])
      setUnreadCount(0)
      setUnreadMessageCount(0)
      return undefined
    }

    let cancelled = false

    function tick() {
      if (cancelled) return
      refresh()
    }

    tick()
    const intervalId = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [accessToken, refresh])

  // Optimistic, matching the handler this replaces: the row leaves the list
  // and the count drops immediately, and a failure leaves both in place so the
  // user can retry rather than watching a row vanish and reappear.
  const markRead = useCallback(
    async (notificationId) => {
      const token = accessTokenRef.current
      if (!token) return
      try {
        await markNotificationRead(token, notificationId)
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // Leave the notification in place so the user can retry.
      }
    },
    []
  )

  const markAllRead = useCallback(async () => {
    const token = accessTokenRef.current
    if (!token) return
    try {
      await markAllNotificationsRead(token)
      setNotifications([])
      setUnreadCount(0)
    } catch {
      // Leave the list in place so the user can retry.
    }
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      unreadMessageCount,
      markRead,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, unreadMessageCount, markRead, markAllRead, refresh]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// Returns null outside a provider rather than throwing. AppShell wraps every
// authenticated route, but the login and invitation-accept screens render
// outside it, and a shared component reaching for a count there should render
// no badge rather than crash the page.
export function useNotifications() {
  return useContext(NotificationContext)
}
