import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Search, 
  Trash2, 
  Check, 
  Settings, 
  QrCode, 
  LogOut, 
  Download, 
  Sparkles, 
  PlusCircle, 
  User, 
  Phone, 
  UserCheck, 
  ListOrdered, 
  Plus, 
  Minus, 
  Lock, 
  Sliders, 
  Cloud, 
  CloudOff, 
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { Guest, Wedding, ViewRole } from './types';

// Resolve NMC Logo asset dynamically for seamless build compatibility
const nmcLogo = new URL('./NMC logo.jpg', import.meta.url).href;

// Safe creation function to handle raw user settings or env configs
const createSupabaseInstance = (url?: string, key?: string) => {
  const finalUrl = url || (window as any).env?.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const finalKey = key || (window as any).env?.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  if (finalUrl && finalKey && finalUrl.startsWith('http')) {
    try {
      return createClient(finalUrl, finalKey);
    } catch (e) {
      console.warn("Supabase initialization failed:", e);
    }
  }
  return null;
};

// Seed initial mockup data in localStorage for frictionless first-run preview
const SEED_WEDDINGS: Wedding[] = [
  {
    id: "w1-bunthoeun-sreyneth",
    title: "មង្គលការ ប៊ុនធឿន & ស្រីនាថ",
    host_username: "bunthoeun",
    host_password: "love123",
    khqr_img_url: "https://i.ibb.co/h7nN2kC/qr-code-placeholder.png", // ImgBB styled KHQR mock
    created_at: new Date().toISOString()
  },
  {
    id: "w2-sokha-sreymao",
    title: "ពិធីភ្ជាប់ពាក្យ សុខា & ស្រីម៉ៅ",
    host_username: "sokha",
    host_password: "engagement123",
    khqr_img_url: "https://i.ibb.co/h7nN2kC/qr-code-placeholder.png",
    created_at: new Date().toISOString()
  }
];

const SEED_GUESTS: Guest[] = [
  {
    id: "g1",
    wedding_id: "w1-bunthoeun-sreyneth",
    name: "ឈន សុភ័ក្រ",
    phone: "012345678",
    companions: 1,
    relation_type: "groom_side",
    amount: 50,
    note: "សូមជូនពរឱ្យស្រលាញ់គ្នាដល់ចាស់កោងខ្នង និងឆាប់មានបុត្រ!",
    status: "approved",
    created_at: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: "g2",
    wedding_id: "w1-bunthoeun-sreyneth",
    name: "ស៊ិន សំអាត",
    phone: "098765432",
    companions: 2,
    relation_type: "bride_side",
    amount: 100,
    note: "ជូនពរឱ្យមានសុភមង្គល និងសុខភាពល្អ និងរកស៊ីមានបាន!",
    status: "approved",
    created_at: new Date(Date.now() - 28000000).toISOString()
  },
  {
    id: "g3",
    wedding_id: "w1-bunthoeun-sreyneth",
    name: "លី ម៉េងហួរ",
    phone: "085555666",
    companions: 0,
    relation_type: "friends",
    amount: 40,
    note: "រីករាយថ្ងៃអាពាហ៍ពិពាហ៍ក្លើ!",
    status: "pending",
    created_at: new Date().toISOString()
  },
  {
    id: "g4",
    wedding_id: "w1-bunthoeun-sreyneth",
    name: "ម៉ៅ វាសនា",
    phone: "077123456",
    companions: 3,
    relation_type: "others",
    amount: 150,
    note: "សូមរក្សាស្រឡាញ់ស្មោះអស់មួយជីវិត។ ជូនពរពីបងប្អូនជីដូនមួយ!",
    status: "approved",
    created_at: new Date(Date.now() - 14000000).toISOString()
  },
  {
    id: "g5",
    wedding_id: "w1-bunthoeun-sreyneth",
    name: "កែវ សុជាតា",
    phone: "093556677",
    companions: 1,
    relation_type: "friends",
    amount: 30,
    note: "Congratulations to the beautiful couple!",
    status: "pending",
    created_at: new Date().toISOString()
  },
  {
    id: "g6",
    wedding_id: "w2-sokha-sreymao",
    name: "ហេង វិសាល",
    phone: "015443322",
    companions: 1,
    relation_type: "friends",
    amount: 60,
    note: "ជូនពរឱ្យឆាប់បានចូលរោងការឆាប់ៗ!",
    status: "approved",
    created_at: new Date().toISOString()
  }
];

