export default function Chat (){

    // const []

    return(
    <div className=" min-h-screen flex flex-col items-center justify-center ">
        <div className="flex flex-col border border-[#2F2F2F] p-6 w-full rounded-xl gap-4">
            <div className="flex flex-col"> <div className="text-amber-50 text-3xl font-semibold font-['nocturn'] tracking-wider">Real Time Chat</div>
            <div className="text-[#b6b5b5] font-['doto'] text-xl">Temporary Room expires when all users exit</div>
            </div>
            
            <button className="w-full bg-amber-100 p-3.5 rounded-sm font-semibold cursor-pointer text-xl font-['nocturn']">Create New Room</button>
            <div className="flex justify-between gap-2 h-xs">
                <input className="w-full p-2 border border-[#2F2F2F] rounded-sm placeholder-[#8d8c8c] font-['nocturn']" placeholder="Enter Room Code"></input>
                <button className="px-3 py-1 bg-amber-100 rounded-sm items-center w-3xs cursor-pointer font-['nocturn'] text-3xs font-semibold"  >Join Room</button>
            </div>


        </div>
    </div>)
}