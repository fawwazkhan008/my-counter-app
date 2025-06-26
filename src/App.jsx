import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function App() {
  const [count, setCount] = useState(() => {
    const stored = localStorage.getItem('count')
    return stored !== null ? parseInt(stored) : 0
  })

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('mode') || 'unlimited'
  })

  const [maxLimit, setMaxLimit] = useState(() => {
    const stored = localStorage.getItem('maxLimit')
    return stored !== null ? parseInt(stored) : 10
  })

  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('countHistory')
    return stored ? JSON.parse(stored) : []
  })

  const [isLoading, setIsLoading] = useState(true)

  const clickSound = new Audio("/Click.wav")

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('count', count)
  }, [count])

  useEffect(() => {
    localStorage.setItem('mode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('maxLimit', maxLimit)
  }, [maxLimit])

  useEffect(() => {
    localStorage.setItem('countHistory', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const addToHistory = (action) => {
    const timestamp = new Date().toLocaleString()
    const newEntry = { action, value: count, timestamp }
    setHistory((prev) => [newEntry, ...prev].slice(0, 10))
  }

  const handleIncrement = () => {
    if (mode === 'unlimited' || count < maxLimit) {
      clickSound.play()
      setCount((prev) => {
        const newCount = prev + 1
        addToHistory('Increment')
        return newCount
      })
    }
  }

  const handleDecrement = () => {
    if (count > 0) {
      clickSound.play()
      setCount((prev) => {
        const newCount = prev - 1
        addToHistory('Decrement')
        return newCount
      })
    }
  }

  const handleReset = () => {
    clickSound.play()
    setCount(0)
    addToHistory('Reset')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('countHistory')
  }

  // Ring calculation
  const radius = 60
  const stroke = 6
  const normalizedRadius = radius - stroke * 0.5
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = mode === 'limited' ? Math.min(count / maxLimit, 1) : 0
  const strokeDashoffset = circumference - progress * circumference

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
        <motion.div
          className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/lighttheme.png')] dark:bg-[url('/darktheme.png')] bg-cover bg-center transition-colors duration-500 px-4 sm:px-6 md:px-8">

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 dark:text-white text-black p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md text-center relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <img src="/DayNight.png" alt="App Icon" className="w-6 h-6 sm:w-7 sm:h-7" />
            Counter App
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white-500 hover:bg-white-600 px-2 py-1 rounded"
            title="Toggle Theme"
          >
            <motion.img
              src={darkMode ? '/Day.png' : '/Night.png'}
              alt="Theme Toggle"
              className="w-6 h-6 sm:w-7 sm:h-7"
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>

        <div className="mb-4 space-y-2 text-left text-sm sm:text-base">
          <label className="block font-medium">Select Mode:</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="mode"
                value="unlimited"
                checked={mode === 'unlimited'}
                onChange={() => setMode('unlimited')}
              />
              Unlimited
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="mode"
                value="limited"
                checked={mode === 'limited'}
                onChange={() => setMode('limited')}
              />
              Limited
            </label>
          </div>

          {mode === 'limited' && (
            <input
              type="number"
              className="mt-2 p-2 rounded border dark:bg-gray-700 dark:text-white w-full"
              value={maxLimit}
              onChange={(e) => setMaxLimit(Number(e.target.value))}
              min={1}
              placeholder="Enter max limit"
            />
          )}
        </div>

        {/* Counter Display */}
        {mode === 'limited' ? (
          <div className="relative w-36 h-36 mx-auto my-6">
            <svg width="100%" height="100%">
              <circle
                stroke="#ddd"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="50%"
                cy="50%"
              />
              <motion.circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="50%"
                cy="50%"
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
              {count}
            </div>
          </div>
        ) : (
          <motion.p
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            {count}
          </motion.p>
        )}

        <p className="absolute -bottom-6 right-2 text-xs text-gray-400">
          Made with ❤️ by Fawwaz
        </p>

        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mb-4">
          <button
            onClick={handleIncrement}
            disabled={mode === 'limited' && count >= maxLimit}
            className={`px-3 sm:px-4 py-2 rounded-lg text-white ${
              mode === 'limited' && count >= maxLimit
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            title="Increment"
          >
            <img src="/increament.png" alt="Increment" className="inline w-4 h-4 mr-1" /> Increment
          </button>

          <button
            onClick={handleDecrement}
            disabled={count <= 0}
            className={`px-3 sm:px-4 py-2 rounded-lg text-white ${
              count <= 0
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title="Decrement"
          >
            <img src="/decrement.png" alt="Decrement" className="inline w-4 h-4 mr-1" /> Decrement
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-400 hover:bg-gray-500 px-3 sm:px-4 py-2 rounded-lg text-black dark:text-white"
            title="Reset"
          >
            <img src="/reset.png" alt="Reset" className="inline w-4 h-4 mr-1" /> Reset
          </button>

          <button
            onClick={clearHistory}
            className="bg-yellow-500 hover:bg-yellow-600 px-3 sm:px-4 py-2 rounded-lg text-white"
            title="Clear History"
          >
            <img src="/clearHistory_.png" alt="Clear History" className="inline w-4 h-4 mr-1" /> Clear History
          </button>
        </div>

        <div className="text-left mt-6">
          <h2 className="font-semibold mb-2 text-lg underline flex items-center gap-2">
            <img src="/history.png" alt="History" className="w-5 h-5" /> History
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No actions yet.</p>
          ) : (
            <ul className="max-h-40 overflow-y-auto text-sm space-y-1">
              {history.map((item, idx) => (
                <li key={idx}>
                  <span className="font-medium">{item.action} → </span>
                  {item.value} <span className="text-gray-400">({item.timestamp})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default App
