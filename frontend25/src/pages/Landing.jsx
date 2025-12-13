import laptopIcon from '../assets/laptop.svg'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Check, Star, Monitor, BarChart3, Palette, Microscope, Smartphone, Scale, Heart, GraduationCap } from 'lucide-react'

export default function Landing(){
    const text1 = "Unlock Your Potential.";
    const text2 = "Find Your Internship";
    const text3Line1 = "Connect with top companies and discover thousands";
    const text3Line2 = "internships across various industries.";

    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    })

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
            transition: { type: "spring", damping: 8, stiffness: 200, bounce: 0.5 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const features = [
        { title: "Thousands of Opportunities", desc: "Access internships from leading companies across various industries" },
        { title: "Personalized Matches", desc: "Get recommendations tailored to your skills and career goals" },
        { title: "Easy Application", desc: "Apply to multiple positions with just a few clicks" },
        { title: "Career Guidance", desc: "Resources and mentorship to help you succeed" }
    ];

    return(
        <div ref={ref} className="bg-white">
            {/* Hero Section */}
            <div className="flex flex-col m-20 h-screen items-center justify-center text-center">
                <motion.h1 
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold text-black leading-tight max-w-4xl"
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
                    className="text-5xl md:text-6xl lg:text-7xl font-semibold text-black leading-tight max-w-4xl"
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
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                    <motion.button 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 3, 
                            delay: 3,
                            type: "spring",
                            stiffness: 70,
                            damping: 25
                        }}
                        style={{ transformOrigin: "center" }}
                        className="signup-btn px-8 py-4 text-lg font-semibold"
                    >
                        Explore Now
                    </motion.button>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 3, 
                            delay: 3.3,
                            type: "spring",
                            stiffness: 70,
                            damping: 25
                        }}
                        style={{ transformOrigin: "left center" }}
                        className="flex items-center gap-2 text-gray-700"
                    >
                        <img src={laptopIcon} alt="Career" width="24" height="24" className="m-4" />
                        <div className="text-sm">
                            <div>Start your career</div>
                            <div>journey</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-6 bg-gray-50">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Why Choose Us?</h2>
                    <p className="text-lg text-gray-600">Everything you need to kickstart your career journey</p>
                </motion.div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-[#6d28d9] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-6 h-6 text-[#6d28d9]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-black">{feature.title}</h3>
                            <p className="text-gray-600">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-20 px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">How It Works</h2>
                    <p className="text-lg text-gray-600">Get started in just 3 simple steps</p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-12">
                    {[
                        { step: "01", title: "Create Your Profile", desc: "Sign up and tell us about your skills, interests, and career goals" },
                        { step: "02", title: "Browse Opportunities", desc: "Explore thousands of internships from top companies worldwide" },
                        { step: "03", title: "Apply & Get Hired", desc: "Submit applications with one click and land your dream internship" }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.2 }}
                            className="flex gap-6 items-start"
                        >
                            <div className="flex-shrink-0 w-16 h-16 bg-[#6d28d9] rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {item.step}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold mb-2 text-black">{item.title}</h3>
                                <p className="text-gray-600 text-lg">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-20 px-6 bg-[#6d28d9] text-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    {[
                        { number: "10K+", label: "Active Internships" },
                        { number: "500+", label: "Partner Companies" },
                        { number: "50K+", label: "Students Placed" },
                        { number: "95%", label: "Success Rate" }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="text-5xl font-bold mb-2">{stat.number}</div>
                            <div className="text-lg opacity-90">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* For Companies Section */}
            <div className="py-20 px-6 bg-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">For Companies</h2>
                    <p className="text-lg text-gray-600">Find the best talent for your organization</p>
                </motion.div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                    >
                        <h3 className="text-3xl font-bold text-black mb-6">Post Internships & Hire Top Talent</h3>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            Connect with motivated students from top universities. Our platform makes it easy to post internship opportunities, 
                            manage applications, and find the perfect candidates for your team.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Post unlimited internship positions",
                                "Access to pre-screened candidates",
                                "Advanced filtering and search tools",
                                "Streamlined application management"
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 bg-[#6d28d9] bg-opacity-10 rounded-full flex items-center justify-center mt-1">
                                        <Check className="w-4 h-4 text-[#6d28d9]" />
                                    </div>
                                    <span className="text-gray-700">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <motion.button
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: 0.4 }}
                            className="mt-8 bg-[#6d28d9] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#8b5cf6] transition-colors"
                        >
                            Post an Internship
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="grid grid-cols-2 gap-6"
                    >
                        {[
                            { title: "Quick Setup", desc: "Create your company profile in minutes" },
                            { title: "Smart Matching", desc: "AI-powered candidate recommendations" },
                            { title: "Analytics", desc: "Track application metrics and insights" },
                            { title: "Support", desc: "Dedicated account manager for your needs" }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 p-6 rounded-xl"
                            >
                                <h4 className="font-semibold text-black mb-2">{feature.title}</h4>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Trusted Companies Section */}
            <div className="py-20 px-6 bg-gray-50">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Trusted by Leading Companies</h2>
                    <p className="text-gray-600 mb-12">Join hundreds of organizations finding their next generation of talent</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
                        {["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Tesla", "SpaceX"].map((company, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.05 }}
                                className="text-2xl font-bold text-gray-700"
                            >
                                {company}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 px-6 bg-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">What Our Users Say</h2>
                    <p className="text-lg text-gray-600">Real stories from students and companies</p>
                </motion.div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah Johnson", role: "Computer Science Student", text: "Found my dream internship at Google within 2 weeks! The platform made the entire process so smooth.", rating: 5 },
                        { name: "Michael Chen", role: "HR Manager, Tech Corp", text: "We've hired 15 amazing interns through Placify. The quality of candidates is outstanding.", rating: 5 },
                        { name: "Emily Davis", role: "Business Major", text: "The personalized recommendations helped me discover opportunities I wouldn't have found otherwise.", rating: 5 }
                    ].map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.15 }}
                            className="bg-gray-50 p-8 rounded-2xl"
                        >
                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                            <div>
                                <p className="font-semibold text-black">{testimonial.name}</p>
                                <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Popular Categories Section */}
            <div className="py-20 px-6 bg-gray-50">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Explore by Category</h2>
                    <p className="text-lg text-gray-600">Find internships in your field of interest</p>
                </motion.div>

                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Monitor, title: "Technology", count: "2,500+ positions" },
                        { icon: BarChart3, title: "Business", count: "1,800+ positions" },
                        { icon: Palette, title: "Design", count: "950+ positions" },
                        { icon: Microscope, title: "Research", count: "720+ positions" },
                        { icon: Smartphone, title: "Marketing", count: "1,200+ positions" },
                        { icon: Scale, title: "Legal", count: "450+ positions" },
                        { icon: Heart, title: "Healthcare", count: "890+ positions" },
                        { icon: GraduationCap, title: "Education", count: "640+ positions" }
                    ].map((category, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                            <div className="mb-3 group-hover:scale-110 transition-transform flex justify-center">
                                <category.icon className="w-10 h-10 text-[#6d28d9]" />
                            </div>
                            <h3 className="font-semibold text-black mb-1">{category.title}</h3>
                            <p className="text-sm text-gray-600">{category.count}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    className="max-w-4xl mx-auto text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-gray-600">Everything you need to know</p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        { q: "Is Placify free to use for students?", a: "Yes! Students can create profiles, browse internships, and apply for positions completely free." },
                        { q: "How do I apply for an internship?", a: "Simply create your profile, browse available positions, and click 'Apply' on any internship that interests you." },
                        { q: "Can companies post internships for free?", a: "We offer both free and premium plans for companies. Free plans include basic posting features, while premium plans offer advanced tools." },
                        { q: "How are candidates matched to internships?", a: "Our AI-powered algorithm matches candidates based on skills, experience, interests, and career goals." },
                        { q: "What types of internships are available?", a: "We have internships across all industries including tech, business, design, healthcare, and more." }
                    ].map((faq, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 p-6 rounded-xl"
                        >
                            <h3 className="font-semibold text-black text-lg mb-2">{faq.q}</h3>
                            <p className="text-gray-600">{faq.a}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="py-20 px-6 bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white text-center"
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of students who have found their dream internships</p>
                <button className="bg-white text-[#6d28d9] px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
                    Get Started Now
                </button>
            </motion.div>

            {/* Footer */}
            <footer className="py-12 px-6 bg-gray-100 text-gray-700">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                    <div>
                        <h3 className="text-gray-900 font-bold text-xl mb-4">Placify</h3>
                        <p className="text-sm text-gray-600">Your gateway to amazing internship opportunities worldwide.</p>
                    </div>
                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm list-none">
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Internships</a></li>
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Companies</a></li>
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Resources</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm list-none">
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Partners</a></li>
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm list-none">
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#6d28d9] transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
                    <p>&copy; 2025 Placify. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}