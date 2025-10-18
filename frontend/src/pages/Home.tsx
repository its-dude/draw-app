import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Backend_URL } from "../config";

export default function Home() {
    const navigate = useNavigate()

    useEffect(()=>{
        axios.get(Backend_URL)
        .catch(()=>{console.log("server is sleeping...")})
    })

    return (

        <div className="min-h-screen w-full relative bg-black">
            {/* Violet Storm Background with Top Glow */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000",
                }}
            />

            {/* Your Content/Components */}
            <div className="min-h-screen  flex flex-col items-center justify-center text-white relative">
                {/* Sign In Button */}
                <div className="absolute w-full top-6 px-6  flex justify-between">
                    <div className="text-xl sm:text-2xl">doodly</div>
                    <button className="bg-purple-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-purple-700" onClick={() => navigate('/signin')}>
                        signin
                    </button>
                </div>

                <div className="text-center max-w-2xl px-4">
                    <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
                        Unite Your Creativity <br />
                        on One
                        <span className="relative inline-block px-2 my-2 mx-4 sm:my-0">
                            <span className="absolute -inset-1 bg-[#B65BBE] rounded-md transform rotate-[3deg]"></span>
                            <span className="relative text-white">Canvas</span>
                        </span>
                    </h1>

                    <p className="text-white text-sm sm:text-base lg:text-lg my-6 sm:my-8 max-w-2xl mx-auto px-4">
                        Draw, sketch, or brainstorm with friends and teams in real time. Share ideas instantly,
                        no installs needed — just join and create
                    </p>

                    <button className="mt-8 bg-[#8B59B2] hover:bg-purple-500 px-6 py-2  rounded-md text-white font-semibold" onClick={() => { navigate('/signup') }}>
                        Get started
                    </button>
                </div>
            </div>
        </div>


    );
}

