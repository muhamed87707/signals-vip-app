'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [pastedImage, setPastedImage] = useState(null);
    const [pair, setPair] = useState('');
    const [type, setType] = useState('BUY');
    const [isLoading, setIsLoading] = useState(false);
    const [signals, setSignals] = useState([]);

    const CORRECT_PASSWORD = '@Mainpassword87707';

    useEffect(() => {
        // Check local storage for session
        if (localStorage.getItem('admin_session') === 'true') {
            setIsAuthenticated(true);
            fetchSignals();
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('admin_session', 'true');
            fetchSignals();
        } else {
            alert('Incorrect Password');
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setPastedImage(event.target.result);
                };
                reader.readAsDataURL(blob);
            }
        }
    };

    const fetchSignals = async () => {
        try {
            const res = await fetch('/api/signals');
            const data = await res.json();
            if (data.signals) setSignals(data.signals);
        } catch (error) {
            console.error("Error fetching signals", error);
        }
    };

    const publishSignal = async () => {
        if (!pastedImage || !pair) {
            alert('Please provide a pair name and paste an image');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pair: pair.toUpperCase(),
                    type,
                    imageUrl: pastedImage,
                }),
            });

            if (res.ok) {
                alert('Signal Published Successfully! 🚀');
                setPastedImage(null);
                setPair('');
                fetchSignals();
            } else {
                alert('Failed to publish signal');
            }
        } catch (error) {
            console.error(error);
            alert('Error publishing signal');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Access Key"
                            className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition"
                        >
                            Unlock Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6 pb-20" onPaste={handlePaste}>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Signal Master ⚡</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_session');
                            setIsAuthenticated(false);
                        }}
                        className="text-gray-400 hover:text-white"
                    >
                        Logout
                    </button>
                </div>

                {/* Publisher Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                    <h2 className="text-lg font-medium text-gray-300 mb-4">Create New Signal</h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-2">Pair Name</label>
                            <input
                                type="text"
                                value={pair}
                                onChange={(e) => setPair(e.target.value)}
                                placeholder="e.g. XAUUSD"
                                className="w-full bg-black border border-gray-700 text-white rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-2">Signal Type</label>
                            <div className="flex bg-black rounded-xl p-1 border border-gray-700">
                                <button
                                    onClick={() => setType('BUY')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${type === 'BUY' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    BUY 🟢
                                </button>
                                <button
                                    onClick={() => setType('SELL')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${type === 'SELL' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    SELL 🔴
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Area */}
                    <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${pastedImage ? 'border-yellow-500 bg-yellow-500/5' : 'border-gray-700 hover:border-gray-500'}`}
                    >
                        {pastedImage ? (
                            <div className="relative">
                                <img src={pastedImage} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                                <button
                                    onClick={() => setPastedImage(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="py-8">
                                <p className="text-gray-400 mb-2">Click here and press <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">Ctrl + V</span> to paste chart</p>
                                <p className="text-xs text-gray-600">Supports direct clipboard pasting</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={publishSignal}
                        disabled={isLoading || !pastedImage || !pair}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition ${isLoading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:scale-[1.02]'}`}
                    >
                        {isLoading ? 'Publishing...' : '🚀 Publish Signal'}
                    </button>
                </div>

                {/* Recent History */}
                <div className="space-y-4">
                    <h3 className="text-gray-400 font-medium pl-2">Recent Signals</h3>
                    {signals.map((signal) => (
                        <div key={signal._id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between opacity-75 hover:opacity-100 transition">
                            <div className="flex items-center gap-4">
                                <img src={signal.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                                <div>
                                    <h4 className="font-bold text-white">{signal.pair}</h4>
                                    <span className={`text-xs ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{signal.type}</span>
                                </div>
                            </div>
                            <div className="text-gray-500 text-xs">
                                {new Date(signal.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
