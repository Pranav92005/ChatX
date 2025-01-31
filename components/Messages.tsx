'use client';
import { cn } from "@/lib/utils";
import { Message } from "@/lib/validators/messageValidator";
import { useRef } from "react"
import { useState } from "react"
import { format } from 'date-fns'
import Image from 'next/image'
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface MessageProps {
    initialMessages:Message[],
    sessionId:string,
    chatId:string,
    chatPartner:User,
    sessionImg:string
}


export default function Messages({initialMessages,sessionId,chatId,chatPartner,sessionImg}:MessageProps) {
    const[messages,setMessages]=useState<Message[]>(initialMessages);

      useEffect(()=>{
      pusherClient.subscribe(toPusherKey(`chat:${chatId}`));
      
      const messageHandler=(message:Message)=>{
          setMessages((prev)=>[message,...prev]);
          
           }
      pusherClient.bind('incoming-message',messageHandler)
      
      return()=>{
          pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
          pusherClient.unbind('incoming-message',messageHandler);
      }
          },[chatId])




    const scrollDownRef=useRef<HTMLDivElement>(null);
    console.log(messages)

    const formatTimestamp = (timestamp: number) => {
        return format(timestamp, 'HH:mm')
      }
  return (
    <div id="messages" className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-w-2 scrolling-touch  ">
      <div ref={scrollDownRef}/>
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
const hasNextMessageFromSameUser= index>0&&messages[index-1].senderId===messages[index].senderId;
        return (
            <div className="chat-message" key={`${message.id}-${message.timestamp}`}>
                <div className={cn('flex items-end',{'justify-end':isCurrentUser})}>
                    <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2',{
                        'order-1 items-end':isCurrentUser,
                        'order-2 items-start':!isCurrentUser
                    })}>
                         <span
                  className={cn('px-4 py-2  border rounded-xl inline-block', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none':
                      !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl-none':
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}>
                  {message.text}{' '}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
                    </div>

                    <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}>
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt='Profile picture'
                  referrerPolicy='no-referrer'
                  className='rounded-full'
                />
              </div>

                </div>


            </div>
          
          
        );
      })}
    </div>
  )
}