export default function App() {
  // Connection states
  const [dbConfig, setDbConfig] = useState(() => {
    const savedUrl = localStorage.getItem('supabase_url') || '';
    const savedKey = localStorage.getItem('supabase_key') || '';
    return { url: savedUrl, key: savedKey };
  });
  const [supabase, setSupabase] = useState(() => createSupabaseInstance(dbConfig.url, dbConfig.key));
  const [showConfig, setShowConfig] = useState(false);
  const [connMessage, setConnMessage] = useState<string | null>(null);

  // Core App states
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [activeRole, setActiveRole] = useState<ViewRole>('guest');
  
  // Active selected entities
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  
  // Auth states
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [hostLoggedIn, setHostLoggedIn] = useState(false);
  const [loggedInHostWeddingId, setLoggedInHostWeddingId] = useState<string | null>(null);

  // Form states (Guest View)
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    companions: 0,
    relation_type: 'groom_side' as Guest['relation_type'],
    amount: '',
    note: ''
  });
  const [guestSubmitStatus, setGuestSubmitStatus] = useState<'idle' | 'success' | 'checking'>('idle');

  // New Wedding states (Admin Tool)
  const [newWeddingForm, setNewWeddingForm] = useState({
    title: '',
    host_username: '',
    host_password: '',
    khqr_img_url: 'https://i.ibb.co/h7nN2kC/qr-code-placeholder.png' // Default placeholder imgBB link
  });
  const [adminAddGuestForm, setAdminAddGuestForm] = useState({
    name: '',
    phone: '',
    companions: 0,
    relation_type: 'groom_side' as Guest['relation_type'],
    amount: '',
    note: '',
    status: 'approved' as 'pending' | 'approved'
  });
  const [showAdminAddManual, setShowAdminAddManual] = useState(false);
  const [adminWeddingFilter, setAdminWeddingFilter] = useState('');

  // Search & Filter state for Admin / Host Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [relationFilter, setRelationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Input states for Logins
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [hostUsernameInput, setHostUsernameInput] = useState('');
  const [hostPasswordInput, setHostPasswordInput] = useState('');
  const [hostError, setHostError] = useState('');

  // Load and sync database
  useEffect(() => {
    const fetchAll = async () => {
      // 1. Try Live Supabase
      if (supabase) {
        try {
          // If connection is verified, fetch live data
          const { data: weddingsData, error: wError } = await supabase
            .from('weddings')
            .select('*')
            .order('created_at', { ascending: false });

          const { data: guestsData, error: gError } = await supabase
            .from('guests')
            .select('*')
            .order('created_at', { ascending: false });

          if (!wError && !gError) {
            setWeddings(weddingsData || []);
            setGuests(guestsData || []);
            if (weddingsData && weddingsData.length > 0 && !selectedWeddingId) {
              setSelectedWeddingId(weddingsData[0].id);
            }
            return; // Successfully fetched from Supabase!
          } else {
            console.warn("Supabase query returned errors, falling back to local simulation.", { wError, gError });
          }
        } catch (e) {
          console.error("Supabase load error, falling back locally:", e);
        }
      }

      // 2. Local Fallback Database
      const localWeddings = localStorage.getItem('local_weddings');
      const localGuests = localStorage.getItem('local_guests');

      if (localWeddings && localGuests) {
        const parsedW = JSON.parse(localWeddings);
        const parsedG = JSON.parse(localGuests);
        setWeddings(parsedW);
        setGuests(parsedG);
        if (parsedW.length > 0 && !selectedWeddingId) {
          setSelectedWeddingId(parsedW[0].id);
        }
      } else {
        // First-run seed
        localStorage.setItem('local_weddings', JSON.stringify(SEED_WEDDINGS));
        localStorage.setItem('local_guests', JSON.stringify(SEED_GUESTS));
        setWeddings(SEED_WEDDINGS);
        setGuests(SEED_GUESTS);
        setSelectedWeddingId(SEED_WEDDINGS[0].id);
      }
    };

    fetchAll();
  }, [supabase]);

  // Re-instantiate Supabase when dbConfig updates
  const handleSaveConfig = (url: string, key: string) => {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    setDbConfig({ url, key });
    
    // Attempt initialization
    const client = createSupabaseInstance(url, key);
    if (client) {
      setSupabase(client);
      setConnMessage("កំពុងភ្ជាប់ទៅកាន់ Supabase...");
      setTimeout(() => {
        setConnMessage("ភ្ជាប់ជោគជ័យជាមួយ Supabase Cloud!");
        setTimeout(() => setConnMessage(null), 3000);
      }, 1000);
    } else {
      setSupabase(null);
      setConnMessage("បានផ្តាច់ការភ្ជាប់ ឬព័ត៌មានមិនត្រឹមត្រូវ។ ដំណើរការរបៀប Simulation local ។");
      setTimeout(() => setConnMessage(null), 4000);
    }
    setShowConfig(false);
  };

  const clearConfig = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    setDbConfig({ url: '', key: '' });
    setSupabase(null);
    setConnMessage("បានត្រឡប់ទៅការប្រើប្រាស់ Database ក្នុងកម្មវិធី (Local Simulation)");
    setTimeout(() => setConnMessage(null), 3500);
    setShowConfig(false);
  };

  // -----------------------------------------------------
  // GENERIC DATA OPERATIONS (Handles offline/online automatically)
  // -----------------------------------------------------

  // Create Guest
  const addGuest = async (newGuest: Omit<Guest, 'id' | 'created_at'>) => {
    const tempId = crypto.randomUUID();
    const guestObj: Guest = {
      ...newGuest,
      id: tempId,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('guests').insert([newGuest]);
        if (!error) {
          // Push to state
          setGuests(prev => [guestObj, ...prev]);
          return true;
        }
        console.error("Supabase insert error:", error);
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback: local
    const updated = [guestObj, ...guests];
    setGuests(updated);
    localStorage.setItem('local_guests', JSON.stringify(updated));
    return true;
  };

  // Change Guest status
  const approveGuest = async (guestId: string) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('guests')
          .update({ status: 'approved' })
          .eq('id', guestId);
        if (!error) {
          setGuests(prev => prev.map(g => g.id === guestId ? { ...g, status: 'approved' } : g));
          return;
        }
      } catch(e) {
        console.error(e);
      }
    }

    const updated = guests.map(g => g.id === guestId ? { ...g, status: 'approved' as const } : g);
    setGuests(updated);
    localStorage.setItem('local_guests', JSON.stringify(updated));
  };

  // Delete Guest
  const deleteGuest = async (guestId: string) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបភ្ញៀវម្នាក់នេះមែនទេ?")) return;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', guestId);
        if (!error) {
          setGuests(prev => prev.filter(g => g.id !== guestId));
          return;
        }
      } catch(e) {
        console.error(e);
      }
    }

    const updated = guests.filter(g => g.id !== guestId);
    setGuests(updated);
    localStorage.setItem('local_guests', JSON.stringify(updated));
  };

  // Create Wedding Event
  const addWedding = async (newW: Omit<Wedding, 'id' | 'created_at'>) => {
    const tempId = crypto.randomUUID();
    const wObj: Wedding = {
      ...newW,
      id: tempId,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('weddings').insert([newW]);
        if (!error) {
          setWeddings(prev => [wObj, ...prev]);
          return true;
        }
        console.error("Supabase list add error:", error);
      } catch (e) {
        console.error(e);
      }
    }

    const updated = [wObj, ...weddings];
    setWeddings(updated);
    localStorage.setItem('local_weddings', JSON.stringify(updated));
    return true;
  };

  // -----------------------------------------------------
  // ACTIONS / HANDLING SUBMISSIONS
  // -----------------------------------------------------

  // Guest submission code
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return alert("សូមបញ្ចូលឈ្មោះភ្ញៀវ");
    if (!guestForm.phone.trim()) return alert("សូមបញ្ចូលលេខទូរស័ព្ទ");
    if (!selectedWeddingId) return alert("សូមជ្រើសរើសពិធីមង្គលការ");

    setGuestSubmitStatus('checking');

    const success = await addGuest({
      wedding_id: selectedWeddingId,
      name: guestForm.name,
      phone: guestForm.phone,
      companions: guestForm.companions,
      relation_type: guestForm.relation_type,
      amount: Number(guestForm.amount) || 0,
      note: guestForm.note,
      status: 'pending' // default submission status is pending
    });

    if (success) {
      setGuestSubmitStatus('success');
      // Reset
      setGuestForm({
        name: '',
        phone: '',
        companions: 0,
        relation_type: 'groom_side',
        amount: '',
        note: ''
      });
    } else {
      setGuestSubmitStatus('idle');
      alert("មានបញ្ហាក្នុងការចុះឈ្មោះ សូមព្យាយាមម្តងទៀត");
    }
  };

  // Admin credentials check ('admins' table)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin123' && adminPassword === 'password123') {
      setAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError("ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!");
    }
  };

  // Host credentials check ('weddings' table)
  const handleHostLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Search within weddings list
    const match = weddings.find(
      w => w.host_username.toLowerCase() === hostUsernameInput.toLowerCase() && 
           w.host_password === hostPasswordInput
    );

    if (match) {
      setHostLoggedIn(true);
      setLoggedInHostWeddingId(match.id);
      setHostError('');
    } else {
      setHostError("គណនី ឬពាក្យសម្ងាត់ម្ចាស់មង្គលការមិនត្រឹមត្រូវឡើយ!");
    }
  };

  const handleAdminAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAddGuestForm.name.trim() || !adminAddGuestForm.phone.trim()) {
      alert("សូមបំពេញឈ្មោះ និងលេខទូរស័ព្ទ");
      return;
    }
    const targetWId = adminWeddingFilter || selectedWeddingId;
    if (!targetWId) {
      alert("សូមជ្រើសរើស ឬកំណត់កម្មវិធីមង្គលការ");
      return;
    }

    const success = await addGuest({
      wedding_id: targetWId,
      name: adminAddGuestForm.name,
      phone: adminAddGuestForm.phone,
      companions: adminAddGuestForm.companions,
      relation_type: adminAddGuestForm.relation_type,
      amount: Number(adminAddGuestForm.amount) || 0,
      note: adminAddGuestForm.note,
      status: adminAddGuestForm.status
    });

    if (success) {
      setShowAdminAddManual(false);
      setAdminAddGuestForm({
        name: '',
        phone: '',
        companions: 0,
        relation_type: 'groom_side',
        amount: '',
        note: '',
        status: 'approved'
      });
    }
  };

  const handleAddNewWeddingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeddingForm.title.trim() || !newWeddingForm.host_username.trim() || !newWeddingForm.host_password.trim()) {
      alert("សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់");
      return;
    }

    const success = await addWedding({
      title: newWeddingForm.title,
      host_username: newWeddingForm.host_username,
      host_password: newWeddingForm.host_password,
      khqr_img_url: newWeddingForm.khqr_img_url || 'https://i.ibb.co/h7nN2kC/qr-code-placeholder.png'
    });

    if (success) {
      alert("បានបង្កើតកម្មវិធីមង្គលការថ្មីដោយជោគជ័យ!");
      setNewWeddingForm({
        title: '',
        host_username: '',
        host_password: '',
        khqr_img_url: 'https://i.ibb.co/h7nN2kC/qr-code-placeholder.png'
      });
    }
  };

  // Convert relation key to Khmer string
  const getRelationKhmer = (type: Guest['relation_type']) => {
    switch(type) {
      case 'groom_side': return 'ខាងកូនកំលោះ';
      case 'bride_side': return 'ខាងកូនក្រមុំ';
      case 'friends': return 'មិត្តភក្តិ';
      case 'others': return 'ផ្សេងៗ';
      default: return type;
    }
  };

  // Filter lists based on role and filters chosen
  const currentWedding = weddings.find(w => w.id === selectedWeddingId);

  // Admin guest filtering
  const filteredGuestsForAdmin = guests.filter(g => {
    const matchWedding = adminWeddingFilter ? g.wedding_id === adminWeddingFilter : g.wedding_id === selectedWeddingId;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.phone.includes(searchQuery);
    const matchRelation = relationFilter === 'all' ? true : g.relation_type === relationFilter;
    const matchStatus = statusFilter === 'all' ? true : g.status === statusFilter;
    return matchWedding && matchSearch && matchRelation && matchStatus;
  });

  // Host view data (Locked to their specific logged in wedding)
  const hostWedding = weddings.find(w => w.id === loggedInHostWeddingId);
  const hostGuests = guests.filter(g => g.wedding_id === loggedInHostWeddingId);
  const filteredGuestsForHost = hostGuests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.phone.includes(searchQuery);
    const matchRelation = relationFilter === 'all' ? true : g.relation_type === relationFilter;
    return matchSearch && matchRelation;
  });

  // Host statistics
  const approvedGuestsOnly = hostGuests.filter(g => g.status === 'approved');
  const countRegistered = hostGuests.length; // Over-all signed up
  const countActualAttendees = approvedGuestsOnly.reduce((sum, g) => sum + 1 + g.companions, 0);
  const sumGiftMoney = approvedGuestsOnly.reduce((sum, g) => sum + (g.amount || 0), 0);

  // Export host list to Excel with SheetJS
  const handleExportExcel = () => {
    if (!loggedInHostWeddingId) return;
    
    // Prepare Khmer columns data
    const exportData = hostGuests.map((g, idx) => ({
      'ល.រ': idx + 1,
      'ឈ្មោះភ្ញៀវ': g.name,
      'លេខទូរស័ព្ទ': g.phone,
      'ចំនួនអ្នកមកជាមួយ': g.companions,
      'ប្រភេទទំនាក់ទំនង': getRelationKhmer(g.relation_type),
      'ប្រាក់ចងដៃ (USD)': g.amount ? `$${g.amount}` : '$0',
      'កំណត់សម្គាល់': g.note || '-',
      'ស្ថានភាពអនុម័ត': g.status === 'approved' ? 'បានអនុម័ត' : 'កំពុងរង់ចាំ',
      'ថ្ងៃចុះឈ្មោះ': new Date(g.created_at || '').toLocaleDateString('km-KH')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "បញ្ជីភ្ញៀវ");
    
    // Set column widths
    const max_len = exportData.reduce((prev: number, next: any) => {
      return Math.max(prev, next['ឈ្មោះភ្ញៀវ'].length, next['លេខទូរស័ព្ទ'].length);
    }, 15);
    ws['!cols'] = [
      { wch: 6 },
      { wch: max_len + 4 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 }
    ];

    const fileName = `${hostWedding?.title || 'បញ្ជីផ្ទះអាពាហ៍ពិពាហ៍'}_Guests`;
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[#fdf2f8]" id="wedding-app-root">
      
      {/* Dynamic Status / Banner Alert */}
      {connMessage && (
        <div className="bg-emerald-600 text-white text-center py-2 px-4 font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-md text-sm z-50">
          <Cloud className="animate-bounce" size={16} />
          {connMessage}
        </div>
      )}

      {/* Header with Romantic Style */}
      <header className="bg-white border-b border-pink-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Title Block matching the Bento Design Logo Area */}
            <div className="flex items-center gap-3">
              <img 
                src={nmcLogo} 
                alt="NMC Logo" 
                className="w-[48px] h-[48px] object-contain rounded-[10px]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-[18px] font-bold text-[#db2777] leading-tight flex items-center gap-2">
                  {currentWedding ? currentWedding.title : "មង្គលការ លីដា & សុភ័ក្ត្រ"}
                </h1>
                <p className="text-[12px] text-slate-500">ប្រព័ន្ធគ្រប់គ្រងភ្ញៀវមង្គលការ</p>
              </div>
            </div>

            {/* Config & DB State indicator & Active view badge */}
            <div className="flex items-center gap-3.5 flex-wrap justify-center">
              <div className="bg-[#fce7f3] text-[#be185d] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {activeRole === 'guest' ? 'ទំព័រភ្ញៀវ (Guest)' : activeRole === 'admin' ? 'គណៈកម្មការ (Admin)' : 'ម្ចាស់ដើមការ (Host View)'}
              </div>

              <div 
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                  supabase 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-pink-50 text-[#be185d] border-pink-200 hover:bg-pink-100'
                }`}
                title="ចុចដើម្បីកំណត់ Supabase Real DB"
              >
                {supabase ? <Cloud size={14} /> : <CloudOff size={14} />}
                <span>{supabase ? "Supabase Cloud" : "Local Mode (រក្សាទុកក្នុងម៉ាស៊ីន)"}</span>
                <Settings size={12} className="ml-0.5 animate-spin-slow text-slate-400" />
              </div>
            </div>

          </div>

          {/* Navigation Controls Role bar styled neatly under header */}
          <div className="flex items-center justify-center border-t border-pink-100 mt-3 pt-3 gap-2 md:gap-4 flex-wrap">
            <button
              id="role-tab-guest"
              onClick={() => setActiveRole('guest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeRole === 'guest'
                  ? 'bg-[#db2777] text-white shadow-md'
                  : 'text-slate-600 hover:bg-pink-50 hover:text-[#db2777]'
              }`}
            >
              <Heart size={16} />
              <span>ទំព័រសម្រាប់ភ្ញៀវ (Public Guest)</span>
            </button>

            <button
              id="role-tab-admin"
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeRole === 'admin'
                  ? 'bg-[#db2777] text-white shadow-md'
                  : 'text-slate-600 hover:bg-pink-50 hover:text-[#db2777]'
              }`}
            >
              <Sliders size={16} />
              <span>គណៈកម្មការ (Admin View)</span>
            </button>

            <button
              id="role-tab-host"
              onClick={() => setActiveRole('host')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeRole === 'host'
                  ? 'bg-[#db2777] text-white shadow-md'
                  : 'text-slate-600 hover:bg-pink-50 hover:text-[#db2777]'
              }`}
            >
              <ClipboardList size={16} />
              <span>ម្ចាស់មង្គលការ (Host Dashboard)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Database configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-rose-100 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Settings className="text-rose-500 animate-spin" size={20} />
              កំណត់ការតភ្ជាប់ Supabase Backend Database
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              អ្នកអាចភ្ជាប់កម្មវិធីនេះទៅកាន់ Supabase Database ផ្ទាល់ខ្លួនរបស់អ្នកបាន ដើម្បីរក្សាទុកទិន្នន័យជាក់ស្តែង។ 
              សូមចុះឈ្មោះគណនី Supabase រៀបចំតារាង SQL (ប្រើ script SQL ខាងក្រោម) រួចចម្លង URL និង Anon Key មកដាក់ខាងក្រោម៖
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SUPABASE_URL</label>
                <input 
                  type="text" 
                  value={dbConfig.url} 
                  onChange={(e) => setDbConfig({...dbConfig, url: e.target.value})}
                  placeholder="https://your-project.supabase.co"
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SUPABASE_ANON_KEY</label>
                <textarea 
                  value={dbConfig.key} 
                  onChange={(e) => setDbConfig({...dbConfig, key: e.target.value})}
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9..."
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => handleSaveConfig(dbConfig.url, dbConfig.key)}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl py-2 text-xs font-bold hover:shadow-lg shadow-rose-200 transition-all"
              >
                រក្សាទុក និងភ្ជាប់ (Save & Connect)
              </button>
              <button 
                type="button"
                onClick={clearConfig}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                លុបចោល/ប្រើ Local
              </button>
              <button 
                type="button"
                onClick={() => setShowConfig(false)}
                className="border hover:bg-slate-50 text-slate-500 rounded-xl px-4 py-2 text-xs font-medium"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* ========================================================
            VIEW 1: PUBLIC GUEST VIEW
            ======================================================== */}
        {activeRole === 'guest' && (
          <div className="max-w-4xl mx-auto space-y-6" id="guest-public-view">
            
            {/* Wedding selection header */}
            <div className="bg-white rounded-[20px] p-5 border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-[#db2777] border border-pink-100">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-0.5">សូមជ្រើសរើសពិធីមង្គលការ / Please Select Wedding:</label>
                  <select
                    value={selectedWeddingId}
                    onChange={(e) => {
                      setSelectedWeddingId(e.target.value);
                      setGuestSubmitStatus('idle');
                    }}
                    className="bg-white border border-pink-200 text-slate-850 text-base font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {weddings.length === 0 ? (
                      <option value="">(គ្មាកម្មវិធីអាពាហ៍ពិពាហ៍)</option>
                    ) : (
                      weddings.map(w => (
                        <option key={w.id} value={w.id}>{w.title}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="text-center md:text-right bg-pink-50/50 rounded-2xl px-4 py-2.5 border border-pink-100">
                <span className="text-xs text-[#be185d] font-semibold flex items-center justify-center md:justify-end gap-1">
                  <Sparkles size={12} className="animate-spin-slow" />
                  ស្វាគមន៍ការស្កេនចូលរួមតាមរយៈ QR Code
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">បំពេញព័ត៌មាន និងផ្ញើសារជូនពរដល់គូស្វាមីភរិយាថ្មី</p>
              </div>
            </div>

            {guestSubmitStatus === 'success' ? (
              // Success Screen after registry
              <div className="bg-white rounded-[20px] p-8 border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] text-center space-y-4 max-w-lg mx-auto py-12 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-4 border-emerald-100">
                  <CheckCircle2 size={44} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">ស្វាគមន៍ការចុះឈ្មោះបានជោគជ័យ!</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium px-4">
                    ព័ត៌មានរបស់អ្នកត្រូវបានបញ្ជូនរួចហើយ។ សូមរង់ចាំគណៈកម្មការ ឬអ្នកចាត់ចែងក្នុងសាលពិធីត្រវត្តពិនិត្យ និងអនុម័ត (Approve) ចូលក្នុងតារាងកម្មវិធី។
                  </p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => setGuestSubmitStatus('idle')}
                    className="px-6 py-2.5 bg-[#db2777] text-white font-bold rounded-xl text-xs hover:bg-[#be185d] hover:shadow-md transition-all cursor-pointer"
                  >
                    ចុះឈ្មោះភ្ញៀវបន្ថែមទៀត
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Form screen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Form Registration Block */}
                <div className="bg-white rounded-[20px] border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                  <div className="p-5 bg-gradient-to-r from-[#db2777] to-pink-500 text-white flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">ទម្រង់ចុះឈ្មោះភ្ញៀវកិត្តិយស</h2>
                      <p className="text-xs text-pink-100 font-medium">សូមបំពេញព័ត៌មានខាងក្រោម</p>
                    </div>
                    <Sparkles className="animate-pulse" size={24} />
                  </div>

                  <form onSubmit={handleGuestSubmit} className="p-6 space-y-5 flex-grow">
                    {/* Guest Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ឈ្មោះភ្ញៀវ (ស្វាមី/ភរិយា ឬឈ្មោះពេញ) <span className="text-pink-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <User size={16} />
                        </span>
                        <input
                          type="text"
                          required
                          value={guestForm.name}
                          onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                          placeholder="ឧទាហរណ៍៖ លោក សុខ ជា និងភរិយា"
                          className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>

                    {/* Phone number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        លេខទូរស័ព្ទតភ្ជាប់ <span className="text-pink-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          required
                          value={guestForm.phone}
                          onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                          placeholder="ឧទាហរណ៍៖ 012 345 678"
                          className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>

                    {/* Relation buttons selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ប្រភេទទំនាក់ទំនងជាមួយសាមីខ្លួន
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'groom_side', label: 'ខាងកូនកំលោះ' },
                          { key: 'bride_side', label: 'ខាងកូនក្រមុំ' },
                          { key: 'friends', label: 'មិត្តភក្តិ' },
                          { key: 'others', label: 'ផ្សេងៗ' }
                        ].map((btn) => (
                          <button
                            type="button"
                            key={btn.key}
                            onClick={() => setGuestForm({...guestForm, relation_type: btn.key as Guest['relation_type']})}
                            className={`border py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              guestForm.relation_type === btn.key
                                ? 'bg-[#db2777] text-white border-pink-600 hover:bg-[#be185d]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Companions counter */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ចំនួនអ្នកមកជាមួយបន្ថែម (មិនគិតសាមីខ្លួន)
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 max-w-[200px]">
                        <button
                          type="button"
                          onClick={() => setGuestForm({...guestForm, companions: Math.max(0, guestForm.companions - 1)})}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-grow text-center text-sm font-bold text-slate-800">
                          {guestForm.companions} នាក់
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuestForm({...guestForm, companions: guestForm.companions + 1})}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Gift Amount in USD */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ចំនួនប្រាក់ចងដៃ (ប្រាក់ដុល្លារអាមេរិក USD)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          value={guestForm.amount}
                          onChange={(e) => setGuestForm({...guestForm, amount: e.target.value})}
                          placeholder="ឧទាហរណ៍៖ 50 (ទុកទំនេរ ប្រសិនបើមិនទាក់ទង)"
                          className="w-full text-sm pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>

                    {/* Notes & Wishes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        សារជូនពរ ឬកំណត់សម្គាល់ (Wishes & Notes)
                      </label>
                      <textarea
                        value={guestForm.note}
                        onChange={(e) => setGuestForm({...guestForm, note: e.target.value})}
                        rows={2}
                        placeholder="សូមជូនពរឱ្យសាមីខ្លួនទាំងពីរជួបតែសុភមង្គល..."
                        className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={guestSubmitStatus === 'checking'}
                      className="w-full mt-4 bg-gradient-to-r from-[#db2777] to-pink-500 hover:from-[#be185d] hover:to-pink-600 text-white font-bold rounded-xl py-3 text-sm shadow-md shadow-pink-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {guestSubmitStatus === 'checking' ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>កំពុងចុះឈ្មោះ...</span>
                        </>
                      ) : (
                        <>
                          <Heart size={16} className="fill-current" />
                          <span>រក្សាទុកព័ត៌មាន និងចុះឈ្មោះ</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Digital Payment & QR slide card matching bento qr-card */}
                <div className="bg-[#1e293b] text-white rounded-[20px] border border-slate-800 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-6 flex flex-col justify-between overflow-hidden relative" id="khqr-preview-card">
                  {/* Backdrop glowing decorations */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl -z-10" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                        <QrCode size={12} />
                        កូដ KHQR សម្រាប់ទទួលប្រាក់
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">មង្គលការទូទាត់រហ័ស</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-100">
                        {currentWedding ? currentWedding.title : "កម្មវិធីអាពាហ៍ពិពាហ៍គំរូ"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        សូមលោកអ្នកស្កេនកូដ KHQR ខាងក្រោមដើម្បីផ្ញើចងដៃជូនសាមីខ្លួន។
                      </p>
                    </div>

                    <div className="flex justify-center py-4 bg-white/5 rounded-2xl border border-white/10">
                      <img 
                        src={currentWedding ? currentWedding.khqr_img_url : 'https://i.ibb.co/h7nN2kC/qr-code-placeholder.png'} 
                        alt="KHQR Code" 
                        referrerPolicy="no-referrer"
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 text-center text-xs text-[#94a3b8] font-medium">
                    ស្កេនទូទាត់ប្រាក់ចងដៃដោយសុវត្ថិភាព
                  </div>
                </div>

              </div>

              {/* Helper guide Alert bottom info bar */}
              <div className="bg-pink-50 border border-pink-100 rounded-[20px] p-4.5 flex gap-3 text-xs text-pink-900 leading-relaxed font-normal shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
                <Info size={18} className="text-[#db2777] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-pink-950">ការណែនាំសង្ខេបសម្រាប់ភ្ញៀវ៖</p>
                  <p>១. សូមបំពេញឈ្មោះពេញ និង លេខទូរស័ព្ទរបស់លោកអ្នកខាងលើ ដើម្បីកត់ត្រាក្នុងសៀវភៅបញ្ជីភ្ញៀវការរបស់សាមីខ្លួន។</p>
                  <p>២. ប្រសិនបើលោកអ្នកចង់ចងដៃតាមប្រព័ន្ធឌីជីថល (KHQR) សូមជ្រើសរើសស្កេនកូដទូទាត់ QR ខាងស្តាំដៃនេះ។ ប្រព័ន្ធនឹងកត់ត្រាដោយស្វ័យប្រវត្តិ។</p>
                  <p>៣. ចុចប៊ូតុង <span className="font-bold underline">«រក្សាទុកព័ត៌មាន និងចុះឈ្មោះ»</span> ដើម្បីបញ្ចប់ការចុះឈ្មោះជាផ្លូវការនៅក្នុងពិធីការ។</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

        {/* ========================================================
            VIEW 2: ADMIN PANEL SIGN-IN / DASHBOARD
            ======================================================== */}
        {activeRole === 'admin' && (
          <div className="max-w-md mx-auto" id="admin-login-view">
            {!adminLoggedIn ? (
              <div className="bg-white rounded-[20px] border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-100/60 text-[#db2777] rounded-xl flex items-center justify-center mx-auto">
                    <UserCheck size={24} />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">ខាងគណៈកម្មការរៀបចំកម្មវិធី</h2>
                  <p className="text-xs text-slate-400">សូមវាយបញ្ចូលគណនី និងលេខសម្ងាត់សម្រាប់ចូលប្រើប្រាស់</p>
                </div>

                {adminError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-3.5 py-2.5 rounded-xl text-center font-bold">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះអ្នកប្រើប្រាស់ (Username)</label>
                    <input 
                      type="text"
                      className="w-full text-sm px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="បញ្ចូលឈ្មោះគណៈកម្មការ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ពាក្យសម្ងាត់ (Password)</label>
                    <input 
                      type="password"
                      className="w-full text-sm px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#db2777] hover:bg-[#be185d] text-white font-bold py-3 rounded-xl text-xs hover:shadow-lg hover:shadow-pink-105 transition-all cursor-pointer"
                  >
                    ចូលទីកាន់ប្រព័ន្ធ (Login)
                  </button>
                </form>

                <div className="bg-stone-50 p-3 rounded-xl border text-center text-xs text-slate-500">
                  គណនីគំរូសាកល្បង៖ <span className="font-bold text-slate-800">admin123</span> / <span className="font-bold text-slate-800">password123</span>
                </div>
              </div>
            ) : (
              // Dashboard Screen after login
              <div className="space-y-6">
                
                {/* Admin Status header info card matching bento layout */}
                <div className="bg-white rounded-[20px] p-5 border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100/60 rounded-xl flex items-center justify-center text-[#db2777]">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-850">គណៈកម្មការរៀបចំកម្មវិធីការ</h3>
                      <p className="text-xs text-slate-400 font-medium">អ្នកសម្របសម្រួល និងកត់ត្រាបញ្ជីភ្ញៀវ</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setShowAdminAddManual(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      <span>បន្ថែមភ្ញៀវផ្ទាល់ដៃ (Manual Add)</span>
                    </button>

                    <button
                      onClick={() => setAdminLoggedIn(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>ចាកចេញ (Log Out)</span>
                    </button>
                  </div>
                </div>

                {/* Main section: Two columns (Create Wedding Event | Filter guest table) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Form Create Wedding event Form (Left side) matching bento-card */}
                  <div className="lg:col-span-4 bg-white rounded-[20px] border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-pink-100 flex items-center gap-1.5">
                      <Plus size={16} className="text-[#db2777]" />
                      បង្កើតកម្មវិធីមង្គលការថ្មី (Create Wedding)
                    </h3>

                    <form onSubmit={handleAddNewWeddingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">ឈ្មោះកម្មវិធី (Title) <span className="text-pink-600">*</span></label>
                        <input
                          type="text"
                          required
                          value={newWeddingForm.title}
                          onChange={(e) => setNewWeddingForm({...newWeddingForm, title: e.target.value})}
                          placeholder="ឧទاهرណ៍៖ មង្គលការ បុត្រា & កន្យា"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">គណនីម្ចាស់កម្មវិធី (Host Username) <span className="text-pink-600">*</span></label>
                        <input
                          type="text"
                          required
                          value={newWeddingForm.host_username}
                          onChange={(e) => setNewWeddingForm({...newWeddingForm, host_username: e.target.value})}
                          placeholder="ឧទាហរណ៍៖ bunthoeun"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">ពាក្យសម្ងាត់ម្ចាស់ផ្ទះ (Host Password) <span className="text-pink-600">*</span></label>
                        <input
                          type="password"
                          required
                          value={newWeddingForm.host_password}
                          onChange={(e) => setNewWeddingForm({...newWeddingForm, host_password: e.target.value})}
                          placeholder="បញ្ចូលពាក្យសម្ងាត់"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">លីងរូបភាព KHQR (ImgBB/Direct QR link)</label>
                        <input
                          type="text"
                          value={newWeddingForm.khqr_img_url}
                          onChange={(e) => setNewWeddingForm({...newWeddingForm, khqr_img_url: e.target.value})}
                          placeholder="លីងរូបភាព QR កូដ (ImgBB direct-link)"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#db2777] hover:bg-[#be185d] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Check size={14} />
                        <span>បង្កើតកម្មវិធី និងម្ចាស់គណនី</span>
                      </button>
                    </form>

                    <div className="bg-pink-50/60 p-3.5 rounded-xl border border-pink-100 text-[10px] text-pink-900 leading-relaxed font-normal">
                      ព័ត៌មានដែលបង្កើតរួចនឹងអាចឱ្យសាមីខ្លួន (Host Dashboard) ចូលប្រើដើម្បីវិភាគស្ថិតិភ្ញៀវ និងប្រាក់ចងដៃរបស់ពួកគេរៀងៗខ្លួន។
                    </div>
                  </div>





                  {/* Dynamic Guest table with Search & Approval/Deletion (Right side) */}
                  <div className="lg:col-span-8 bg-white rounded-[20px] border border-pink-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 space-y-4">
                    
                    {/* Filters & search block */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          <ListOrdered size={16} />
                          បញ្ជីភ្ញៀវចុះឈ្មោះក្នុងប្រព័ន្ធ
                        </h3>
                        <p className="text-xs text-slate-400">ស្វែងរក អនុម័ត និងកែសម្រួលបញ្ជីភ្ញៀវ</p>
                      </div>

                      {/* Select Wedding filter */}
                      <div className="min-w-[150px]">
                        <select
                          value={adminWeddingFilter}
                          onChange={(e) => setAdminWeddingFilter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="">-- បង្ហាញកម្មវិធីមង្គលការទាំងអស់ --</option>
                          {weddings.map(w => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Operational Search controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {/* Text Search */}
                      <div className="md:col-span-2 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Search size={14} />
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
                          className="w-full text-xs pl-8 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      {/* Relation Filter */}
                      <div>
                        <select
                          value={relationFilter}
                          onChange={(e) => setRelationFilter(e.target.value)}
                          className="w-full bg-white border text-xs text-slate-700 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="all">ទំនាក់ទំនង (ទាំងអស់)</option>
                          <option value="groom_side">ខាងកូនកំលោះ</option>
                          <option value="bride_side">ខាងកូនក្រមុំ</option>
                          <option value="friends">មិត្តភក្តិ</option>
                          <option value="others">ផ្សេងៗ</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full bg-white border text-xs text-slate-700 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="all">ស្ថានភាព (ទាំងអស់)</option>
                          <option value="pending">កំពុងរង់ចាំ (Pending)</option>
                          <option value="approved">បានអនុម័ត (Approved)</option>
                        </select>
                      </div>
                    </div>

                    {/* Guest List Grid/Table */}
                    <div className="overflow-x-auto border border-rose-50 rounded-2xl">
                      <table className="w-full text-left border-collapse" id="admin-guest-table">
                        <thead>
                          <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-rose-50">
                            <th className="py-3 px-4 text-center">ល.រ</th>
                            <th className="py-3 px-3">ឈ្មោះភ្ញៀវ ()</th>
                            <th className="py-3 px-3">លេខទូរស័ព្ទ</th>
                            <th className="py-3 px-3 text-center">អ្នកជាមួយ</th>
                            <th className="py-3 px-3">ទំនាក់ទំនង</th>
                            <th className="py-3 px-3">ចងដៃ ($)</th>
                            <th className="py-3 px-3 text-center">ស្ថានភាព</th>
                            <th className="py-3 px-3 text-center">សកម្មភាព</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-50 text-xs">
                          {filteredGuestsForAdmin.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                                មិនមានព័ត៌មានភ្ញៀវត្រូវបានរកឃើញឡើយ
                              </td>
                            </tr>
                          ) : (
                            filteredGuestsForAdmin.map((guest, index) => {
                              const widTitle = weddings.find(w => w.id === guest.wedding_id)?.title || 'Unknown';
                              return (
                                <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 px-3 text-center text-slate-400 font-mono font-bold">
                                    {index + 1}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="font-bold text-slate-800">{guest.name}</span>
                                    {!adminWeddingFilter && (
                                      <span className="block text-[9px] text-rose-500 font-medium">{widTitle}</span>
                                    )}
                                    {guest.note && (
                                      <span className="block text-[10px] text-slate-500 font-normal italic">"{guest.note}"</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-600">{guest.phone}</td>
                                  <td className="py-3 px-3 text-center font-bold text-slate-700">{guest.companions} នាក់</td>
                                  <td className="py-3 px-3">
                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                      {getRelationKhmer(guest.relation_type)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-rose-600">
                                    {guest.amount ? `$${guest.amount}` : '-'}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    {guest.status === 'pending' ? (
                                      <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-bold items-center gap-0.5 animate-pulse">
                                        កំពុងរង់ចាំ
                                      </span>
                                    ) : (
                                      <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-bold items-center gap-0.5">
                                        បានអនុម័ត
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {guest.status === 'pending' && (
                                        <button
                                          onClick={() => approveGuest(guest.id)}
                                          className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white p-1 rounded-lg transition-all"
                                          title="អនុម័តភ្ញៀវចូលរួម"
                                        >
                                          <Check size={14} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteGuest(guest.id)}
                                        className="bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white p-1 rounded-lg transition-all font-bold"
                                        title="លុបភ្ញៀវ"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Manual ADD overlay (Guest entry at desk) */}
            {showAdminAddManual && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative border border-rose-100">
                  
                  <div className="flex items-center justify-between pb-3 border-b mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <PlusCircle className="text-emerald-600" size={20} />
                      បញ្ចូលរបាយការណ៍ភ្ញៀវផ្ទាល់ដៃ (Manual Add)
                    </h3>
                  </div>

                  <form onSubmit={handleAdminAddManualSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះភ្ញៀវ <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        value={adminAddGuestForm.name}
                        onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, name: e.target.value})}
                        className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="ឈ្មោះភ្ញៀវ"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          required 
                          value={adminAddGuestForm.phone}
                          onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, phone: e.target.value})}
                          className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          placeholder="លេខទូរស័ព្ទ"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនអ្នកមកជាមួយ</label>
                        <input 
                          type="number" 
                          value={adminAddGuestForm.companions}
                          onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, companions: Number(e.target.value) || 0})}
                          className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទទំនាក់ទំនង</label>
                        <select 
                          value={adminAddGuestForm.relation_type}
                          onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, relation_type: e.target.value as Guest['relation_type']})}
                          className="w-full text-xs px-2 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        >
                          <option value="groom_side">ខាងកូនកំលោះ</option>
                          <option value="bride_side">ខាងកូនក្រមុំ</option>
                          <option value="friends">មិត្តភក្តិ</option>
                          <option value="others">ផ្សេងៗ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនប្រាក់ចងដៃ (USD)</label>
                        <input 
                          type="number" 
                          value={adminAddGuestForm.amount}
                          onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, amount: e.target.value})}
                          className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono font-bold text-rose-600"
                          placeholder="ឧទាហរណ៍៖ 50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">សារជូនពរ ឬកំណត់សម្គាល់ផ្សេងៗ</label>
                      <textarea 
                        value={adminAddGuestForm.note}
                        onChange={(e) => setAdminAddGuestForm({...adminAddGuestForm, note: e.target.value})}
                        rows={2}
                        className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="កំណត់សម្គាល់ផ្សេងៗ..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-bold">ស្ថានភាពនៃការចុះឈ្មោះ</label>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center text-xs gap-1.5 cursor-pointer font-bold">
                          <input 
                            type="radio" 
                            name="status" 
                            checked={adminAddGuestForm.status === 'approved'}
                            onChange={() => setAdminAddGuestForm({...adminAddGuestForm, status: 'approved'})}
                          />
                          យល់ព្រមភ្លាមៗ (Approved)
                        </label>
                        <label className="inline-flex items-center text-xs gap-1.5 cursor-pointer font-medium">
                          <input 
                            type="radio" 
                            name="status" 
                            checked={adminAddGuestForm.status === 'pending'}
                            onChange={() => setAdminAddGuestForm({...adminAddGuestForm, status: 'pending'})}
                          />
                          កំពុងរង់ចាំ (Pending/Review)
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all"
                      >
                        បន្ថែមទៅក្នុងបញ្ជី
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAdminAddManual(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-5 py-2.5 text-xs font-medium"
                      >
                        បោះបង់
                      </button>
                    </div>

                  </form>

                </div>
              </div>
            )}

          </div>
        )}


        {/* ========================================================
            VIEW 3: HOST VIEW (WEDDING OWNER/BRIDE & GROOM)
            ======================================================== */}
        {activeRole === 'host' && (
          <div className="max-w-6xl mx-auto space-y-6" id="host-wedding-view">
            
            {!hostLoggedIn ? (
              // Login Screen
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-rose-100 shadow-xl space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-100 animate-pulse">
                    <Heart size={32} className="fill-current" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">គណនីម្ចាស់មង្គលការ (Host Login)</h3>
                  <p className="text-xs text-slate-500 font-medium font-bold">កូនក្រមុំ & កូនកំលោះ ចូលមើលរបាយការណ៍សរុប</p>
                </div>

                {hostError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-3.5 py-2.5 rounded-xl text-center font-bold">
                    {hostError}
                  </div>
                )}

                <form onSubmit={handleHostLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">គណនីសម្គាល់ (Username)</label>
                    <input 
                      type="text"
                      className="w-full text-sm px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      value={hostUsernameInput}
                      onChange={(e) => setHostUsernameInput(e.target.value)}
                      placeholder="បញ្ចូល username បង្កើឡើងដោយ Admin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ពាក្យសម្ងាត់ (Password)</label>
                    <input 
                      type="password"
                      className="w-full text-sm px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      value={hostPasswordInput}
                      onChange={(e) => setHostPasswordInput(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 rounded-2xl text-xs hover:shadow-lg hover:shadow-rose-100 transition-all"
                  >
                    ចូលពិនិត្យរបាយការណ៍ (Login Dashboard)
                  </button>
                </form>

                <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 text-center text-xs text-rose-900 leading-relaxed font-normal">
                  គណនីគំរូសាកល្បងម្ចាស់មង្គលការ៖ 
                  <span className="block mt-0.5 font-bold text-slate-800">
                    Host: bunthoeun | Password: love123
                  </span>
                </div>
              </div>
            ) : (
              // Dashboard Screen after login
              <div className="space-y-6">
                
                {/* Host Control panel Header */}
                <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">សាលមហោស្រពមង្គល</span>
                    <h2 className="text-xl font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
                      <Sparkles size={18} className="text-amber-500" />
                      {hostWedding?.title || "មង្គលការឯកជន"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportExcel}
                      disabled={hostGuests.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 leading-none cursor-pointer"
                    >
                      <Download size={14} />
                      <span>ទាញយកបញ្ជីជា Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => setHostLoggedIn(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1 leading-none cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>ចាកចេញ (Log Out)</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Stats Panel (3 styled cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="host-stats-grid">
                  
                  {/* Card 1: Total Registered Guests */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">ភ្ញៀវចុះឈ្មោះកក់ទុកសរុប</p>
                      <h4 className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">{countRegistered}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">ចំនួនភ្ញៀវដែលបានបំពេញព័ត៌មានរួច</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl text-rose-500 border border-rose-100/30">
                      <Users size={28} />
                    </div>
                  </div>

                  {/* Card 2: Actual Total Attendees (Approved guests + companions) */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">ចំនួនអ្នកចូលរួមជាក់ស្តែង</p>
                      <h4 className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">{countActualAttendees}</h4>
                      <p className="text-[10px] text-emerald-500 font-medium">គណនាពី៖ ភ្ញៀវបានអនុម័ត + អ្នកមកជាមួយ</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100/30">
                      <UserCheck size={28} />
                    </div>
                  </div>

                  {/* Card 3: Total Gift Money (Approved Amount ($)) */}
                  <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">ប្រាក់ចងដៃសរុប (USD)</p>
                      <h4 className="text-3xl font-black text-rose-600 font-mono tracking-tight">
                        ${sumGiftMoney.toLocaleString()}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">ចំនួនថវិកាកត់ត្រាពីភ្ញៀវដែលបានអនុម័ត</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100/30">
                      <DollarSign size={28} />
                    </div>
                  </div>

                </div>

                {/* Dashboard reports and filters list */}
                <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <ClipboardList size={16} />
                        របាយការណ៍ភ្ញៀវកម្រងបញ្ជីអាពាហ៍ពិពាហ៍របស់អ្នក
                      </h3>
                      <p className="text-xs text-slate-400">របាយការណ៍ម្ចាស់កម្មវិធីការកំរិត និងស្ថិតិស្វែងរក</p>
                    </div>

                    <div className="flex gap-2 text-xs flex-col sm:flex-row">
                      {/* Search */}
                      <div className="relative min-w-[200px]">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Search size={13} />
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
                          className="w-full text-xs pl-8 pr-3 py-1.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Relation Filter button */}
                      <div>
                        <select
                          value={relationFilter}
                          onChange={(e) => setRelationFilter(e.target.value)}
                          className="w-full bg-white border text-xs text-slate-700 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="all">គ្រួសារ/ទំនាក់ទំនង (ទាំងអស់)</option>
                          <option value="groom_side">ខាងកូនកំលោះ</option>
                          <option value="bride_side">ខាងកូនក្រមុំ</option>
                          <option value="friends">មិត្តភក្តិ</option>
                          <option value="others">ផ្សេងៗ</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Locked host information logs */}
                  <div className="overflow-x-auto border border-rose-50 rounded-2xl">
                    <table className="w-full text-left border-collapse" id="host-report-table">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase border-b border-rose-100">
                          <th className="py-2.5 px-4 text-center">ល.រ</th>
                          <th className="py-2.5 px-3">ឈ្មោះភ្ញៀវ ()</th>
                          <th className="py-2.5 px-3">លេខទូរស័ព្ទ</th>
                          <th className="py-2.5 px-3 text-center">អ្នកជាមួយ</th>
                          <th className="py-2.5 px-3">ទំនាក់ទំនង</th>
                          <th className="py-2.5 px-3">ប្រាក់ចងដៃ (USD)</th>
                          <th className="py-2.5 px-3">សារជូនពរ / Wish message</th>
                          <th className="py-2.5 px-3 text-center">ការអនុម័ត</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 text-xs">
                        {filteredGuestsForHost.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                              មិនមានព័ត៌មានភ្ញៀវណាមួយត្រូវបានរកឃើញឡើយ
                            </td>
                          </tr>
                        ) : (
                          filteredGuestsForHost.map((g, idx) => (
                            <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-3 text-center text-slate-400 font-mono font-bold">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-800">{g.name}</span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">{g.phone || '-'}</td>
                              <td className="py-3 px-3 text-center font-bold text-slate-750">{g.companions} នាក់</td>
                              <td className="py-3 px-3">
                                <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-100">
                                  {getRelationKhmer(g.relation_type)}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-black text-rose-600">
                                {g.amount ? `$${g.amount}` : '-'}
                              </td>
                              <td className="py-3 px-3 italic font-normal text-slate-500 max-w-xs truncate" title={g.note}>
                                {g.note ? `"${g.note}"` : '-'}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {g.status === 'approved' ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                    បានអនុម័ត
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                    កំពុងរង់ចាំ
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                    <span>
                      🔒 <strong>ទិដ្ឋភាពសុវត្ថិភាពម្ចាស់កម្មវិធី៖</strong> ទំព័រនេះប្រើប្រាស់សម្រាប់តែត្រួតពិនិត្យ ស្វែងរក និងទាញយកជា Excel <strong>(Read-only)</strong> ប៉ុណ្ណោះ។ មិនអាចលុប ឬផ្លាស់ប្តូរទិន្នន័យបានឡើយ។
                    </span>
                    <span className="text-rose-500 font-semibold flex items-center gap-1 text-[11px]">
                      <Sparkles size={11} /> 
                      អរគុណសម្រាប់ការគាំទ្រប្រព័ន្ធគ្រប់គ្រងរបស់យើងខ្ញុំ!
                    </span>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Romantic Pink/Cream footer */}
      <footer className="bg-white border-t border-rose-100 py-6 mt-12 text-center" id="main-footer">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} ប្រព័ន្ធគ្រប់គ្រងភ្ញៀវអាពាហ៍ពិពាហ៍ខ្មែរឌីជីថល (Cambodia Wedding Systems). រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">
          Powered with React, Supabase & SheetJS Excel Export
        </p>
      </footer>

    </div>
  );
}
