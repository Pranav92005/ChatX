"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'
import { getSession } from 'next-auth/react'
 
import axios, { AxiosError } from 'axios'
// import { error } from 'console'

export default function AddFriend() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Here you would typically make an API call to add the friend
    // For this example, we'll simulate an API call with a timeout
    try {
        // Make the API request to send the friend request
        const session = await getSession();

        if(!session)return;
        // {console.log(session)}
         await axios.post("/api/friends/add", { email }
         
        );
  
        // Success notification
        toast.success(`Friend request sent to ${email}`);
      } catch (error) {
        console.error("An error occurred:", error);
        const axiosError = error as AxiosError;
  
        if (axiosError.response) {
          // Handle specific error responses from the backend
          const errorMessage = axiosError.response.data || "An error occurred";
          toast.error(errorMessage);
        } else if (axiosError.request) {
          // Handle network or timeout errors
          toast.error("Network error, please try again.");
        } else {
          // Catch any other unexpected errors
          toast.error("An unexpected error occurred.");
        }
      } finally {
        // Reset the form after the request
        setEmail("");
        setIsSubmitting(false);
      }
    };
    
    
  

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add a Friend</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending Request...' : 'Add Friend'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

