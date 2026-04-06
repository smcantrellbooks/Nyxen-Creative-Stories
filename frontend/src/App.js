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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-md"
        data-testid="mobile-menu-button"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-[#0C0C11] border-r border-white/5 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <NyxenLogo className="h-16 w-auto mb-2" />
          <p className="text-xs text-zinc-500 tracking-widest uppercase">AI Storyteller</p>
        </div>

        <nav className="px-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-1 rounded-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`
              }
              data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <p className="text-xs text-zinc-600 text-center">
            Developed by <span className="text-[#D4AF37]">S.M. Cantrell</span>
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

    // Optimistically add user message
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

      // Update messages with AI response
      setMessages(prev => [
        ...prev.filter(m => m.id !== "temp-user"),
        { id: `user-${Date.now()}`, role: "user", content: userMessage, created_at: new Date().toISOString() },
        res.data.message
      ]);

      // Update conversation
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
      <div className="w-72 border-r border-white/5 flex flex-col bg-[#0C0C11]/50 hidden md:flex">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B] transition-colors"
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
              className={`group flex items-center justify-between p-3 mb-1 rounded-sm cursor-pointer transition-all ${
                activeConversation?.id === conv.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
              onClick={() => setActiveConversation(conv)}
              data-testid={`conversation-${conv.id}`}
            >
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-zinc-500">{conv.genre || "Story"}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
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
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass">
          <div>
            <h2 className="font-serif text-lg text-zinc-100">
              {activeConversation?.title || "New Story Session"}
            </h2>
            <p className="text-xs text-zinc-500">Your creative companion awaits</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-[#14141A] border border-white/10 rounded-sm px-3 py-1.5 text-sm text-zinc-300 focus:border-[#D4AF37] focus:outline-none"
              data-testid="genre-select"
            >
              <option value="fantasy">Fantasy</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
              <option value="scifi">Sci-Fi</option>
            </select>
            
            <div className="flex items-center gap-1 bg-[#14141A] rounded-sm p-0.5">
              <button
                onClick={() => setMode("fast")}
                className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
                  mode === "fast" ? "bg-[#D4AF37] text-black" : "text-zinc-400"
                }`}
                data-testid="mode-fast-btn"
              >
                <Zap size={12} className="inline mr-1" />
                Fast
              </button>
              <button
                onClick={() => setMode("deep")}
                className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
                  mode === "deep" ? "bg-[#D4AF37] text-black" : "text-zinc-400"
                }`}
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
              <NyxenLogo className="h-24 w-auto mb-6 opacity-50" />
              <h3 className="font-serif text-2xl text-zinc-300 mb-2">Welcome, storyteller</h3>
              <p className="text-zinc-500 max-w-md">
                Share a prompt, a scene, or an idea. Let's weave something extraordinary together.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {["Tell me a fantasy adventure", "Write a romantic meet-cute", "Create a thriller opening", "Describe a sci-fi world"].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-4 py-2 text-sm text-zinc-400 border border-white/10 rounded-sm hover:border-[#D4AF37]/50 hover:text-zinc-200 transition-all"
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
                  className={`max-w-3xl px-5 py-4 rounded-sm ${
                    msg.role === "user"
                      ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-zinc-200"
                      : "bg-[#14141A] border border-white/5 text-zinc-300"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                      <Sparkles size={14} className="text-[#D4AF37]" />
                      <span className="text-xs text-[#D4AF37] font-medium">Nyxen</span>
                    </div>
                  )}
                  <div className="story-content whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#14141A] border border-white/5 px-5 py-4 rounded-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-[#D4AF37]" size={18} />
                  <span className="text-zinc-400 text-sm">Nyxen is crafting your story...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 glass-elevated rounded-sm p-2">
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
                className="flex-1 bg-transparent border-none resize-none text-zinc-200 placeholder-zinc-500 focus:outline-none min-h-[60px] max-h-[200px] p-2"
                rows={2}
                data-testid="chat-input"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 bg-[#D4AF37] text-black rounded-sm hover:bg-[#F0C84B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <h1 className="font-serif text-4xl lg:text-5xl text-zinc-50 mb-2">Story Generator</h1>
        <p className="text-zinc-500">Craft original stories across any genre with Nyxen's assistance.</p>
      </div>

      {/* Genre Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {["fantasy", "romance", "thriller", "scifi"].map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`relative h-32 rounded-sm overflow-hidden group transition-all ${
              genre === g ? "ring-2 ring-[#D4AF37]" : "ring-1 ring-white/10"
            }`}
            data-testid={`genre-card-${g}`}
          >
            <img 
              src={GENRE_IMAGES[g]} 
              alt={g}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute bottom-3 left-3 font-serif text-lg capitalize text-white">
              {g === "scifi" ? "Sci-Fi" : g}
            </span>
          </button>
        ))}
      </div>

      {/* Mode and Input */}
      <div className="bg-[#0C0C11] border border-white/5 rounded-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-zinc-400">Mode:</span>
          <div className="flex items-center gap-1 bg-[#14141A] rounded-sm p-0.5">
            <button
              onClick={() => setMode("fast")}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                mode === "fast" ? "bg-[#D4AF37] text-black font-medium" : "text-zinc-400"
              }`}
              data-testid="story-mode-fast"
            >
              <Zap size={14} className="inline mr-1" />
              Fast (~400 words)
            </button>
            <button
              onClick={() => setMode("deep")}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                mode === "deep" ? "bg-[#D4AF37] text-black font-medium" : "text-zinc-400"
              }`}
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
          className="w-full h-32 bg-[#14141A] border border-white/10 rounded-sm p-4 text-zinc-200 placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none"
          data-testid="story-prompt-input"
        />

        <button
          onClick={generateStory}
          disabled={isGenerating || !prompt.trim()}
          className="mt-4 px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
        <div className="bg-[#0C0C11] border border-white/5 rounded-sm p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-zinc-100">Your Story</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={generateImage}
                disabled={isGeneratingImage}
                className="px-4 py-2 border border-white/10 rounded-sm text-sm text-zinc-300 hover:border-[#D4AF37]/50 hover:text-white transition-all flex items-center gap-2"
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
                className="w-full max-w-2xl rounded-sm border border-white/10"
              />
            </div>
          )}
          
          <div className="story-content text-zinc-300 whitespace-pre-wrap leading-relaxed">
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
        <h1 className="font-serif text-4xl lg:text-5xl text-zinc-50 mb-2">Story Bible</h1>
        <p className="text-zinc-500">Manage your characters, worlds, and story elements for consistent storytelling.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Characters Section - Large */}
        <div className="md:col-span-8 bg-[#0C0C11] border border-white/5 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-zinc-100 flex items-center gap-2">
              <Users size={24} className="text-[#D4AF37]" />
              Characters
            </h2>
            <button
              onClick={() => setShowCharacterModal(true)}
              className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B] transition-colors flex items-center gap-2"
              data-testid="add-character-btn"
            >
              <Plus size={16} />
              Add Character
            </button>
          </div>

          {characters.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">No characters yet. Create your first character to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="group bg-[#14141A] border border-white/5 rounded-sm p-4 hover:border-[#D4AF37]/30 transition-all"
                  data-testid={`character-card-${char.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg text-zinc-100">{char.name}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCharacter(char);
                          setNewCharacter(char);
                          setShowCharacterModal(true);
                        }}
                        className="p-1 text-zinc-400 hover:text-[#D4AF37]"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={() => deleteCharacter(char.id)}
                        className="p-1 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{char.description}</p>
                  {char.traits && char.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {char.traits.slice(0, 3).map((trait, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-[#D4AF37]/10 text-[#D4AF37] rounded-sm">
                          {trait}
                        </span>
                      ))}
                      {char.traits.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-zinc-500">+{char.traits.length - 3} more</span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-zinc-500">
                      Emotional state: <span className="text-zinc-400">{char.emotional_state}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Section - Smaller */}
        <div className="md:col-span-4 bg-[#0C0C11] border border-white/5 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-zinc-100 flex items-center gap-2">
              <Palette size={20} className="text-[#D4AF37]" />
              World Building
            </h2>
            <button
              onClick={() => setShowSettingModal(true)}
              className="p-2 bg-[#D4AF37] text-black rounded-sm hover:bg-[#F0C84B] transition-colors"
              data-testid="add-setting-btn"
            >
              <Plus size={16} />
            </button>
          </div>

          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Palette size={36} className="mx-auto text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">Add locations, timelines, and more.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="group bg-[#14141A] border border-white/5 rounded-sm p-3 hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-[#D4AF37] uppercase tracking-wider">{setting.type}</span>
                      <h4 className="font-serif text-zinc-100">{setting.name}</h4>
                    </div>
                    <button
                      onClick={() => deleteSetting(setting.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {setting.description && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{setting.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Story Bible Background */}
        <div className="md:col-span-12 relative h-48 rounded-sm overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1692742593455-79d81616196a"
            alt="Story Bible"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-transparent to-[#050507]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-serif text-3xl text-zinc-100 mb-2">Your Story Universe</h3>
              <p className="text-zinc-400">Characters: {characters.length} | Settings: {settings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Character Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14141A] border border-white/10 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-serif text-2xl text-zinc-100">
                {editingCharacter ? "Edit Character" : "Create Character"}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Character name"
                  data-testid="character-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none resize-none"
                  placeholder="Brief description of the character"
                  data-testid="character-description-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Traits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={traitInput}
                    onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTrait()}
                    className="flex-1 bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Add a trait and press Enter"
                    data-testid="character-trait-input"
                  />
                  <button
                    onClick={addTrait}
                    className="px-4 py-2 bg-[#D4AF37] text-black rounded-sm hover:bg-[#F0C84B]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCharacter.traits.map((trait, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-sm">
                      {trait}
                      <button onClick={() => removeTrait(i)} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Backstory</label>
                <textarea
                  value={newCharacter.backstory}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, backstory: e.target.value }))}
                  className="w-full h-32 bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none resize-none"
                  placeholder="Character's history and background"
                  data-testid="character-backstory-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Speech Patterns</label>
                <input
                  type="text"
                  value={newCharacter.speech_patterns}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, speech_patterns: e.target.value }))}
                  className="w-full bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
                  placeholder="e.g., Formal speech, uses contractions, has an accent"
                  data-testid="character-speech-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Emotional State</label>
                <select
                  value={newCharacter.emotional_state}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, emotional_state: e.target.value }))}
                  className="w-full bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
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
            
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCharacterModal(false);
                  setEditingCharacter(null);
                  setNewCharacter({
                    name: "", description: "", traits: [], backstory: "",
                    relationships: {}, speech_patterns: "", emotional_state: "neutral"
                  });
                }}
                className="px-4 py-2 border border-white/10 text-zinc-300 rounded-sm hover:border-white/30"
              >
                Cancel
              </button>
              <button
                onClick={saveCharacter}
                className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B]"
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
          <div className="bg-[#14141A] border border-white/10 rounded-sm w-full max-w-md">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-serif text-2xl text-zinc-100">Add World Element</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Type</label>
                <select
                  value={newSetting.type}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
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
                <label className="block text-sm text-zinc-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={newSetting.name}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Element name"
                  data-testid="setting-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 bg-[#0C0C11] border border-white/10 rounded-sm px-4 py-2 text-zinc-200 focus:border-[#D4AF37] focus:outline-none resize-none"
                  placeholder="Describe this world element"
                  data-testid="setting-description-input"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  setNewSetting({ name: "", type: "location", description: "", details: {} });
                }}
                className="px-4 py-2 border border-white/10 text-zinc-300 rounded-sm hover:border-white/30"
              >
                Cancel
              </button>
              <button
                onClick={saveSetting}
                className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B]"
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
        <h1 className="font-serif text-4xl lg:text-5xl text-zinc-50 mb-2">Media Gallery</h1>
        <p className="text-zinc-500">Generate and browse images and videos inspired by your stories.</p>
      </div>

      {/* Generation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Image Generation */}
        <div className="bg-[#0C0C11] border border-white/5 rounded-sm p-6">
          <h3 className="font-serif text-xl text-zinc-100 flex items-center gap-2 mb-4">
            <Image size={20} className="text-[#D4AF37]" />
            Generate Image
          </h3>
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Describe the scene you want to visualize..."
            className="w-full h-24 bg-[#14141A] border border-white/10 rounded-sm px-4 py-3 text-zinc-200 placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none mb-4"
            data-testid="image-prompt-input"
          />
          <button
            onClick={generateImage}
            disabled={isGeneratingImage || !imagePrompt.trim()}
            className="w-full px-4 py-3 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
        <div className="bg-[#0C0C11] border border-white/5 rounded-sm p-6">
          <h3 className="font-serif text-xl text-zinc-100 flex items-center gap-2 mb-4">
            <Video size={20} className="text-[#D4AF37]" />
            Generate Video
          </h3>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Describe the scene with motion..."
            className="w-full h-24 bg-[#14141A] border border-white/10 rounded-sm px-4 py-3 text-zinc-200 placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none mb-4"
            data-testid="video-prompt-input"
          />
          <button
            onClick={generateVideo}
            disabled={isGeneratingVideo || !videoPrompt.trim()}
            className="w-full px-4 py-3 bg-[#D4AF37] text-black font-semibold rounded-sm hover:bg-[#F0C84B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12">
          <Image size={64} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500">No media generated yet. Create your first image or video above.</p>
        </div>
      ) : (
        <>
          {/* Images Section */}
          {images.length > 0 && (
            <div className="mb-12">
              <h3 className="font-serif text-2xl text-zinc-100 mb-6 flex items-center gap-2">
                <Image size={24} className="text-[#D4AF37]" />
                Images ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-sm overflow-hidden cursor-pointer border border-white/5 hover:border-[#D4AF37]/30 transition-all"
                    onClick={() => setSelectedMedia(item)}
                    data-testid={`image-${item.id}`}
                  >
                    <img 
                      src={item.url} 
                      alt={item.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs text-zinc-300 line-clamp-2">{item.prompt}</p>
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
              <h3 className="font-serif text-2xl text-zinc-100 mb-6 flex items-center gap-2">
                <Video size={24} className="text-[#D4AF37]" />
                Videos ({videos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-video rounded-sm overflow-hidden border border-white/5 hover:border-[#D4AF37]/30 transition-all"
                    data-testid={`video-${item.id}`}
                  >
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <div className="p-3 bg-[#0C0C11]">
                      <p className="text-xs text-zinc-400 line-clamp-1">{item.prompt}</p>
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
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
            />
            <p className="text-zinc-400 text-sm mt-4 text-center">{selectedMedia.prompt}</p>
          </div>
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
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
    <div className="min-h-screen bg-[#050507]">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#14141A',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F4F4F5'
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
