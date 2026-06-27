import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  MapPin, 
  RotateCcw, 
  Send, 
  Sparkles, 
  BookOpen, 
  Award, 
  Activity, 
  Globe, 
  Calendar, 
  ArrowUp, 
  Compass, 
  Users, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Info,
  Sliders,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { MILESTONES, Milestone, KeyFigure, DocumentArchive } from './data/historyData';

// Quotes for background rotation / display
const HISTORICAL_QUOTES = [
  { text: "إن شعباً يملك عقيدة صلبة لا يمكن أن يُهزم، وإن جيشاً يستلهم كرامة أمته يصنع المستحيل.", author: "محمد أنور السادات - خطاب نصر أكتوبر" },
  { text: "السيادة لا توهب، والكرامة لا تُباع، وحرية الوطن تُنتزع بنضال أبنائه وعرق عماله ودماء شهدائه.", author: "جمال عبد الناصر" },
  { text: "إن تاريخ مصر صراع متصل ومستدام من أجل البقاء وحرية الإرادة وصناعة المستقبل في هذه البقعة المحورية من العالم.", author: "مؤرخ استراتيجي" },
  { text: "قوة مصر تكمن في تلاحم شعبها مع قواته المسلحة؛ هذا الالتصاق التاريخي هو صمام الأمان لكل العواصف.", author: "الفريق عبد المنعم رياض" }
];

