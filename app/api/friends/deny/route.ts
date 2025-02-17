import z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authoptions";
import { db } from '@/lib/db';

export async function POST(req:Request){
    try {
        const body=await req.json();
    const {id:idToDeny}=z.object({id:z.string()}).parse(body);
    const session= await getServerSession(authOptions);

    if(!session){
        return new Response('Unauthorized',{status:401});
    }

    //removing friend request
    await db.srem(`user:${session.user.id}:incoming_friend_requests`,idToDeny);
     return new Response('ok');

        
    } catch (error) {
        console.error(error);

        if(error instanceof z.ZodError){
            return new Response('invalid request payload ',{status:422});
        }
        return new Response('Invlid Request',{status:400});
        
    }
    

}