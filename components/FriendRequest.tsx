'use client';
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { UserPlus,X ,Check} from "lucide-react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface FriendRequestProps {
    incomingFriendRequests: IncomingFriendRequest[];
    sessionId: string;
}

export default function FriendRequest({ incomingFriendRequests, sessionId }: FriendRequestProps) {  
  const router=useRouter();
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    );
//real time friend request incoming
    useEffect(()=>{
pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
console.log('subscribed to incoming friend requests')
const friendRequestHandler=({senderId,senderEmail}:IncomingFriendRequest)=>{
    setFriendRequests((prev)=>[...prev,{senderId,senderEmail}])
  
    
}
pusherClient.bind('incoming_friend_requests',friendRequestHandler)

return()=>{
    pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
    pusherClient.unbind('incoming_friend_requests',friendRequestHandler);
}
    },[sessionId])


    const acceptFriend=async(senderId:string)=>{
      try{
      await axios.post('/api/friends/accept',{id:senderId})

      toast.success('Friend added successfully');
      
      
      }
      catch(error){
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data);
        } else {
          toast.error('An unexpected error occurred');
        }

      }
      finally{
        setFriendRequests((prev)=>prev.filter((request)=>request.senderId!==senderId))
      router.refresh();

      }



      

    }

    const denyFriend=async(senderId:string)=>{
      try {
        await axios.post('/api/friends/deny',{id:senderId})
        toast.success('Friend request denied');
        
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data);
        } else {
          toast.error('An unexpected error occurred');
        }
        
      }
      finally{
        setFriendRequests((prev)=>prev.filter((request)=>request.senderId!==senderId))

      router.refresh();

      }
      
      

    }
    
  return (
    <div>
        {friendRequests.length === 0 ? "No friend requests" :
       (
        friendRequests.map((request) => (
          <div key={request.senderId} className='flex gap-4 items-center'>
            <UserPlus className='text-black' />
            <p className='font-medium text-lg w-72'>{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              aria-label='accept friend'
              className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
              <Check className='font-semibold text-white w-3/4 h-3/4' />
            </button>

            <button
              onClick={() => denyFriend(request.senderId)}
              aria-label='deny friend'
              className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
              <X className='font-semibold text-white w-3/4 h-3/4' />
            </button>
          </div>)))
        }
    </div>
  );
}
