import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  Image, 
  Video, 
  Volume2, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  ChevronRight, 
  Loader2,
  Settings,
  Palette,
  Clock,
  Zap
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color Constants
const COLORS = {
  gradientStart: '#b8966a',
  gradientEnd: '#662a69',
  headerBg: '#d8b588',
  appFont: '#F7F2FF',
  primaryFont: '#000000',
  cardBg: '#C8B2EE',
  borderAccent: '#321860',
  buttonBg: '#0A1551',
  buttonText: '#FFFFFF',
  logoBg: '#412A69',
  iconBg: '#695A2A',
  iconColor: '#F7F2FF',
};

// Nyxen Logo Component
const NyxenLogo = ({ className = "h-12 w-auto" }) => (
  <img 
    src="https://cdn1.site-media.eu/images/0/24605435/NyxenLogo-HC7dR0B8dpqO3kUw00D6eg.png" 
    alt="Nyxen" 
    className={className}
  />
);

// Genre Images
const GENRE_IMAGES = {
  romance: "https://images.pexels.com/photos/11741360/pexels-photo-11741360.jpeg",
  fantasy: "https://images.pexels.com/photos/207130/pexels-photo-207130.jpeg",
  thriller: "https://images.pexels.com/photos/3772353/pexels-photo-3772353.jpeg",
  scifi: "https://images.unsplash.com/photo-1687985826611-80b714011d0b"
};

