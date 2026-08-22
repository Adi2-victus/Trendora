import React, { useContext, useState, useRef, useEffect } from 'react';
import ai from "../assets/ai.png";
import openSound from "../assets/open.mp3";
import closeSound from "../assets/close.mp3";
import { shopDataContext } from '../context/ShopContext';
import { authDataContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FiSend, 
  FiMic, 
  FiMicOff, 
  FiX, 
  FiVolume2, 
  FiVolumeX, 
  FiTrash2, 
  FiShoppingBag,
  FiArrowRight,
  FiMinimize2
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function Ai() {
  const { products, currency, getCartCount, getCartAmount, delivery_fee, setShowSearch } = useContext(shopDataContext);
  const authContext = useContext(authDataContext);
  const serverUrl = authContext?.serverUrl || "http://localhost:8000";
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hi! I am your **OneCart AI Assistant**. Ask me any query like *'Which hoodie is best?'*, *'Show bestsellers'*, or *'What is in my cart?'*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  // Speech synthesis helper
  const speak = (message) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = message.replace(/\*+/g, '').replace(/#/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.log("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log("Recognition start error:", err);
      }
    }
  };

  const handleToggleOpen = () => {
    if (!isOpen) {
      try { new Audio(openSound).play(); } catch(e){}
    } else {
      try { new Audio(closeSound).play(); } catch(e){}
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (customQuery) => {
    const query = customQuery || inputMsg;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customQuery) setInputMsg("");
    setIsLoading(true);

    const lowerQuery = query.toLowerCase();

    // Check for direct site navigation intent first
    if (lowerQuery.includes("collection") || lowerQuery.includes("collections") || lowerQuery.includes("shop")) {
      navigate("/collection");
      setShowSearch(false);
    } else if (lowerQuery.includes("cart") && (lowerQuery.includes("open") || lowerQuery.includes("go") || lowerQuery.includes("view"))) {
      navigate("/cart");
    } else if (lowerQuery.includes("order") && (lowerQuery.includes("open") || lowerQuery.includes("go") || lowerQuery.includes("view"))) {
      navigate("/order");
    } else if (lowerQuery.includes("about")) {
      navigate("/about");
    } else if (lowerQuery.includes("contact")) {
      navigate("/contact");
    }

    try {
      // Call backend AI query route
      const res = await axios.post(`${serverUrl}/api/ai/chat`, { message: query });
      
      if (res.data?.success) {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.data.response,
          products: res.data.products || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, aiResponse]);
        speak(res.data.response);
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (error) {
      console.log("Backend AI API failed, falling back to local shop context matching:", error.message);
      
      // Client-side Shop Context AI Fallback
      let fallbackText = "";
      let matchedProducts = [];

      const offTopicTerms = [
        "weather", "temperature", "rain", "forecast", "age", "old are you", "protest",
        "politics", "government", "election", "minister", "president", "joke", "story",
        "song", "movie", "actor", "cricket", "football", "sport", "capital of", "math",
        "calculate", "code", "programming", "python", "javascript", "meaning of life",
        "who created", "who won", "news", "neet", "exam", "thought about"
      ];
      const ecomTerms = [
        "product", "products", "item", "items", "hoodie", "hoodies", "sweatshirt", "jacket",
        "shirt", "tshirt", "t-shirt", "pant", "jeans", "trouser", "dress", "topwear", "bottomwear",
        "winterwear", "men", "women", "kids", "kid", "child", "size", "color", "price", "cost",
        "cheap", "expensive", "bestseller", "best seller", "top", "trending", "popular", "recommend",
        "cart", "basket", "buy", "order", "orders", "checkout", "shipping", "delivery", "deliver",
        "delivered", "deliveries", "day", "days", "time", "fee", "rate", "rupee", "rs", "inr", "₹",
        "discount", "offer", "deal", "store", "onecart", "contact", "support", "help", "about",
        "hi", "hello", "hey", "who are you", "what can you do", "welcome", "collection", "collections"
      ];

      const isOffTopic = offTopicTerms.some(t => lowerQuery.includes(t)) || !ecomTerms.some(t => lowerQuery.includes(t));

      if (isOffTopic) {
        fallbackText = "Sorry sir, I am here only to assist with OneCart e-commerce website queries like products, orders, cart, and shopping recommendations!";
        matchedProducts = [];
      }
      else if ((lowerQuery.includes("delivery") || lowerQuery.includes("delivered") || lowerQuery.includes("days") || lowerQuery.includes("time") || lowerQuery.includes("when")) && lowerQuery.includes("hoodie")) {
        matchedProducts = products.filter(p => p.name?.toLowerCase().includes("hoodie") || p.subCategory?.toLowerCase().includes("topwear"));
        fallbackText = `🚚 Orders on OneCart are usually delivered within 3 to 5 business days across India! Also, our Hoodie is one of our Bestsellers on OneCart! ⭐`;
      }
      else if (lowerQuery.includes("hoodie") || lowerQuery.includes("jacket") || lowerQuery.includes("sweatshirt") || lowerQuery.includes("winter")) {
        matchedProducts = products.filter(p => 
          p.name?.toLowerCase().includes("hoodie") || 
          p.subCategory?.toLowerCase().includes("topwear") ||
          p.description?.toLowerCase().includes("hoodie") ||
          p.category?.toLowerCase().includes("men") ||
          p.category?.toLowerCase().includes("women")
        );

        const bestHoodie = matchedProducts.find(p => p.bestseller) || matchedProducts[0];
        if (bestHoodie) {
          fallbackText = `🔥 **${bestHoodie.name}** (${currency}${bestHoodie.price}) is our top recommended hoodie on OneCart! ${bestHoodie.bestseller ? "⭐ It is an official Bestseller!" : ""}`;
        } else {
          matchedProducts = products.slice(0, 3);
          fallbackText = `Here are top recommendations from our collection on OneCart!`;
        }
      } 
      else if (lowerQuery.includes("bestseller") || lowerQuery.includes("popular") || lowerQuery.includes("trending") || lowerQuery.includes("best")) {
        matchedProducts = products.filter(p => p.bestseller);
        if (matchedProducts.length === 0) matchedProducts = products.slice(0, 3);
        fallbackText = `⭐ Here are the top Bestselling items on OneCart right now:`;
      } 
      else if (lowerQuery.includes("cart") || lowerQuery.includes("total") || lowerQuery.includes("price")) {
        const count = getCartCount();
        const amount = getCartAmount();
        fallbackText = `🛒 You currently have **${count}** item(s) in your cart totaling **${currency}${amount}**. (Delivery fee: ${currency}${delivery_fee}).`;
      } 
      else if (lowerQuery.includes("men") || lowerQuery.includes("man")) {
        matchedProducts = products.filter(p => p.category?.toLowerCase() === "men");
        fallbackText = `👔 Top picks from our Men's Collection:`;
      } 
      else if (lowerQuery.includes("women") || lowerQuery.includes("woman") || lowerQuery.includes("ladies")) {
        matchedProducts = products.filter(p => p.category?.toLowerCase() === "women");
        fallbackText = `👗 Top picks from our Women's Collection:`;
      } 
      else {
        fallbackText = "Sorry sir, I am here only to assist with OneCart e-commerce website queries like products, orders, cart, and shopping recommendations!";
        matchedProducts = [];
      }

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: fallbackText,
        products: matchedProducts.slice(0, 3),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      speak(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Chat history reset! Ask me any question about OneCart products, bestsellers, or orders.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestionChips = [
    { label: "🧥 Best Hoodies", query: "Which hoodie is best?" },
    { label: "⭐ Top Bestsellers", query: "Show me top bestsellers" },
    { label: "👔 Men's Collection", query: "Show men's collection" },
    { label: "👗 Women's Collection", query: "Show women's collection" },
    { label: "🛒 My Cart Status", query: "What is in my cart?" },
    { label: "🚚 Shipping Policy", query: "What is the delivery fee?" }
  ];

  return (
    <div className="fixed bottom-5 left-5 z-50 font-sans">
      {/* AI Chatbot Floating Window */}
      {isOpen && (
        <div className="w-[90vw] max-w-[380px] sm:w-[400px] h-[540px] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,210,252,0.25)] flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={ai} alt="OneCart AI" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_#00d2fc]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                  OneCart AI <HiSparkles className="text-cyan-400 text-sm animate-spin" style={{ animationDuration: '4s' }} />
                </h3>
                <p className="text-cyan-300/80 text-xs font-medium">Store Shopping Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-300">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-cyan-400 hover:text-white"
              >
                {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
              <button 
                onClick={handleClearChat} 
                title="Clear Chat"
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
              >
                <FiTrash2 size={16} />
              </button>
              <button 
                onClick={handleToggleOpen} 
                title="Close Assistant"
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips Header Bar */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-3 py-2 flex overflow-x-auto no-scrollbar gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="whitespace-nowrap bg-slate-800/80 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-cyan-200 text-xs px-2.5 py-1 rounded-full transition-all duration-200"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-950/90 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-cyan-300 font-semibold">{part}</strong> : part)}
                  </p>

                  {/* Render Product Cards if available in response */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-2.5">
                      <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                        <FiShoppingBag size={12} /> Recommended Items:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => {
                              navigate(`/productdetail/${item._id}`);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500/60 rounded-xl p-2 cursor-pointer transition-all duration-200 group"
                          >
                            <img
                              src={item.image1 || item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg bg-slate-800 border border-slate-700"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-cyan-400">
                                  {currency}{item.price}
                                </span>
                                {item.bestseller && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-medium">
                                    Bestseller
                                  </span>
                                )}
                              </div>
                            </div>
                            <FiArrowRight className="text-slate-400 group-hover:text-cyan-400 text-sm transition-transform group-hover:translate-x-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block text-right mt-1 opacity-75">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-bl-none px-4 py-3 text-slate-300 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span className="text-xs text-cyan-300 ml-1 font-medium">OneCart AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-full border transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                }`}
                title={isListening ? "Listening... Click to stop" : "Speak your query"}
              >
                {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
              </button>

              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Ask AI (e.g., hoodie recommendations)..."}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={!inputMsg.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Launcher Icon */}
      <div
        onClick={handleToggleOpen}
        className="relative group cursor-pointer"
        title="Open OneCart AI Assistant"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
        <div className="relative bg-slate-900 border-2 border-cyan-400/80 p-2 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95">
          <img
            src={ai}
            alt="OneCart AI"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_12px_#00d2fc]"
          />
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-slate-900 shadow-md">
            AI
          </span>
        </div>
      </div>
    </div>
  );
}

export default Ai;
