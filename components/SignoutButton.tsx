'use client'
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { signOut } from "next-auth/react"
import toast from "react-hot-toast"
import { Loader2, LogOut } from "lucide-react"


export default function SignOutButton() {
const[signout, setSignout] = useState<boolean>(false)
async function handleSignout(){
    setSignout(true)
    try{
        await signOut()
    }
    catch(e){
        toast.error('Failed to signout')
        console.error('An error occurred:', e);
    }
    finally{
        setSignout(false)
    }

}
  return (
    <div>
        <Button   variant="secondary" onClick={handleSignout}>
            {signout ? 
            (<Loader2 className="animate-spin h-4 w-4"/>) : 
            (<LogOut className="w-4 h-4"/>)}
        </Button>
      
    </div>
  )
}