// Navigation Component
const Navigation = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { path: "/", icon: MessageSquare, label: "Chat" },
    { path: "/story", icon: BookOpen, label: "Story Generator" },
    { path: "/story-bible", icon: Users, label: "Story Bible" },
    { path: "/gallery", icon: Image, label: "Gallery" }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md"
        style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}
        data-testid="mobile-menu-button"
      >
        {sidebarOpen ? <X size={24} color={COLORS.primaryFont} /> : <Menu size={24} color={COLORS.primaryFont} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ 
          background: `linear-gradient(180deg, ${COLORS.gradientStart} 0%, ${COLORS.gradientEnd} 100%)`,
          borderRight: `2px solid ${COLORS.borderAccent}`
        }}
      >
        <div className="p-6" style={{ background: COLORS.logoBg }}>
          <NyxenLogo className="h-16 w-auto mb-2" />
          <p className="text-xs tracking-widest uppercase" style={{ color: COLORS.appFont }}>AI Storyteller</p>
        </div>

        <nav className="px-3 py-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200`
              }
              style={({ isActive }) => ({
                background: isActive ? COLORS.cardBg : 'transparent',
                color: isActive ? COLORS.primaryFont : COLORS.appFont,
                border: isActive ? `2px solid ${COLORS.borderAccent}` : '2px solid transparent',
              })}
              data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <div 
                className="p-1.5 rounded"
                style={{ 
                  background: COLORS.iconBg,
                  color: COLORS.iconColor
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${COLORS.borderAccent}40` }}>
          <p className="text-xs text-center" style={{ color: COLORS.appFont }}>
            Developed by <span style={{ color: COLORS.cardBg }}>S.M. Cantrell</span>
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

// Chat Page
const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [genre, setGenre] = useState("fantasy");
  const [mode, setMode] = useState("deep");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/conversations`);
      setConversations(res.data);
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await axios.get(`${API}/conversations/${conversationId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    const tempUserMsg = {
      id: "temp-user",
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await axios.post(`${API}/chat`, {
        conversation_id: activeConversation?.id || null,
        message: userMessage,
        genre,
        mode
      });

      setMessages(prev => [
        ...prev.filter(m => m.id !== "temp-user"),
        { id: `user-${Date.now()}`, role: "user", content: userMessage, created_at: new Date().toISOString() },
        res.data.message
      ]);

      if (!activeConversation) {
        const convRes = await axios.get(`${API}/conversations/${res.data.conversation_id}`);
        setActiveConversation(convRes.data);
        fetchConversations();
      }
    } catch (e) {
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== "temp-user"));
    } finally {
      setIsLoading(false);
    }
  };

  const newConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const deleteConversation = async (id) => {
    try {
      await axios.delete(`${API}/conversations/${id}`);
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
      fetchConversations();
      toast.success("Conversation deleted");
    } catch (e) {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex h-full" data-testid="chat-page">
      {/* Conversation Sidebar */}
      <div 
        className="w-72 flex flex-col hidden md:flex"
        style={{ 
          background: `${COLORS.cardBg}40`,
          borderRight: `2px solid ${COLORS.borderAccent}`
        }}
      >
        <div className="p-4" style={{ borderBottom: `2px solid ${COLORS.borderAccent}` }}>
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition-all hover:opacity-90"
            style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
            data-testid="new-conversation-btn"
          >
            <Plus size={18} />
            New Story
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-all`}
              style={{ 
                background: activeConversation?.id === conv.id ? COLORS.cardBg : 'transparent',
                color: activeConversation?.id === conv.id ? COLORS.primaryFont : COLORS.appFont,
                border: activeConversation?.id === conv.id ? `2px solid ${COLORS.borderAccent}` : '2px solid transparent'
              }}
              onClick={() => setActiveConversation(conv)}
              data-testid={`conversation-${conv.id}`}
            >
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs opacity-70">{conv.genre || "Story"}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                data-testid={`delete-conversation-${conv.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div 
          className="h-16 flex items-center justify-between px-6"
          style={{ background: COLORS.headerBg, borderBottom: `2px solid ${COLORS.borderAccent}` }}
        >
          <div>
            <h2 className="font-serif text-lg" style={{ color: COLORS.primaryFont }}>
              {activeConversation?.title || "New Story Session"}
            </h2>
            <p className="text-xs" style={{ color: COLORS.primaryFont, opacity: 0.7 }}>Your creative companion awaits</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ 
                background: COLORS.cardBg, 
                color: COLORS.primaryFont,
                border: `2px solid ${COLORS.borderAccent}`
              }}
              data-testid="genre-select"
            >
              <option value="fantasy">Fantasy</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
              <option value="scifi">Sci-Fi</option>
            </select>
            
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
              <button
                onClick={() => setMode("fast")}
                className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium"
                style={{ 
                  background: mode === "fast" ? COLORS.buttonBg : 'transparent',
                  color: mode === "fast" ? COLORS.buttonText : COLORS.primaryFont
                }}
                data-testid="mode-fast-btn"
              >
                <Zap size={12} className="inline mr-1" />
                Fast
              </button>
              <button
                onClick={() => setMode("deep")}
                className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium"
                style={{ 
                  background: mode === "deep" ? COLORS.buttonBg : 'transparent',
                  color: mode === "deep" ? COLORS.buttonText : COLORS.primaryFont
                }}
                data-testid="mode-deep-btn"
              >
                <Clock size={12} className="inline mr-1" />
                Deep
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-xl mb-6" style={{ background: COLORS.logoBg }}>
                <NyxenLogo className="h-20 w-auto" />
              </div>
              <h3 className="font-serif text-2xl mb-2" style={{ color: COLORS.appFont }}>Welcome, storyteller</h3>
              <p className="max-w-md" style={{ color: COLORS.appFont, opacity: 0.8 }}>
                Share a prompt, a scene, or an idea. Let's weave something extraordinary together.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {["Tell me a fantasy adventure", "Write a romantic meet-cute", "Create a thriller opening", "Describe a sci-fi world"].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-4 py-2 text-sm rounded-lg transition-all hover:scale-105"
                    style={{ 
                      background: COLORS.cardBg,
                      color: COLORS.primaryFont,
                      border: `2px solid ${COLORS.borderAccent}`
                    }}
                    data-testid={`suggestion-${i}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className="max-w-3xl px-5 py-4 rounded-lg"
                  style={{
                    background: msg.role === "user" ? COLORS.headerBg : COLORS.cardBg,
                    color: COLORS.primaryFont,
                    border: `2px solid ${COLORS.borderAccent}`
                  }}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: `1px solid ${COLORS.borderAccent}40` }}>
                      <Sparkles size={14} style={{ color: COLORS.borderAccent }} />
                      <span className="text-xs font-medium" style={{ color: COLORS.borderAccent }}>Nyxen</span>
                    </div>
                  )}
                  <div className="story-content whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-5 py-4 rounded-lg" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={18} style={{ color: COLORS.borderAccent }} />
                  <span className="text-sm" style={{ color: COLORS.primaryFont }}>Nyxen is crafting your story...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4" style={{ background: COLORS.headerBg, borderTop: `2px solid ${COLORS.borderAccent}` }}>
          <div className="max-w-4xl mx-auto">
            <div 
              className="flex items-end gap-3 rounded-lg p-2"
              style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}
            >
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Share your story idea, describe a scene, or ask for writing help..."
                className="flex-1 bg-transparent border-none resize-none focus:outline-none min-h-[60px] max-h-[200px] p-2"
                style={{ color: COLORS.primaryFont }}
                rows={2}
                data-testid="chat-input"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
                data-testid="send-message-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Story Generator Page
const StoryGeneratorPage = () => {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("fantasy");
  const [mode, setMode] = useState("deep");
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateStory = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setStory("");
    
    try {
      const res = await axios.post(`${API}/story/generate`, { prompt, genre, mode });
      setStory(res.data.story);
      toast.success("Story generated successfully!");
    } catch (e) {
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!story || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    
    try {
      const imagePrompt = `${genre} scene: ${prompt.slice(0, 200)}`;
      const res = await axios.post(`${API}/image/generate`, { prompt: imagePrompt });
      setGeneratedImage(res.data.url);
      toast.success("Image generated!");
    } catch (e) {
      toast.error("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto" data-testid="story-generator-page">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl mb-2" style={{ color: COLORS.appFont }}>Story Generator</h1>
        <p style={{ color: COLORS.appFont, opacity: 0.8 }}>Craft original stories across any genre with Nyxen's assistance.</p>
      </div>

      {/* Genre Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {["fantasy", "romance", "thriller", "scifi"].map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className="relative h-32 rounded-lg overflow-hidden group transition-all"
            style={{ 
              border: genre === g ? `3px solid ${COLORS.borderAccent}` : `2px solid ${COLORS.cardBg}`,
              boxShadow: genre === g ? `0 0 20px ${COLORS.borderAccent}40` : 'none'
            }}
            data-testid={`genre-card-${g}`}
          >
            <img 
              src={GENRE_IMAGES[g]} 
              alt={g}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute bottom-3 left-3 font-serif text-lg capitalize" style={{ color: COLORS.appFont }}>
              {g === "scifi" ? "Sci-Fi" : g}
            </span>
          </button>
        ))}
      </div>

      {/* Mode and Input */}
      <div className="rounded-lg p-6 mb-6" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium" style={{ color: COLORS.primaryFont }}>Mode:</span>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: COLORS.headerBg }}>
            <button
              onClick={() => setMode("fast")}
              className="px-4 py-2 text-sm rounded-md transition-colors font-medium"
              style={{ 
                background: mode === "fast" ? COLORS.buttonBg : 'transparent',
                color: mode === "fast" ? COLORS.buttonText : COLORS.primaryFont
              }}
              data-testid="story-mode-fast"
            >
              <Zap size={14} className="inline mr-1" />
              Fast (~400 words)
            </button>
            <button
              onClick={() => setMode("deep")}
              className="px-4 py-2 text-sm rounded-md transition-colors font-medium"
              style={{ 
                background: mode === "deep" ? COLORS.buttonBg : 'transparent',
                color: mode === "deep" ? COLORS.buttonText : COLORS.primaryFont
              }}
              data-testid="story-mode-deep"
            >
              <Clock size={14} className="inline mr-1" />
              Deep (800-1200 words)
            </button>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your story idea... A dragon who befriends a lonely baker, a detective uncovering ancient secrets, star-crossed lovers in a cyberpunk city..."
          className="w-full h-32 rounded-lg p-4 focus:outline-none resize-none"
          style={{ 
            background: COLORS.headerBg,
            color: COLORS.primaryFont,
            border: `2px solid ${COLORS.borderAccent}`
          }}
          data-testid="story-prompt-input"
        />

        <button
          onClick={generateStory}
          disabled={isGenerating || !prompt.trim()}
          className="mt-4 px-6 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
          data-testid="generate-story-btn"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Story
            </>
          )}
        </button>
      </div>

      {/* Generated Story */}
      {story && (
        <div className="rounded-lg p-8 animate-fade-in-up" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl" style={{ color: COLORS.primaryFont }}>Your Story</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={generateImage}
                disabled={isGeneratingImage}
                className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                data-testid="generate-image-btn"
              >
                {isGeneratingImage ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Image size={14} />
                )}
                Generate Image
              </button>
            </div>
          </div>
          
          {generatedImage && (
            <div className="mb-6">
              <img 
                src={generatedImage} 
                alt="Generated scene" 
                className="w-full max-w-2xl rounded-lg"
                style={{ border: `2px solid ${COLORS.borderAccent}` }}
              />
            </div>
          )}
          
          <div className="story-content whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.primaryFont }}>
            {story}
          </div>
        </div>
      )}
    </div>
  );
};

// Story Bible Page
const StoryBiblePage = () => {
  const [characters, setCharacters] = useState([]);
  const [settings, setSettings] = useState([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    traits: [],
    backstory: "",
    relationships: {},
    speech_patterns: "",
    emotional_state: "neutral"
  });
  const [newSetting, setNewSetting] = useState({
    name: "",
    type: "location",
    description: "",
    details: {}
  });
  const [traitInput, setTraitInput] = useState("");

  useEffect(() => {
    fetchCharacters();
    fetchSettings();
  }, []);

  const fetchCharacters = async () => {
    try {
      const res = await axios.get(`${API}/characters`);
      setCharacters(res.data);
    } catch (e) {
      console.error("Failed to fetch characters", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/story-settings`);
      setSettings(res.data);
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  };

  const saveCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    try {
      if (editingCharacter) {
        await axios.put(`${API}/characters/${editingCharacter.id}`, newCharacter);
        toast.success("Character updated");
      } else {
        await axios.post(`${API}/characters`, newCharacter);
        toast.success("Character created");
      }
      fetchCharacters();
      setShowCharacterModal(false);
      setEditingCharacter(null);
      setNewCharacter({
        name: "",
        description: "",
        traits: [],
        backstory: "",
        relationships: {},
        speech_patterns: "",
        emotional_state: "neutral"
      });
    } catch (e) {
      toast.error("Failed to save character");
    }
  };

  const deleteCharacter = async (id) => {
    try {
      await axios.delete(`${API}/characters/${id}`);
      fetchCharacters();
      toast.success("Character deleted");
    } catch (e) {
      toast.error("Failed to delete character");
    }
  };

  const saveSetting = async () => {
    if (!newSetting.name.trim()) {
      toast.error("Setting name is required");
      return;
    }

    try {
      await axios.post(`${API}/story-settings`, newSetting);
      toast.success("Setting created");
      fetchSettings();
      setShowSettingModal(false);
      setNewSetting({ name: "", type: "location", description: "", details: {} });
    } catch (e) {
      toast.error("Failed to save setting");
    }
  };

  const deleteSetting = async (id) => {
    try {
      await axios.delete(`${API}/story-settings/${id}`);
      fetchSettings();
      toast.success("Setting deleted");
    } catch (e) {
      toast.error("Failed to delete setting");
    }
  };

  const addTrait = () => {
    if (traitInput.trim()) {
      setNewCharacter(prev => ({
        ...prev,
        traits: [...prev.traits, traitInput.trim()]
      }));
      setTraitInput("");
    }
  };

  const removeTrait = (index) => {
    setNewCharacter(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 lg:p-12" data-testid="story-bible-page">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl mb-2" style={{ color: COLORS.appFont }}>Story Bible</h1>
        <p style={{ color: COLORS.appFont, opacity: 0.8 }}>Manage your characters, worlds, and story elements for consistent storytelling.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Characters Section - Large */}
        <div className="md:col-span-8 rounded-lg p-6" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl flex items-center gap-2" style={{ color: COLORS.primaryFont }}>
              <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
                <Users size={20} style={{ color: COLORS.iconColor }} />
              </div>
              Characters
            </h2>
            <button
              onClick={() => setShowCharacterModal(true)}
              className="px-4 py-2 font-semibold rounded-lg transition-colors flex items-center gap-2"
              style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
              data-testid="add-character-btn"
            >
              <Plus size={16} />
              Add Character
            </button>
          </div>

          {characters.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4" style={{ color: COLORS.borderAccent, opacity: 0.5 }} />
              <p style={{ color: COLORS.primaryFont, opacity: 0.7 }}>No characters yet. Create your first character to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="group rounded-lg p-4 transition-all hover:shadow-lg"
                  style={{ background: COLORS.headerBg, border: `2px solid ${COLORS.borderAccent}` }}
                  data-testid={`character-card-${char.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg" style={{ color: COLORS.primaryFont }}>{char.name}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCharacter(char);
                          setNewCharacter(char);
                          setShowCharacterModal(true);
                        }}
                        className="p-1 hover:opacity-70"
                        style={{ color: COLORS.borderAccent }}
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={() => deleteCharacter(char.id)}
                        className="p-1 hover:text-red-500"
                        style={{ color: COLORS.primaryFont }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.primaryFont, opacity: 0.8 }}>{char.description}</p>
                  {char.traits && char.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {char.traits.slice(0, 3).map((trait, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded" style={{ background: COLORS.borderAccent, color: COLORS.appFont }}>
                          {trait}
                        </span>
                      ))}
                      {char.traits.length > 3 && (
                        <span className="px-2 py-0.5 text-xs" style={{ color: COLORS.primaryFont, opacity: 0.6 }}>+{char.traits.length - 3} more</span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.borderAccent}40` }}>
                    <span className="text-xs" style={{ color: COLORS.primaryFont, opacity: 0.7 }}>
                      Emotional state: <span style={{ opacity: 1 }}>{char.emotional_state}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Section - Smaller */}
        <div className="md:col-span-4 rounded-lg p-6" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl flex items-center gap-2" style={{ color: COLORS.primaryFont }}>
              <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
                <Palette size={16} style={{ color: COLORS.iconColor }} />
              </div>
              World Building
            </h2>
            <button
              onClick={() => setShowSettingModal(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
              data-testid="add-setting-btn"
            >
              <Plus size={16} />
            </button>
          </div>

          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Palette size={36} className="mx-auto mb-3" style={{ color: COLORS.borderAccent, opacity: 0.5 }} />
              <p className="text-sm" style={{ color: COLORS.primaryFont, opacity: 0.7 }}>Add locations, timelines, and more.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="group rounded-lg p-3 transition-all"
                  style={{ background: COLORS.headerBg, border: `2px solid ${COLORS.borderAccent}` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-medium" style={{ color: COLORS.borderAccent }}>{setting.type}</span>
                      <h4 className="font-serif" style={{ color: COLORS.primaryFont }}>{setting.name}</h4>
                    </div>
                    <button
                      onClick={() => deleteSetting(setting.id)}
                      className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: COLORS.primaryFont }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {setting.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: COLORS.primaryFont, opacity: 0.7 }}>{setting.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Story Bible Background */}
        <div className="md:col-span-12 relative h-48 rounded-lg overflow-hidden" style={{ border: `2px solid ${COLORS.borderAccent}` }}>
          <img 
            src="https://images.unsplash.com/photo-1692742593455-79d81616196a"
            alt="Story Bible"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div 
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, ${COLORS.gradientStart}CC, transparent, ${COLORS.gradientEnd}CC)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-serif text-3xl mb-2" style={{ color: COLORS.appFont }}>Your Story Universe</h3>
              <p style={{ color: COLORS.appFont, opacity: 0.9 }}>Characters: {characters.length} | Settings: {settings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Character Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
            <div className="p-6" style={{ borderBottom: `2px solid ${COLORS.borderAccent}` }}>
              <h3 className="font-serif text-2xl" style={{ color: COLORS.primaryFont }}>
                {editingCharacter ? "Edit Character" : "Create Character"}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Name *</label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="Character name"
                  data-testid="character-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Description</label>
                <textarea
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 rounded-lg px-4 py-2 focus:outline-none resize-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="Brief description of the character"
                  data-testid="character-description-input"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Traits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={traitInput}
                    onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTrait()}
                    className="flex-1 rounded-lg px-4 py-2 focus:outline-none"
                    style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                    placeholder="Add a trait and press Enter"
                    data-testid="character-trait-input"
                  />
                  <button
                    onClick={addTrait}
                    className="px-4 py-2 rounded-lg"
                    style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCharacter.traits.map((trait, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 text-sm rounded" style={{ background: COLORS.borderAccent, color: COLORS.appFont }}>
                      {trait}
                      <button onClick={() => removeTrait(i)} className="hover:text-red-300">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Backstory</label>
                <textarea
                  value={newCharacter.backstory}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, backstory: e.target.value }))}
                  className="w-full h-32 rounded-lg px-4 py-2 focus:outline-none resize-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="Character's history and background"
                  data-testid="character-backstory-input"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Speech Patterns</label>
                <input
                  type="text"
                  value={newCharacter.speech_patterns}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, speech_patterns: e.target.value }))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="e.g., Formal speech, uses contractions, has an accent"
                  data-testid="character-speech-input"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Emotional State</label>
                <select
                  value={newCharacter.emotional_state}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, emotional_state: e.target.value }))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  data-testid="character-emotional-state-select"
                >
                  <option value="neutral">Neutral</option>
                  <option value="happy">Happy</option>
                  <option value="sad">Sad</option>
                  <option value="angry">Angry</option>
                  <option value="fearful">Fearful</option>
                  <option value="conflicted">Conflicted</option>
                  <option value="determined">Determined</option>
                  <option value="hopeful">Hopeful</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 flex justify-end gap-3" style={{ borderTop: `2px solid ${COLORS.borderAccent}` }}>
              <button
                onClick={() => {
                  setShowCharacterModal(false);
                  setEditingCharacter(null);
                  setNewCharacter({
                    name: "", description: "", traits: [], backstory: "",
                    relationships: {}, speech_patterns: "", emotional_state: "neutral"
                  });
                }}
                className="px-4 py-2 rounded-lg"
                style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
              >
                Cancel
              </button>
              <button
                onClick={saveCharacter}
                className="px-4 py-2 font-semibold rounded-lg"
                style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
                data-testid="save-character-btn"
              >
                {editingCharacter ? "Update" : "Create"} Character
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setting Modal */}
      {showSettingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
            <div className="p-6" style={{ borderBottom: `2px solid ${COLORS.borderAccent}` }}>
              <h3 className="font-serif text-2xl" style={{ color: COLORS.primaryFont }}>Add World Element</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Type</label>
                <select
                  value={newSetting.type}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  data-testid="setting-type-select"
                >
                  <option value="location">Location</option>
                  <option value="timeline">Timeline</option>
                  <option value="organization">Organization</option>
                  <option value="magic_system">Magic System</option>
                  <option value="technology">Technology</option>
                  <option value="culture">Culture</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Name *</label>
                <input
                  type="text"
                  value={newSetting.name}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="Element name"
                  data-testid="setting-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: COLORS.primaryFont }}>Description</label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 rounded-lg px-4 py-2 focus:outline-none resize-none"
                  style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
                  placeholder="Describe this world element"
                  data-testid="setting-description-input"
                />
              </div>
            </div>
            
            <div className="p-6 flex justify-end gap-3" style={{ borderTop: `2px solid ${COLORS.borderAccent}` }}>
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  setNewSetting({ name: "", type: "location", description: "", details: {} });
                }}
                className="px-4 py-2 rounded-lg"
                style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
              >
                Cancel
              </button>
              <button
                onClick={saveSetting}
                className="px-4 py-2 font-semibold rounded-lg"
                style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
                data-testid="save-setting-btn"
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Gallery Page
const GalleryPage = () => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await axios.get(`${API}/media`);
      setMedia(res.data);
    } catch (e) {
      console.error("Failed to fetch media", e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    try {
      await axios.post(`${API}/image/generate`, { prompt: imagePrompt });
      toast.success("Image generated!");
      fetchMedia();
      setImagePrompt("");
    } catch (e) {
      toast.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    
    setIsGeneratingVideo(true);
    toast.info("Video generation started. This may take a few minutes...");
    try {
      await axios.post(`${API}/video/generate`, { prompt: videoPrompt });
      toast.success("Video generated!");
      fetchMedia();
      setVideoPrompt("");
    } catch (e) {
      toast.error("Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const images = media.filter(m => m.type === "image");
  const videos = media.filter(m => m.type === "video");

  return (
    <div className="p-6 lg:p-12" data-testid="gallery-page">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl mb-2" style={{ color: COLORS.appFont }}>Media Gallery</h1>
        <p style={{ color: COLORS.appFont, opacity: 0.8 }}>Generate and browse images and videos inspired by your stories.</p>
      </div>

      {/* Generation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Image Generation */}
        <div className="rounded-lg p-6" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
          <h3 className="font-serif text-xl flex items-center gap-2 mb-4" style={{ color: COLORS.primaryFont }}>
            <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
              <Image size={16} style={{ color: COLORS.iconColor }} />
            </div>
            Generate Image
          </h3>
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Describe the scene you want to visualize..."
            className="w-full h-24 rounded-lg px-4 py-3 focus:outline-none resize-none mb-4"
            style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
            data-testid="image-prompt-input"
          />
          <button
            onClick={generateImage}
            disabled={isGeneratingImage || !imagePrompt.trim()}
            className="w-full px-4 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
            data-testid="generate-image-gallery-btn"
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Video Generation */}
        <div className="rounded-lg p-6" style={{ background: COLORS.cardBg, border: `2px solid ${COLORS.borderAccent}` }}>
          <h3 className="font-serif text-xl flex items-center gap-2 mb-4" style={{ color: COLORS.primaryFont }}>
            <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
              <Video size={16} style={{ color: COLORS.iconColor }} />
            </div>
            Generate Video
          </h3>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Describe the scene with motion..."
            className="w-full h-24 rounded-lg px-4 py-3 focus:outline-none resize-none mb-4"
            style={{ background: COLORS.headerBg, color: COLORS.primaryFont, border: `2px solid ${COLORS.borderAccent}` }}
            data-testid="video-prompt-input"
          />
          <button
            onClick={generateVideo}
            disabled={isGeneratingVideo || !videoPrompt.trim()}
            className="w-full px-4 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            style={{ background: COLORS.buttonBg, color: COLORS.buttonText }}
            data-testid="generate-video-btn"
          >
            {isGeneratingVideo ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={32} style={{ color: COLORS.borderAccent }} />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12">
          <Image size={64} className="mx-auto mb-4" style={{ color: COLORS.borderAccent, opacity: 0.5 }} />
          <p style={{ color: COLORS.appFont, opacity: 0.7 }}>No media generated yet. Create your first image or video above.</p>
        </div>
      ) : (
        <>
          {/* Images Section */}
          {images.length > 0 && (
            <div className="mb-12">
              <h3 className="font-serif text-2xl mb-6 flex items-center gap-2" style={{ color: COLORS.appFont }}>
                <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
                  <Image size={20} style={{ color: COLORS.iconColor }} />
                </div>
                Images ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
                    style={{ border: `2px solid ${COLORS.borderAccent}` }}
                    onClick={() => setSelectedMedia(item)}
                    data-testid={`image-${item.id}`}
                  >
                    <img 
                      src={item.url} 
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs line-clamp-2" style={{ color: COLORS.appFont }}>{item.prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl mb-6 flex items-center gap-2" style={{ color: COLORS.appFont }}>
                <div className="p-1.5 rounded" style={{ background: COLORS.iconBg }}>
                  <Video size={20} style={{ color: COLORS.iconColor }} />
                </div>
                Videos ({videos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-video rounded-lg overflow-hidden"
                    style={{ border: `2px solid ${COLORS.borderAccent}` }}
                    data-testid={`video-${item.id}`}
                  >
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <div className="p-3" style={{ background: COLORS.cardBg }}>
                      <p className="text-xs line-clamp-1" style={{ color: COLORS.primaryFont }}>{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Media Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedMedia.url} 
              alt={selectedMedia.prompt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              style={{ border: `2px solid ${COLORS.borderAccent}` }}
            />
            <p className="text-sm mt-4 text-center" style={{ color: COLORS.appFont }}>{selectedMedia.prompt}</p>
          </div>
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2"
            style={{ color: COLORS.appFont }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

// Main App
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart} 0%, ${COLORS.gradientEnd} 100%)` }}
    >
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: COLORS.cardBg,
            border: `2px solid ${COLORS.borderAccent}`,
            color: COLORS.primaryFont
          }
        }}
      />
      <BrowserRouter>
        <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="lg:ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/story" element={<StoryGeneratorPage />} />
            <Route path="/story-bible" element={<StoryBiblePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
