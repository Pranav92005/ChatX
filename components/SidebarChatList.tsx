'use client';

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toPusherKey } from "@/lib/utils";
import toast from "react-hot-toast";
import {type  Toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";



interface SidebarChatListProps {
    friends:User[],
    sessionId:string,
}

interface ExtendedMessage extends Message{
    senderName:string,
    senderImg:string

}

export default function SidebarChatList({friends,sessionId}:SidebarChatListProps) {
const router=useRouter();
const pathname=usePathname();
const [unseenMesssages, setUnseenMessages] = useState<Message[]>([]);

useEffect(()=>{
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler=()=>{
        router.refresh();
    }

    const chatHandler=(message:ExtendedMessage)=>{ 
        const shouldNotify=pathname!==`/dashboard/chat/${chatHrefConstructor(sessionId,message.senderId)}`;

        if(!shouldNotify)return;

        toast.custom((t:Toast)=>(
            <UnseenChatToast 

            t={t}
            sessionId={sessionId}
            senderId={message.senderId}
            senderImg={message.senderImg}
            senderName={message.senderName}
            senderMessage={message.text}
            
            />
        )

        )
        setUnseenMessages((prev)=>[...prev,message])

     }

    pusherClient.bind('new_message',chatHandler )
    pusherClient.bind('new_friend',newFriendHandler)


    return()=>{

        pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
        pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
        
        pusherClient.unbind('new_message',chatHandler )
    pusherClient.unbind('new_friend',newFriendHandler)

    }

},[pathname,sessionId,router])


useEffect(()=>{
    if(pathname.includes('chat')){
        setUnseenMessages((prev)=>{
            return prev.filter((msg)=>!pathname.includes(msg.senderId)

            )})
    }

},[pathname])



  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
{
    friends.sort().map((friend)=>{
        const unseenMesssagesCount=unseenMesssages.filter((msg)=>msg.senderId===friend.id).length;
        
        
        

        return <li key={friend.id}>
            <a href={`/dashboard/chat/${chatHrefConstructor(sessionId,friend.id)}`} className="text-gray-700 hover:text-indigo-600 bg-slate-200 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ">{friend.name}
            {
                unseenMesssagesCount>0 && <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center">{unseenMesssagesCount}</div>
            }
            
            </a>
        </li>
    })
}

      
    </ul>
  )
}