export default function App() {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(MILESTONES[0]);
  const [activeTab, setActiveTab] = useState<'analysis' | 'figures' | 'documents' | 'testimonies'>('analysis');
  const [selectedDocument, setSelectedDocument] = useState<DocumentArchive | null>(null);
  
  // Strategy Simulator States
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState<string>('');
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Active Map Marker hover states
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Quote rotation
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Scroll to Top visibility
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Feedback analysis reference scroll
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % HISTORICAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset decision state when milestone changes
  useEffect(() => {
    setSelectedChoiceId(null);
    setCustomAction('');
    setAiFeedback('');
    setAiError('');
    setSelectedDocument(null);
    setActiveTab('analysis');
  }, [selectedMilestone]);

  const handleMilestoneChange = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
  };

  const handlePrevMilestone = () => {
    const currentIndex = MILESTONES.findIndex(m => m.id === selectedMilestone.id);
    if (currentIndex > 0) {
      setSelectedMilestone(MILESTONES[currentIndex - 1]);
    }
  };

  const handleNextMilestone = () => {
    const currentIndex = MILESTONES.findIndex(m => m.id === selectedMilestone.id);
    if (currentIndex < MILESTONES.length - 1) {
      setSelectedMilestone(MILESTONES[currentIndex + 1]);
    }
  };

  // Submit custom strategy to backend Gemini advisor
  const handleConsultStrategicAdvisor = async () => {
    if (!customAction.trim()) {
      setAiError('من فضلك اكتب الإجراء أو الخطة العسكرية المقترحة أولاً.');
      return;
    }

    setIsLoadingAi(true);
    setAiError('');
    setAiFeedback('');
    setSelectedChoiceId('custom');

    // Smooth scroll to the feedback zone
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);

    try {
      const response = await fetch('/api/decision-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: selectedMilestone.id,
          scenarioTitle: selectedMilestone.dilemma.title,
          choiceId: 'custom',
          customAction: customAction,
          historicalContext: selectedMilestone.summary + " " + selectedMilestone.causes.join(" ")
        }),
      });

      if (!response.ok) {
        throw new Error('فشل الخادم في الرد. تأكد من إعداد مفتاح GEMINI_API_KEY بشكل صحيح.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiFeedback(data.feedback);
      
      // Scroll again once feedback loads
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error: any) {
      console.error('Error contacting advisor:', error);
      setAiError(error.message || 'حدث خطأ غير متوقع أثناء الاتصال بالمستشار الاستراتيجي.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Categories helper styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ثورة':
        return 'bg-red-950/80 text-red-400 border-red-800/50';
      case 'صراع عسكري':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/50';
      case 'دبلوماسية':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50';
      case 'تنمية وبناء':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1013] text-slate-100 flex flex-col font-sans select-none selection:bg-amber-600/30 selection:text-amber-200">
      
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
      
      {/* GLOWING AMBIENT CORNER LIGHTS */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 left-1/4 w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* TOP DECORATIVE STATUS BAR */}
      <div className="w-full bg-[#090b0e] border-b border-slate-900 px-4 py-2 text-xs flex justify-between items-center text-slate-500 font-mono z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>جمهورية مصر العربية - الأرشيف التاريخي القومي</span>
        </div>
        <div className="flex items-center gap-4">
          <span>الحالة: متصل بالاستشار الاستراتيجي الذكي</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">التاريخ الوطني: ١٩٥٢ - ٢٠٢٥</span>
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="relative w-full py-8 md:py-12 border-b border-slate-900/80 bg-[#0d1013]/90 backdrop-blur z-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-amber-500 font-mono tracking-wider text-sm uppercase">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>صراع البقاء وصناعة القرار الاستراتيجي</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight mb-3">
              مصر: صراع البقاء وصناعة القرار <span className="text-amber-500 font-serif font-normal">(١٩٥٢-٢٠٢٥)</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              مرجع تحليلي وتفاعلي يستعرض المنعطفات التاريخية الكبرى، التكتيكات العسكرية، المعاهدات الدبلوماسية، والقرارات المصيرية التي صاغت مستقبل السيادة المصرية.
            </p>
          </div>

          {/* Golden Egyptian Eagle Crest Vector Decoration */}
          <div className="flex flex-col items-center p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl max-w-xs text-center">
            <div className="w-14 h-14 rounded-full bg-amber-950/50 border border-amber-600/30 flex items-center justify-center mb-2">
              <Award className="w-7 h-7 text-amber-500" />
            </div>
            <span className="text-xs text-amber-500 font-mono mb-1">الجمهورية الجديدة</span>
            <span className="text-[10px] text-slate-500">مدرج بالأمم المتحدة والمجلس الأعلى للأمن القومي</span>
          </div>
        </div>
      </header>

      {/* HERO QUOTE CAROUSEL */}
      <section className="relative w-full border-b border-slate-900/60 bg-gradient-to-l from-slate-950 to-slate-900/80 py-4 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-500 shrink-0">
            <History className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-widest uppercase hidden md:inline">من الذاكرة القومية:</span>
          </div>
          <div className="flex-1 text-center px-4 transition-all duration-1000 ease-in-out">
            <p className="text-sm md:text-base font-serif italic text-slate-200 leading-relaxed">
              "{HISTORICAL_QUOTES[quoteIndex].text}"
            </p>
            <span className="block mt-1 text-xs text-amber-600 font-sans">
              — {HISTORICAL_QUOTES[quoteIndex].author}
            </span>
          </div>
        </div>
      </section>

      {/* HORIZONTAL TIMELINE CONTROLLER */}
      <section className="relative w-full bg-[#090b0e] border-b border-slate-900/80 py-6 px-4 md:px-8 z-10 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              تتبع الحقب الزمنية والمنعطفات التاريخية
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMilestone}
                disabled={selectedMilestone.id === MILESTONES[0].id}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-amber-500 transition-colors"
                title="المحطة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMilestone}
                disabled={selectedMilestone.id === MILESTONES[MILESTONES.length - 1].id}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-amber-500 transition-colors"
                title="المحطة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 items-stretch min-w-max py-2 overflow-x-auto">
            {MILESTONES.map((milestone) => {
              const isActive = selectedMilestone.id === milestone.id;
              return (
                <button
                  key={milestone.id}
                  onClick={() => handleMilestoneChange(milestone)}
                  className={`relative flex flex-col p-3.5 rounded-lg border text-right transition-all duration-300 min-w-[210px] cursor-pointer group ${
                    isActive 
                      ? 'bg-gradient-to-b from-[#161a22] to-[#11141b] border-amber-500/80 shadow-md shadow-amber-500/5' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30'
                  }`}
                  id={`timeline-node-${milestone.id}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getCategoryBadge(milestone.category)}`}>
                      {milestone.category}
                    </span>
                    <span className={`text-xs font-bold font-mono transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {milestone.period}
                    </span>
                  </div>
                  <h3 className={`text-sm font-bold tracking-tight line-clamp-1 transition-colors ${isActive ? 'text-slate-100 font-extrabold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {milestone.title}
                  </h3>
                  {isActive && (
                    <div className="absolute bottom-0 right-4 left-4 h-[2px] bg-amber-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT SPLIT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN (OR PRIMARY CONTENT PANE - 7 COLS) */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* ACTIVE MILESTONE SUMMARY HEADER */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-lg shadow-black/40">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-amber-500"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getCategoryBadge(selectedMilestone.category)}`}>
                  {selectedMilestone.category}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  {selectedMilestone.period}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">معرف المحطة: {selectedMilestone.id}</span>
            </div>

            <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-100 tracking-tight mb-4 leading-tight">
              {selectedMilestone.title}
            </h2>

            <p className="text-slate-300 leading-relaxed text-sm md:text-base font-serif bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
              {selectedMilestone.summary}
            </p>
          </div>

          {/* ANALYSIS / DOCUMENTS / FIGURES TABS CONTROL */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl shadow-lg shadow-black/40 overflow-hidden">
            <div className="flex border-b border-slate-900 bg-[#090b0e] overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-4 px-4 text-center text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'analysis' 
                    ? 'border-amber-500 text-amber-400 bg-[#12161b]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
                id="tab-btn-analysis"
              >
                <Compass className="w-4 h-4 text-amber-500" />
                <span>الرؤية والتحليل الاستراتيجي</span>
              </button>
              <button 
                onClick={() => setActiveTab('figures')}
                className={`flex-1 py-4 px-4 text-center text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'figures' 
                    ? 'border-amber-500 text-amber-400 bg-[#12161b]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
                id="tab-btn-figures"
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>شخصيات محورية ({selectedMilestone.figures.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`flex-1 py-4 px-4 text-center text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'documents' 
                    ? 'border-amber-500 text-amber-400 bg-[#12161b]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
                id="tab-btn-documents"
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>الوثائق والبيانات ({selectedMilestone.documents.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('testimonies')}
                className={`flex-1 py-4 px-4 text-center text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'testimonies' 
                    ? 'border-amber-500 text-amber-400 bg-[#12161b]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
                id="tab-btn-testimonies"
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>شهادات من الذاكرة ({selectedMilestone.testimonies.length})</span>
              </button>
            </div>

            <div className="p-6 md:p-8">
              
              {/* TAB 1: STRATEGIC ANALYSIS CONTENT */}
              {activeTab === 'analysis' && (
                <div className="flex flex-col gap-6" id="panel-analysis">
                  
                  {/* CAUSES / BACKGROUND */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3 border-r-2 border-amber-500 pr-2">
                      الأسباب والدوافع الجيوسياسية
                    </h3>
                    <ul className="space-y-2.5">
                      {selectedMilestone.causes.map((cause, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CHRONOLOGY OF EVENTS */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3 border-r-2 border-amber-500 pr-2">
                      سير ومحطات الأحداث الرئيسية
                    </h3>
                    <div className="space-y-4 border-r border-slate-800 pr-3 mr-1">
                      {selectedMilestone.events.map((evt, i) => (
                        <div key={i} className="relative group">
                          <div className="absolute -right-[17px] top-1.5 w-2 h-2 rounded-full bg-amber-500/80 group-hover:bg-amber-400 transition-colors"></div>
                          <span className="text-xs font-mono font-bold text-amber-500 block mb-0.5">{evt.time}</span>
                          <p className="text-sm text-slate-300 leading-relaxed">{evt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STRATEGIES & TACTICS */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3 border-r-2 border-amber-500 pr-2">
                      الاستراتيجيات والتكتيكات المستخدمة
                    </h3>
                    <ul className="space-y-2.5">
                      {selectedMilestone.strategies.map((strat, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2 bg-slate-950/20 p-2.5 border border-slate-900 rounded-md">
                          <div className="w-5 h-5 rounded-full bg-amber-950/50 border border-amber-600/30 text-amber-500 flex items-center justify-center shrink-0 font-mono text-[10px]">
                            {i+1}
                          </div>
                          <span>{strat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CONSEQUENCES / IMPACT */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3 border-r-2 border-amber-500 pr-2">
                      النتائج والتداعيات الإقليمية والدولية
                    </h3>
                    <ul className="space-y-2.5">
                      {selectedMilestone.consequences.map((conseq, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{conseq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

              {/* TAB 2: KEY FIGURES CONTENT */}
              {activeTab === 'figures' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="panel-figures">
                  {selectedMilestone.figures.map((figure, i) => (
                    <div 
                      key={i} 
                      className="bg-slate-950/50 border border-slate-900 rounded-lg p-4 flex gap-3 hover:border-slate-800 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-950/30 border border-amber-600/20 text-amber-500 font-extrabold flex items-center justify-center shrink-0 text-sm font-mono tracking-wider group-hover:border-amber-500 transition-colors">
                        {figure.avatar}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{figure.name}</h4>
                        <span className="text-[11px] font-semibold text-amber-600 mb-1.5">{figure.role}</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{figure.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: DOCUMENT ARCHIVE CONTENT */}
              {activeTab === 'documents' && (
                <div className="flex flex-col gap-4" id="panel-documents">
                  {selectedDocument ? (
                    <div className="bg-[#191e25] border border-amber-900/30 rounded-lg p-5 relative">
                      <button 
                        onClick={() => setSelectedDocument(null)}
                        className="absolute top-4 left-4 text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
                      >
                        العودة للأرشيف
                      </button>
                      <span className="text-[10px] text-amber-500 font-mono tracking-widest block uppercase mb-1">{selectedDocument.type} — {selectedDocument.date}</span>
                      <h4 className="text-base font-bold text-slate-100 mb-3 border-b border-slate-800 pb-2">{selectedDocument.title}</h4>
                      <p className="text-sm font-serif italic text-amber-100/90 leading-relaxed bg-slate-950/50 p-4 border border-amber-950/40 rounded-md">
                        "{selectedDocument.snippet}"
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>أرشيف الوثائق القومية المصرية والتحكيم الدولي</span>
                        <span>متاح للمطالعة التاريخية الأكاديمية</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMilestone.documents.map((doc, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedDocument(doc)}
                          className="bg-slate-950/40 border border-slate-900 rounded-lg p-4 cursor-pointer hover:border-amber-600/30 hover:bg-slate-950/80 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-semibold bg-amber-950/40 border border-amber-600/20 text-amber-500 px-1.5 py-0.5 rounded">
                                {doc.type}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{doc.date}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                              {doc.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-serif italic">
                              "{doc.snippet}"
                            </p>
                          </div>
                          <span className="text-[10px] text-amber-600 font-mono mt-3 self-end flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                            اضغط لقراءة مقتطف الوثيقة 
                            <ChevronLeft className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEMORY ARCHIVE CONTENT */}
              {activeTab === 'testimonies' && (
                <div className="flex flex-col gap-4" id="panel-testimonies">
                  {selectedMilestone.testimonies.map((test, i) => (
                    <div 
                      key={i} 
                      className="bg-slate-950/40 border border-slate-900 rounded-lg p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-2 h-2 bg-amber-600"></div>
                      <p className="text-sm font-serif italic text-slate-300 leading-relaxed mb-3">
                        "{test.text}"
                      </p>
                      <div className="flex justify-between items-center text-xs border-t border-slate-900/60 pt-2.5">
                        <span className="font-bold text-slate-200">{test.author}</span>
                        <span className="text-amber-600 font-mono">{test.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* COMPARATIVE STRATEGY TABLE */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl p-6 md:p-8 shadow-lg shadow-black/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4 border-r-2 border-amber-500 pr-2">
              لوحة مقارنة التحول الاستراتيجي عبر العصور
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              تظهر هذه المقارنة تطور العقيدة العسكرية والدبلوماسية المصرية من المناهضة القومية للاستعمار وحتى الشراكة الدولية متعددة الأقطاب في العصر الحديث.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs md:text-sm border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#090b0e] text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">العصر / الحقبة</th>
                    <th className="py-2.5 px-3">العقيدة العسكرية</th>
                    <th className="py-2.5 px-3">التوجه الدبلوماسي</th>
                    <th className="py-2.5 px-3">الاستراتيجية الكبرى</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-200">العهد الناصري (١٩٥٢-١٩٧٠)</td>
                    <td className="py-3 px-3">الدفاع الصلب وبناء الجيش العقائدي</td>
                    <td className="py-3 px-3">حركة عدم الانحياز والقومية العربية</td>
                    <td className="py-3 px-3">مناهضة الاستعمار ومقاومة التوسع</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-200">العهد الساداتي (١٩٧٠-١٩٨١)</td>
                    <td className="py-3 px-3">الخداع الاستراتيجي العسكري والمبادأة</td>
                    <td className="py-3 px-3">الصدمة الدبلوماسية المباشرة والتحكيم</td>
                    <td className="py-3 px-3">تحرير الأرض والمزاوجة بين الحرب والسلام</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-200">عهد مبارك (١٩٨١-٢٠١١)</td>
                    <td className="py-3 px-3">الردع الدفاعي الثابت والتطوير الفني</td>
                    <td className="py-3 px-3">الاستقرار الإقليمي والتوازن الحذر</td>
                    <td className="py-3 px-3">مكافحة الإرهاب وحماية الجبهة الداخلية</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-amber-400">الجمهورية الجديدة (٢٠١٤-٢٠٢٥)</td>
                    <td className="py-3 px-3 text-amber-300">تنويع مصادر السلاح والجاهزية متعددة الأبعاد</td>
                    <td className="py-3 px-3 text-amber-300">الشراكة متعددة الأقطاب ومكافحة التهديد التنموي</td>
                    <td className="py-3 px-3 text-amber-300">البناء والتوازي مع مكافحة الإرهاب وأمن الموارد</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* LEFT COLUMN (OR OPERATIONS CENTER & SITUATION MAP - 5 COLS) */}
        <section className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-8">
          
          {/* MAP CONTAINER CARD */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl p-6 shadow-lg shadow-black/40 overflow-hidden flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <MapPin className="w-4 h-4 text-amber-500" />
                الخارطة الاستراتيجية التفاعلية
              </span>
              <span className="text-[10px] font-mono text-slate-500">محدد الإحداثيات: سيناء والقناة</span>
            </div>

            {/* STYLISH MILITARY SVG MAP */}
            <div className="relative w-full h-80 bg-[#0d1013] border border-slate-900/80 rounded-lg overflow-hidden flex items-center justify-center">
              
              {/* Grid Overlay background */}
              <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#C5A880_1px,transparent_1px),linear-gradient(to_bottom,#C5A880_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              <svg 
                viewBox="0 0 500 400" 
                className="w-full h-full text-slate-600 stroke-2"
                style={{ direction: 'ltr' }}
              >
                {/* MEDITERRANEAN SEA AREA HIGHLIGHT */}
                <path 
                  d="M0 0 L500 0 L500 60 L0 60 Z" 
                  fill="#0c1d2b" 
                  fillOpacity="0.4"
                  stroke="#1a354d"
                  strokeWidth="0.5"
                />

                {/* SUEZ CANAL (Straight Blue Channel Line) */}
                <line 
                  x1="300" y1="60" 
                  x2="300" y2="180" 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                  strokeDasharray="2"
                  className="animate-pulse"
                />
                
                {/* DELTA BRANCHES (NILE RIVER Winding to Nile Delta) */}
                <path 
                  d="M170 400 Q170 300 240 200 T300 110 T300 60" 
                  fill="none" 
                  stroke="#0284c7" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                {/* Delta splitting branch */}
                <path 
                  d="M240 200 Q200 120 180 60" 
                  fill="none" 
                  stroke="#0284c7" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M250 160 Q280 120 300 60" 
                  fill="none" 
                  stroke="#0284c7" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />

                {/* RED SEA & GULF OF SUEZ & AQABA (V shape flanking Sinai) */}
                {/* Gulf of Suez (West) */}
                <path 
                  d="M300 180 L350 260 L400 320" 
                  fill="none" 
                  stroke="#1e3a5f" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                />
                {/* Gulf of Aqaba (East) */}
                <path 
                  d="M390 190 L420 250 L450 310" 
                  fill="none" 
                  stroke="#1e3a5f" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                {/* Red Sea main body */}
                <path 
                  d="M350 260 L430 400 L500 400 L420 250 Z" 
                  fill="#0c1d2b" 
                  fillOpacity="0.5"
                  stroke="#1e3a5f"
                  strokeWidth="0.5"
                />

                {/* SINAI PENINSULA POLYGON SHADING */}
                <polygon 
                  points="300,180 390,190 420,250 350,260" 
                  fill="#f59e0b" 
                  fillOpacity={selectedMilestone.id.includes('1967') ? "0.15" : "0.03"} 
                  stroke="#b45309" 
                  strokeWidth="1" 
                  strokeDasharray="4"
                />

                {/* MILITARY VECTORS & ARROWS DYNAMICALLY BASED ON ACTIVE MILESTONE */}
                {selectedMilestone.mapInfo.vectors?.map((vec, i) => {
                  const x1 = vec.from[0] * 5;
                  const y1 = vec.from[1] * 4;
                  const x2 = vec.to[0] * 5;
                  const y2 = vec.to[1] * 4;
                  return (
                    <g key={i}>
                      <line 
                        x1={x1} y1={y1} 
                        x2={x2} y2={y2} 
                        stroke="#ef4444" 
                        strokeWidth="2.5" 
                        strokeDasharray={vec.style === 'dash' ? "4" : "0"}
                      />
                      {/* Simple arrowhead representation */}
                      <circle cx={x2} cy={y2} r="3" fill="#ef4444" />
                    </g>
                  );
                })}

                {/* STATIC STYLISH MARKERS FOR EXPLAINING GENERAL REGIONS */}
                {selectedMilestone.mapInfo.markers.map((marker, i) => {
                  const mx = marker.x * 5;
                  const my = marker.y * 4;
                  const isHovered = hoveredMarker === marker.label;
                  return (
                    <g 
                      key={i}
                      onMouseEnter={() => setHoveredMarker(marker.label)}
                      onMouseLeave={() => setHoveredMarker(null)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring */}
                      <circle 
                        cx={mx} cy={my} r={isHovered ? 12 : 6} 
                        fill="none" 
                        stroke={marker.type === 'عسكري' ? "#ef4444" : "#f59e0b"} 
                        strokeWidth="1.5"
                        className="animate-pulse"
                      />
                      {/* Main Node */}
                      <circle 
                        cx={mx} cy={my} r="4" 
                        fill={marker.type === 'عسكري' ? "#ef4444" : "#f59e0b"} 
                      />
                    </g>
                  );
                })}
              </svg>

              {/* MAP LEGEND / TEXT HOVER */}
              <div className="absolute bottom-2 right-2 left-2 bg-slate-950/80 border border-slate-800/80 rounded px-2.5 py-1.5 text-[10px] text-slate-400 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    محاور عسكرية
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    محاور سياسية/تنمية
                  </span>
                </div>
                {hoveredMarker && (
                  <span className="text-amber-400 font-bold font-mono">
                    نشط: {hoveredMarker}
                  </span>
                )}
              </div>
            </div>

            {/* MAP EXPLANATION OF ACTIVE TARGETS */}
            <div className="bg-slate-950/40 p-3.5 border border-slate-900/80 rounded-lg text-xs">
              <span className="text-amber-500 font-bold block mb-1">المحاور البصرية لهذه المرحلة:</span>
              <div className="space-y-1.5 text-slate-300">
                {selectedMilestone.mapInfo.markers.map((marker, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-amber-600">•</span>
                    <span className="font-semibold">{marker.label}</span>
                    <span className="text-slate-500">({marker.type === 'عسكري' ? 'إجراء عسكري قتالي' : marker.type === 'إنزال' ? 'إنزال معتدي' : 'تنمية وسيادة'})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STRATEGIC SIMULATOR CARD */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl p-6 shadow-lg shadow-black/40 flex flex-col gap-4 relative">
            <div className="absolute top-0 right-1/4 left-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sliders className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-100 font-mono">
                محاكي صانع القرار الاستراتيجي
              </h3>
            </div>

            <div className="bg-[#090b0e] border border-slate-900 rounded-lg p-4">
              <span className="text-[10px] text-amber-600 font-bold block mb-1">الخيار الصعب التاريخي:</span>
              <h4 className="text-xs font-extrabold text-slate-100 mb-2 leading-relaxed">
                {selectedMilestone.dilemma.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-serif">
                {selectedMilestone.dilemma.context}
              </p>
            </div>

            <p className="text-xs font-bold text-slate-200">
              {selectedMilestone.dilemma.question}
            </p>

            {/* PRE-DEFINED CHOICES */}
            <div className="flex flex-col gap-3">
              {selectedMilestone.dilemma.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      setSelectedChoiceId(choice.id);
                      setCustomAction('');
                      setAiFeedback('');
                      setAiError('');
                    }}
                    className={`text-right text-xs p-3.5 rounded-lg border leading-relaxed cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-950/20 border-amber-600 text-amber-200' 
                        : 'bg-slate-950/30 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block mb-1 text-[11px] text-amber-500">
                      خيار استراتيجي:
                    </span>
                    <span>{choice.text}</span>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-amber-900/40 text-slate-300 bg-slate-950/40 p-2.5 rounded text-[11px]">
                        <span className="font-extrabold text-amber-400 block mb-1 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          التقييم التاريخي وعواقب القرار:
                        </span>
                        <p className="mb-2 leading-relaxed">{choice.outcome}</p>
                        <span className="inline-block bg-slate-900 text-amber-500 border border-amber-600/20 px-2 py-0.5 rounded font-mono text-[10px]">
                          النتيجة الاستراتيجية: {choice.strategicScore}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CUSTOM DECISION USING AI ADVISOR */}
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  أو اكتب حلاً عسكرياً ودبلوماسياً بديلاً:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">مدعوم بالذكاء الاصطناعي</span>
              </div>
              
              <textarea
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="مثال: أصدر أمراً بنقل شبكة الدفاع الجوي فوراً تحت حظر تعتيم لاسلكي كامل، مع إطلاق حملة دبلوماسية عربية لتأمين إمدادات الوقود..."
                className="w-full h-24 bg-slate-950/80 border border-slate-900 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-600/80 transition-colors resize-none leading-relaxed"
                id="custom-strategy-input"
              />

              <button
                onClick={handleConsultStrategicAdvisor}
                disabled={isLoadingAi || !customAction.trim()}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="consult-ai-btn"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {isLoadingAi ? 'جاري الاتصال بالمستشار العسكري...' : 'استشارة المستشار الاستراتيجي الذكي'}
              </button>
            </div>

            {/* AI DECISION FEEDBACK REPORT CONTAINER */}
            <div ref={feedbackRef}>
              {isLoadingAi && (
                <div className="bg-slate-950/40 border border-amber-600/20 rounded-lg p-5 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-1"></div>
                  <span className="text-xs font-bold text-amber-500 font-mono">جاري تحليل الاستراتيجية المقترحة وموازنتها عسكرياً وجيوسياسياً...</span>
                  <span className="text-[10px] text-slate-500">يقوم الذكاء الاصطناعي بمطالعة الأرشيف ومحاكاة موازين القوى التاريخية لعام {selectedMilestone.period.split(" ")[0]}</span>
                </div>
              )}

              {aiError && (
                <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">فشل استشارة الذكاء الاصطناعي</span>
                    <p>{aiError}</p>
                  </div>
                </div>
              )}

              {aiFeedback && selectedChoiceId === 'custom' && (
                <div className="bg-[#121920] border-2 border-amber-600/30 rounded-lg p-5 flex flex-col gap-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-amber-900/20 pb-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                      <Shield className="w-4 h-4 text-amber-500" />
                      تقرير تقييم مستشار مجلس الأمن القومي
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">حالة التقرير: سرّي ومكتمل</span>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed font-serif select-text whitespace-pre-line prose prose-invert max-w-none">
                    {aiFeedback}
                  </div>

                  <div className="border-t border-amber-900/20 pt-3 flex justify-between items-center text-[10px] text-slate-500">
                    <span>الذكاء الاصطناعي يحلل في سياق: {selectedMilestone.title}</span>
                    <button 
                      onClick={() => {
                        setAiFeedback('');
                        setCustomAction('');
                        setSelectedChoiceId(null);
                      }}
                      className="text-amber-600 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      إعادة المحاكاة
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RESOURCES LIBRARY */}
          <div className="bg-[#12161b] border border-slate-900 rounded-xl p-6 shadow-lg shadow-black/40">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4 border-r-2 border-amber-500 pr-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              مكتبة الموارد الأكاديمية والبحثية
            </h3>
            <div className="flex flex-col gap-3">
              <div className="bg-slate-950/40 p-3 rounded border border-slate-900/80">
                <span className="text-[10px] text-amber-600 font-mono block uppercase">كتب ومذكرات تاريخية</span>
                <span className="text-xs font-bold text-slate-200 block mb-1">مذكرات الفريق سعد الدين الشاذلي - حرب أكتوبر</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">المرجع العسكري واللوجستي الأكثر دقة في تفاصيل عبور القناة وتصميم الساتر الترابي وتأسيس حائط الصواريخ.</p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded border border-slate-900/80">
                <span className="text-[10px] text-amber-600 font-mono block uppercase">أفلام ووثائقيات</span>
                <span className="text-xs font-bold text-slate-200 block mb-1">سلسلة وثائقي "حرب أكتوبر.. العبور العظيم"</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">سلسلة تلفزيونية وثائقية تستعرض لقطات حقيقية من لحظات العبور وشهادات القادة الأبطال وصناع القرار.</p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded border border-slate-900/80">
                <span className="text-[10px] text-amber-600 font-mono block uppercase">أوراق بحثية سياسية</span>
                <span className="text-xs font-bold text-slate-200 block mb-1">موازين القوى والتحكيم الدولي في قضية طابا</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">دراسة في القانون الدولي حول كيفية استعادة السيادة الوطنية باستراتيجية البحث الأرشيفي والدبلوماسية والخرائط التاريخية.</p>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full bg-[#090b0e] border-t border-slate-900 py-8 px-4 md:px-8 mt-12 z-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-right">
            <span className="font-bold text-slate-400 mb-1">مصر: صراع البقاء وصناعة القرار (1952-2025)</span>
            <p className="text-slate-600">منصة تفاعلية تحليلية مستوحاة من الأرشيف العسكري والسياسي التاريخي لجمهورية مصر العربية.</p>
          </div>
          <div className="flex gap-4 items-center mt-3 md:mt-0">
            <span className="text-slate-600">رؤية مصر ٢٠٣٠</span>
            <span>|</span>
            <span className="text-slate-600">شرف الكلمة وعزّ السيادة</span>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP BUTTON */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-black/40 border border-amber-700/50 hover:translate-y-[-2px] transition-all z-50 cursor-pointer"
          title="العودة للأعلى"
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
