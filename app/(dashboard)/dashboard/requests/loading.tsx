import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function loading() {
  return (

    <div className="w-full flex flex-col items-center justify-center gap-3">

        <Skeleton  className="mb-4" height={60} width={500}/>
        <Skeleton  className="mb-4" height={20} width={150}/>
        <Skeleton  className="mb-4" height={50} width={400}/>
      
    </div>
  )
}
