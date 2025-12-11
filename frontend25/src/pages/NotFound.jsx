export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <h1 className="text-7xl font-bold mb-4 text-black">404</h1>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Sorry, the page you're looking for doesn't exist.
            </p>
            <a href="/" className="bg-[#6C5CE7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5B4BD6] transition-colors">
                Go Home
            </a>
        </div>
    )
}
