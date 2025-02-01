import { EmailValidator } from "@/lib/validators/EmailValidator";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import { fetchRedis } from "@/helper/redis";
import { db } from "@/lib/db";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: EmailToadd } = EmailValidator.parse(body);

    // Getting user id from email
    const id = (await fetchRedis('get', `user:email:${EmailToadd}`)) as string | null;

    if (!id) {
      return new Response('user not found', { status: 400 });
    }

    // Get server session
    const session: Session = await getServerSession(authOptions) as Session;
    // console.log("Fetched session:", session);

    if (!session) {
      return new Response('unauthorized', { status: 401 });
    }

    // Check if session contains the correct user ID
    // console.log("Session user ID:", session.user.id);

    if (!session.user.id) {
      return new Response('Session ID is missing', { status: 401 });
    }

    if (session.user.id === id) {
      return new Response('cannot add yourself as a friend', { status: 400 });
    }

    // Check if request already sent
    const alreadyAdded = (await fetchRedis('sismember', `user:${id}:incoming_friend_requests`, session.user.id)) as 0 | 1;
    // console.log("Already added request:", alreadyAdded);

    if (alreadyAdded) {
      return new Response('already sent request', { status: 400 });
    }

    // Check if already friends
    const alreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:Friends`, id)) as 0 | 1;
    // console.log("Already friends:", alreadyFriends);

    if (alreadyFriends) {
      return new Response('already friends', { status: 400 });
    }

    console.log('triggering pusher event');

    pusherServer.trigger(toPusherKey(`user:${id}:incoming_friend_requests`), 'incoming_friend_requests', {senderId: session.user.id,senderEmail:session.user.email}); 

    // Add to incoming friend requests
    await db.sadd(`user:${id}:incoming_friend_requests`, session.user.id);
    console.log('Added to incoming friend requests');
    return new Response('ok');

  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response('invalid email', { status: 422 });
    }
    console.error("Error occurred:", e);
    return new Response('An error occurred', { status: 400 });
  }
}
