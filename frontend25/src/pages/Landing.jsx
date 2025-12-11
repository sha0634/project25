import Navbar from '../component/Navbar'
import laptopIcon from '../assets/laptop.svg'
import { motion } from 'framer-motion'

export default function Landing(){
    const text1 = "Unlock Your Potential.";
    const text2 = "Find Your Internship";
    const text3Line1 = "Connect with top companies and discover thousands";
    const text3Line2 = "internships across various industries.";

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: i * 0.04 }
        })
    };

    const child = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", damping: 12, stiffness: 100 }
        }
    };

    return(
        <div className="flex flex-col m-20 h-full w-full bg-white">
            {/* <Navbar /> */}
            <div className="flex flex-col items-center justify-start  text-center  flex-1">
                <motion.h1 
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold  text-black leading-tight max-w-4xl"
                >
                    {text1.split("").map((char, index) => (
                        <motion.span key={index} variants={child}>
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.h1>
                <motion.h2 
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    custom={text1.length}
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold  text-black leading-tight max-w-4xl"
                >
                    {text2.split("").map((char, index) => (
                        <motion.span key={index} variants={child}>
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.h2>
                <motion.p 
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    custom={text1.length + text2.length}
                    className="text-base md:text-lg text-gray-700 mb-16 max-w-2xl font-medium leading-relaxed"
                >
                    {text3Line1.split("").map((char, index) => (
                        <motion.span key={index} variants={child}>
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                    <br/>
                    {text3Line2.split("").map((char, index) => (
                        <motion.span key={`line2-${index}`} variants={child}>
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 3 }}
                    className="flex flex-col sm:flex-row gap-6 items-center justify-center"
                >
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
                </motion.div>
            </div>
        </div>
    )
}