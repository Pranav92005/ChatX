"use client";

import { User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";



interface FriendRequestSidebarOptionsProps {
  initialUnseenRequestcount: number,
  sessionId: string,
}


export default function FriendRequestSidebarOptions({initialUnseenRequestcount,sessionId}:FriendRequestSidebarOptionsProps) {
  const[unseenRequestcount,setUnseenRequestcount] = useState<number>(initialUnseenRequestcount);

   useEffect(()=>{
  pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
  console.log('subscribed to incoming friend requests')
  const friendRequestHandler=()=>{
      setUnseenRequestcount((prev)=>prev+1);
       }
  pusherClient.bind('incoming_friend_requests',friendRequestHandler)
  
  return()=>{
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
      pusherClient.unbind('incoming_friend_requests',friendRequestHandler);
  }
      },[sessionId])
  
  return (
    <div>
        <Link href='/dashboard/requests' className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-5 font-semibold">
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
      <User className="h-6 w-6" />  </div>
      <p className="truncate">Friend requests</p>
      

      {unseenRequestcount > 0  ?
      <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
        {unseenRequestcount}
      </div> 
      :null}
     
      </Link>
    </div>
  )
}
