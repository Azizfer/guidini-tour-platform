"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'

interface MarkTourCompletedProps {
  tourId: string
  isCompleted: boolean
  onStatusChange: (completed: boolean) => void
}

export default function MarkTourCompleted({ 
  tourId, 
  isCompleted, 
  onStatusChange 
}: MarkTourCompletedProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleMarkAsCompleted = async () => {
    if (isCompleted) return // Already completed
    
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour effectuer cette action",
          variant: "destructive"
        })
        return
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await axios.patch(
        `${API_URL}/tours/${tourId}/mark-completed`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.status === 200) {
        toast({
          title: "Tour marqué comme complété",
          description: "Le tour a été marqué comme complété avec succès",
          variant: "default"
        })
        
        onStatusChange(true)
      }
    } catch (error: any) {
      console.error('Erreur lors du marquage du tour comme complété:', error)
      
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue lors du marquage du tour comme complété",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Statut du tour</h3>
      
      {isCompleted ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Tour complété</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2 text-center">
            Marquer ce tour comme complété permettra aux participants de le noter.
            <br />
            <span className="font-semibold">Attention:</span> Cette action est irréversible.
          </p>
          
          <Button 
            onClick={handleMarkAsCompleted} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "En cours..." : "Marquer comme complété"}
          </Button>
        </>
      )}
    </div>
  )
}
