"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import notificationService from '@/services/notificationService'
import { useAuth } from '@/app/LogingContext/AuthContext'

export default function TestNotification() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const createTestNotifications = async () => {
    setLoading(true)
    setResult('Creating test notifications...')
    
    try {
      // Get user IDs
      const userId = user?.id || user?._id || localStorage.getItem('userId') || ''
      // For testing, we'll use the same user ID as both tourist and guide
      const guideId = userId
      
      // Create a test booking notification
      const bookingResult = await notificationService.createBookingNotification(
        'test-tour-id',
        'Test Tour',
        new Date().toISOString(),
        guideId,
        userId,
        user?.name || 'Test User'
      )
      
      // Create a test payment notification
      const paymentResult = await notificationService.createPaymentNotification(
        'test-tour-id',
        'Test Tour',
        100,
        guideId,
        userId
      )
      
      // Force refresh notifications
      notificationService.clearCache()
      
      // Dispatch notification update event
      window.dispatchEvent(new Event('notificationUpdate'))
      
      setResult(`Notifications created successfully: 
        Booking: ${bookingResult ? 'Success' : 'Failed'}
        Payment: ${paymentResult ? 'Success' : 'Failed'}
        
        Check your notification panel now!
      `)
    } catch (error) {
      console.error('Error creating test notifications:', error)
      setResult(`Error creating notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Notification System</h1>
      <p className="mb-4">This page allows you to test if notifications are working correctly.</p>
      
      <Button 
        onClick={createTestNotifications}
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? 'Creating...' : 'Create Test Notifications'}
      </Button>
      
      {result && (
        <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-line">
          {result}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-medium mb-2">Debugging Information:</h2>
        <p>User ID: {user?.id || user?._id || 'Not logged in'}</p>
        <p>User Name: {user?.name || 'Unknown'}</p>
        <p>User Type: {user?.userType || 'Unknown'}</p>
      </div>
    </div>
  )
}
