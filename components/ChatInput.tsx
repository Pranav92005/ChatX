
'use client'

import { useRef,useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {Button} from '@/components/ui/button';
import axios from 'axios';

import toast from 'react-hot-toast';

interface ChatInputProps {
    chatPartner:User,
    chatId:string
}

export default function ChatInput({chatPartner,chatId}:ChatInputProps) {
    const textareaRef=useRef<HTMLTextAreaElement>(null);  
    const[input,setInput]=useState<string>('');  
    const[loading,setLoading]=useState<boolean>(false);

    const sendMessage=async()=>{
      if(!input){
        return;
      }
        
        setLoading(true);
        try {
          await axios.post('/api/message/send',{chatId,text:input});
          setInput('');

          textareaRef.current?.focus();
          
        } catch (error) {
          console.error('An error occurred:', error);
          toast.error('Failed to send message');
          
        }
        finally{
            setLoading(false);
        }

        
        
    };
  return (
    <div className='border-t border-gray-200  px-4 pt-4 mb-2 sm:mb-0'>
      <div className='relative  flex-1 overflow-hidden rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>

        <TextareaAutosize ref={textareaRef} onKeyDown={(e)=>{
            if(e.key==='Enter' && !e.shiftKey){
                e.preventDefault();
                sendMessage();
                console.log(textareaRef.current?.value)
            }
        }} 
        rows={1}
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        placeholder={`Message ${chatPartner.name}`}
          className='block w-full resize-none border-none bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
         
         />

        <div onClick={()=>textareaRef.current?.focus()} className='py-2' aria-hidden='true'>
            <div className='py-px'>
                <div className='h-9'/>
            </div>
        </div>
        
        <div className='absolute bottom-0 right-0 flex justify-between py-2 pl-3 pr-2 space-x-2'>
          <div className='flex-shrink-0'>
            <Button  type='submit' onClick={sendMessage} className='bg-black text-white  border rounded-xl hover:bg-slate-800'>{!loading?"Send":"....."}</Button>
          </div>
        </div>



        </div>
        </div>
  )
}
