import Head from 'next/head';
import Navbar from '../../components/Navbar';

export default function DashboardHelp() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Dashboard Help | Harbour View Directory</title>
                <meta name="description" content="Quick guide to managing listings and events." />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900">Dashboard Help</h1>
                        <p className="text-gray-600 mt-2">Everything you need to manage your listing and events.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-8">
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900">Login + Dashboard</h2>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2">
                                <li>Go to the Login page and sign in with your email and password.</li>
                                <li>Open the Dashboard to view your listings.</li>
                                <li>Use the buttons at the top to create listings or manage events.</li>
                            </ol>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900">Edit a Listing</h2>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2">
                                <li>In the Dashboard, click Edit on your listing.</li>
                                <li>Update business details and contact info.</li>
                                <li>Upload images (max 5MB each).</li>
                                <li>Click Save Changes.</li>
                            </ol>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Drag and drop images or click to browse.</li>
                                <li>Use PNG, JPG, GIF, or WEBP formats.</li>
                                <li>Images appear in your gallery once saved.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900">Create Events</h2>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2">
                                <li>Go to Manage Events from the Dashboard.</li>
                                <li>Fill in the event details and select your paid tier.</li>
                                <li>Submit the event and follow payment instructions.</li>
                                <li>Approved events will appear on the Events page.</li>
                            </ol>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900">Quick Fixes</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Buttons not responding? Log out and back in, then hard refresh.</li>
                                <li>Images not showing? Ensure each file is under 5MB and re-save.</li>
                                <li>Events not showing? Check the status and event date.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
