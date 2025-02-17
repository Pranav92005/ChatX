import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import { fetchRedis } from "@/helper/redis";
import { db } from "@/lib/db";
import {nanoid} from "nanoid";
import { messageValidator } from "@/lib/validators/messageValidator";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const {text,chatId}:{text:string,chatId:string}=await req.json();
        const session=await getServerSession(authOptions);
        if(!session){
            return new Response('Unauthorized',{status:401});
        }

        const [userId1,userId2]=chatId.split('--');

        if(session.user.id!==userId1 && session.user.id!==userId2){
            return new Response('Unauthorized',{status:401});
        }

        const friendId=session.user.id===userId1?userId2:userId1;
        
        const friendlist=await fetchRedis('smembers',`user:${session.user.id}:friends`) as string[];
        const isFriend=friendlist.includes(friendId);

        if(!isFriend){
            return new Response('Unauthorized',{status:401});
        }

        const rawSender=(await fetchRedis('get',`user:${session.user.id}`)) as string;
        const sender=JSON.parse(rawSender) as User;

        const timestamp=Date.now();
        const messageData:Message={
            id: nanoid(),
            senderId:session.user.id,
            receiverId:friendId,
            text,
            timestamp
        };

        const message=messageValidator.parse(messageData);

        //notify all connected chat room

        pusherServer.trigger(toPusherKey(`chat:${chatId}`),'incoming-message',message);
        pusherServer.trigger(toPusherKey(`user:${friendId}:chats`),'new_message',{
            ...message,
            senderImg:sender.image,
            senderName:sender.name
        });








        await db.zadd(`chat:${chatId}:messages`,{score:timestamp,member:JSON.stringify(message)});

        return new Response('ok');









    } catch (error) {

        if(error instanceof Error){
            return new Response(error.message,{status:500});
        }
        return new Response('Internal Server Error',{status:500});
        
    }
}