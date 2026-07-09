import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listBookings } from '../../api/client.js'
import { formatSlotDate, formatSlotTime } from '../../utils/formatSlotTime.js'
import { PageContainer, PageHeader, BackLink, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'

export default function JitsiCallPage() {
  const { id } = useParams()
  const { accessToken, user } = useAuth()

  const [status, setStatus] = useState('loading') // loading | success | error
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState(null)

  const containerRef = useRef(null)
  const apiRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listBookings(accessToken, {})
      .then((body) => {
        if (cancelled) return
        const found = body.bookings.find((b) => Number(b.id) === Number(id))
        setBooking(found || null)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, id])

  useEffect(() => {
    if (!booking || !booking.joinable) return undefined

    if (!window.JitsiMeetExternalAPI) return undefined

    const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: booking.jitsi_room_id,
      parentNode: containerRef.current,
      width: '100%',
      height: 600,
      userInfo: { displayName: (user && (user.name || user.email)) || 'Guest' },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'settings',
          'raisehand',
          'tileview',
        ],
      },
    })
    apiRef.current = api

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [booking, user])

  if (status === 'loading') {
    return (
      <PageContainer>
        <PageHeader title="Video Call" />
        <LoadingText>Loading booking...</LoadingText>
      </PageContainer>
    )
  }

  if (status === 'error') {
    return (
      <PageContainer>
        <PageHeader title="Video Call" />
        <ErrorAlert>{error}</ErrorAlert>
        <BackLink to="/dashboard">Back to dashboard</BackLink>
      </PageContainer>
    )
  }

  if (!booking) {
    return (
      <PageContainer>
        <PageHeader title="Video Call" />
        <EmptyState>Booking not found.</EmptyState>
        <BackLink to="/dashboard">Back to dashboard</BackLink>
      </PageContainer>
    )
  }

  if (!booking.joinable) {
    return (
      <PageContainer>
        <PageHeader title="Video Call" />
        <p>
          Scheduled for {formatSlotDate(booking.scheduled_at)} {formatSlotTime(booking.scheduled_at)}
        </p>
        <EmptyState>This class isn&apos;t open to join yet.</EmptyState>
        <BackLink to="/dashboard">Back to dashboard</BackLink>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title="Video Call" />
      {window.JitsiMeetExternalAPI ? (
        <div ref={containerRef} className="h-[600px] w-full overflow-hidden rounded-md border border-border" />
      ) : (
        <LoadingText>Loading video call...</LoadingText>
      )}
      <BackLink to="/dashboard">Back to dashboard</BackLink>
    </PageContainer>
  )
}
