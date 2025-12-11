import Navbar from '../component/Navbar'
import laptopIcon from '../assets/laptop.svg'

export default function Landing(){
    return(
        <div className="flex flex-col m-20 h-full w-full bg-white">
            {/* <Navbar /> */}
            <div className="flex flex-col items-center justify-start  text-center  flex-1">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold  text-black leading-tight max-w-4xl">
                    Unlock Your Potential.
                </h1>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold  text-black leading-tight max-w-4xl">
                    Find Your Internship
                </h2>
                <p className="text-base md:text-lg text-gray-700 mb-16 max-w-2xl font-medium leading-relaxed">
                    Connect with top companies and discover thousands<br/>
                    internships across various industries.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                    <button className="signup-btn px-8 py-4 text-lg font-semibold">
                        Explore Now
                    </button>
                    <div className="flex items-center gap-2 text-gray-700">
                        <img src={laptopIcon} alt="Career" width="24" height="24" className="m-4" />
                        <div className="text-sm">
                            <div>Start your career</div>
                            <div>journey</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}