
import { getServerSession } from 'next-auth';
import z from 'zod';
import { authOptions } from '@/lib/authoptions';
import { fetchRedis } from '@/helper/redis';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';


export async function POST(req:Request){
    try {
        const body=await req.json();
        
        const {id:idToAdd}=z.object({id:z.string()}).parse(body);   

        const session= await getServerSession(authOptions);
        if(!session){
            return new Response('Unauthorized',{status:401});
        }
         //verify both users are already friends

         const isAlreadyFriends=await fetchRedis('sismember',`user:${session.user.id}:friends`,idToAdd);
        if(isAlreadyFriends===1){
            return new Response('Already friends',{status:400});
        }

        //has friend request
        const hasFriendRequest=await fetchRedis('sismember',`user:${session.user.id}:incoming_friend_requests`,idToAdd);
         
       if(!hasFriendRequest){
           return new Response('No friend request',{status:400});
       }

       pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`),'new_friend',{});
//adding userid to friends list of both users
       await db.sadd(`user:${session.user.id}:friends`,idToAdd);
         await db.sadd(`user:${idToAdd}:friends`,session.user.id);

         await db.srem(`user:${session.user.id}:incoming_friend_requests`,idToAdd);




return new Response('Friend added',{status:200});

        
    } catch (error) {
        console.error(error);

        if(error instanceof z.ZodError){
            return new Response('invalid request payload ',{status:422});
        }
        return new Response('Invlid Request',{status:400});



        
    }
}