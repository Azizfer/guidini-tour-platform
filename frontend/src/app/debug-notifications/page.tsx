"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/app/LogingContext/AuthContext'
import axios from 'axios'

// Define the API URL from environment variables or use a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function DebugNotifications() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [userId, setUserId] = useState<string>(user?.id || user?._id || localStorage.getItem('userId') || '')
  const [guideId, setGuideId] = useState<string>(userId)

  const createDirectNotification = async () => {
    setLoading(true)
    setResult('Creating notification directly...')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Create a simple test notification
      const notification = {
        title: "Test Notification",
        description: "This is a test notification created directly via the API.",
        type: "system",
        recipient: userId, // This is the key field expected by the backend
        read: false
      }
      
      // Log the request details
      console.log('Creating notification with:', {
        url: `${API_URL}/notifications`,
        headers: { Authorization: `Bearer ${token.substring(0, 10)}...` },
        data: notification
      })
      
      // Send the notification to the backend
      const response = await axios.post(
        `${API_URL}/notifications`, 
        notification,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Notification created:', response.data)
      
      // Trigger notification refresh
      window.dispatchEvent(new Event('notificationUpdate'))
      
      setResult(`Notification created successfully!
        Status: ${response.status}
        Response: ${JSON.stringify(response.data, null, 2)}
      `)
    } catch (error: any) {
      console.error('Error creating notification:', error)
      setResult(`Error creating notification: ${error.response?.data?.message || error.message}
        
        Request details:
        URL: ${API_URL}/notifications
        User ID: ${userId}
        
        Response: ${JSON.stringify(error.response?.data, null, 2) || 'No response data'}
      `)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    setResult('Fetching notifications...')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Log the request details
      console.log('Fetching notifications from:', `${API_URL}/notifications`)
      
      // Get notifications from the backend
      const response = await axios.get(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Notifications fetched:', response.data)
      
      setResult(`Notifications fetched successfully!
        Count: ${response.data.length}
        
        Notifications:
        ${JSON.stringify(response.data, null, 2)}
      `)
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      setResult(`Error fetching notifications: ${error.response?.data?.message || error.message}
        
        Response: ${JSON.stringify(error.response?.data, null, 2) || 'No response data'}
      `)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Notification System Debugger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current user details from authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input 
                  id="userId" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
                <p className="text-xs text-gray-500 mt-1">This is the recipient of the notification</p>
              </div>
              
              <div>
                <Label htmlFor="guideId">Guide ID (for testing)</Label>
                <Input 
                  id="guideId" 
                  value={guideId} 
                  onChange={(e) => setGuideId(e.target.value)}
                  placeholder="Enter guide ID"
                />
                <p className="text-xs text-gray-500 mt-1">Used for testing guide notifications</p>
              </div>
              
              <div className="pt-2">
                <p><strong>User Name:</strong> {user?.name || 'Not logged in'}</p>
                <p><strong>User Type:</strong> {user?.userType || 'Unknown'}</p>
                <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Test Notification</CardTitle>
            <CardDescription>Create a notification directly via the API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={createDirectNotification}
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'Creating...' : 'Create Test Notification'}
            </Button>
            
            <Button 
              onClick={fetchNotifications}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Fetch Current Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
