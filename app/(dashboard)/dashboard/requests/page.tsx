import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import { fetchRedis } from "@/helper/redis"
import FriendRequest from "@/components/FriendRequest"


export default async  function page() {
    const session=  await getServerSession(authOptions)
if(!session) notFound()

    const  incomingSenderIds=(await fetchRedis('smembers',`user:${session.user.id}:incoming_friend_requests`)) as string[]

    const incomingRequests=await Promise.all(incomingSenderIds.map(async (senderId)=>{
        const sender=(await fetchRedis('get',`user:${senderId}`)) as string
        const parsedSender=JSON.parse(sender)
        return{
            senderId,
            senderEmail:parsedSender.email,
        }
    }))


  return (
    <main className="pt-8 flex flex-col items-center justify-center mt-4">
           <h1 className="font-bold text-5xl mb-8 ">Friend Requests</h1>
           <div className="flex flex-col gap-4">
            <FriendRequest incomingFriendRequests={incomingRequests} sessionId={session.user.id} />

           </div>
           
         
       </main>
  )
}
