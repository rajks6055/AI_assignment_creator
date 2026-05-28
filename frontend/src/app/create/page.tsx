"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudUpload, Plus, Sparkles, ArrowLeft, ArrowRight, Loader2, Bell, Home, Users, FileText, Wrench, BookOpen, Settings, Menu, Mic } from "lucide-react";
import { io } from "socket.io-client";

export default function CreateAssignment() {
const fileInputRef = useRef<HTMLInputElement>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  const [questions, setQuestions] = useState([
    { id: 1, type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: 2, type: "Short Questions", count: 3, marks: 2 },
  ]);

  const totalQuestions = questions.reduce((sum, q) => sum + (Number(q.count) || 0), 0);
  const totalMarks = questions.reduce((sum, q) => sum + ((Number(q.count) || 0) * (Number(q.marks) || 0)), 0);

  // Validation & Generation Logic
  const handleGenerate = async () => {
    // 1. Validation Logic (Kept exactly as you had it)
    const hasInvalidQuestions = questions.some(q => q.count <= 0 || q.marks < 0);
    if (hasInvalidQuestions) {
      alert("⚠️ Number of questions must be at least 1, and marks cannot be negative.");
      return;
    }

    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(new Date().getDate() + 7);
      sevenDaysFromNow.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < sevenDaysFromNow) {
        alert("⚠️ Due date must be at least 7 days from today.");
        return;
      }
    }

    setIsGenerating(true);
    
    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      alert("The AI took too long to respond. Please check your backend terminal.");
    }, 90000); 

    try {
      // 2. CREATE FORMDATA: This replaces your JSON.stringify()
      const formData = new FormData();
      
      formData.append("subject", subject || "General");
      formData.append("grade", grade || "Any");
      formData.append("dueDate", dueDate || "Not specified");
      formData.append("additionalInfo", additionalInfo || "");
      
      // Convert the questions array to a string and append it
      const formattedQuestions = questions.map(q => `${q.count} ${q.type} (${q.marks} marks each)`).join(", ");
      formData.append("questions", formattedQuestions);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // 4. THE FETCH CALL
      const response = await fetch("http://localhost:5000/api/papers/generate", {
        method: "POST",
        body: formData, 
      });

      const data = await response.json();

      // 5. WebSocket Logic (Kept exactly as you had it)
      if (data.success) {
        const socket = io("http://localhost:5000");
        
        socket.on("paper-ready", (socketData) => {
          if (socketData.paperId === data.paperId) {
            clearTimeout(timeoutId);
            socket.disconnect();
            router.push(`/output/${data.paperId}`);
          }
        });

        socket.on("paper-failed", (socketData) => {
          if (socketData.paperId === data.paperId) {
            clearTimeout(timeoutId);
            socket.disconnect();
            setIsGenerating(false);
            alert("Google AI failed to generate the paper. Please try again.");
          }
        });
      } else {
        clearTimeout(timeoutId);
        setIsGenerating(false);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Failed to generate:", error);
      setIsGenerating(false);
    }
  };


  const addQuestionRow = () => setQuestions([...questions, { id: Date.now(), type: "Multiple Choice Questions", count: 0, marks: 0 }]);
  const removeQuestionRow = (id: number) => setQuestions(questions.filter((q) => q.id !== id));
  const updateQuestion = (id: number, field: string, value: string | number) => setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + 7);
  const minDateString = minDateObj.toISOString().split('T')[0];

  return (
    <div className="flex h-screen bg-[#f4f5f7] p-2 md:p-4 gap-4 font-sans overflow-hidden relative">
      
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR                           */}
      {/* ========================================= */}
      <aside className="hidden lg:flex w-64 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex px-2 mb-8 mt-2">
            <Image src="/logo.png" alt="VedaAI Logo" width={48} height={48} className="rounded-xl drop-shadow-sm object-contain" />
            <span className="text-2xl font-bold text-gray-900 leading-none">VedaAI</span>
          </div>
          <button className="w-full bg-[#2b2b2b] border-[3px] border-[#e86a44] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 font-medium hover:bg-[#1a1a1a] transition-all mb-8 shadow-sm">
            <Sparkles size={18} className="text-white" fill="white" /> 
            Create Assignment
          </button>
          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm">
              <Home size={18} /> Home
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"><Users size={18} /> My Groups</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-900 bg-gray-100 rounded-xl font-medium text-sm"><FileText size={18} /> Assignments</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"><Wrench size={18} /> AI Teacher's Toolkit</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"><BookOpen size={18} /> My Library</a>
          </nav>
        </div>
        <div className="space-y-4">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 font-medium text-sm"><Settings size={18} /> Settings</a>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">DP</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Delhi Public School</p>
              <p className="text-xs text-gray-500">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MAIN RIGHT COLUMN                         */}
      {/* ========================================= */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-gray-600 font-medium text-sm">Assignment</h1>
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white font-bold text-xs">V</div>
            <span className="text-lg font-bold">VedaAI</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-gray-500 hover:text-gray-900"><Bell size={20} /></button>
            <div className="flex items-center gap-2 border border-gray-200 rounded-full py-1.5 px-2 md:px-3 bg-gray-50">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f4f5f7" alt="Profile" className="w-6 h-6 rounded-full"/>
              <span className="hidden md:block text-sm font-medium text-gray-700 pr-1">John Doe</span>
            </div>
            <button className="lg:hidden text-gray-700"><Menu size={24} /></button>
          </div>
        </header>

        {/* SCROLLABLE FORM AREA */}
        <main className="flex-1 overflow-y-auto rounded-2xl pb-24 lg:pb-0 pr-2 custom-scrollbar">
            
            {/* Title & Progress Bar */}
            <div className="mb-8 px-2">
              <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
              <p className="text-gray-500 text-sm mt-1">Set up a new assignment for your students</p>
            </div>
          <div className="max-w-4xl mx-auto pt-4 md:pt-8 pb-12">
              <div className="flex h-1 mb-8 max-w-2xl">
                <div className="w-80 bg-gray-900 rounded-l-full"></div>
                <div className="flex-1 bg-gray-200 rounded-r-full"></div>
              </div>

            {/* White Form Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-10">
              
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900">Assignment Details</h2>
                <p className="text-gray-500 text-sm">Basic information about your assignment</p>
              </div>

              {/* Upload Area */}
              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                {/* Hidden actual file input */}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf" 
                />

                <CloudUpload size={40} className="text-gray-600 mb-4" />
                <h3 className="text-gray-900 font-bold mb-1">Choose a file or drag & drop it here</h3>
                <p className="text-gray-500 text-sm mb-6">PDF format (Max 10MB)</p>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Browse Files
                </button>

                {/* Show the selected file name so the user knows it worked! */}
                {selectedFile && (
                  <p className="mt-4 text-sm font-bold text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <p className="text-xs text-center text-gray-400 mb-10">Upload images of your preferred document/image</p>

              {/* Subject, Grade, Due Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Science" className="w-full py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class / Grade</label>
                  <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 10th" className="w-full py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input type="date" value={dueDate} min={minDateString} onChange={(e) => setDueDate(e.target.value)} className="w-full py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-600" />
                </div>
              </div>

              {/* Question Types Area */}
              <div className="mb-10">
                <div className="hidden md:flex justify-between items-end mb-4 px-1">
                  <label className="block text-sm font-medium text-gray-700">Question Type</label>
                  <div className="flex gap-14 pr-10 text-xs font-medium text-gray-500">
                    <span>No. of Questions</span>
                    <span>Marks</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="flex flex-col md:flex-row gap-3 md:items-center relative">
                      <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)} className="w-full md:flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-700 appearance-none">
                        <option>Multiple Choice Questions</option>
                        <option>Short Questions</option>
                        <option>Diagram/Graph-Based Questions</option>
                        <option>Numerical Problems</option>
                      </select>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="hidden md:block text-gray-300 font-medium px-1">×</span>
                        <div className="flex-1 md:w-28 relative">
                          <span className="md:hidden absolute left-4 top-3 text-xs text-gray-400">Qty:</span>
                          <input type="number" value={q.count} onChange={(e) => updateQuestion(q.id, 'count', e.target.value)} className="w-full py-3 px-4 md:text-center text-right bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="flex-1 md:w-28 relative">
                          <span className="md:hidden absolute left-4 top-3 text-xs text-gray-400">Marks:</span>
                          <input type="number" value={q.marks} onChange={(e) => updateQuestion(q.id, 'marks', e.target.value)} className="w-full py-3 px-4 md:text-center text-right bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <button onClick={() => removeQuestionRow(q.id)} className="text-gray-400 hover:text-red-500 p-2 shrink-0">
                           <span className="text-xl leading-none">&times;</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addQuestionRow} className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-sm font-medium rounded-full hover:bg-black transition-colors">
                  <Plus size={16} /> Add Question Type
                </button>

                <div className="flex flex-col items-end mt-8 text-sm text-gray-700 font-bold space-y-1 pr-4 md:pr-12">
                  <p>Total Questions : <span className="text-black ml-2">{totalQuestions}</span></p>
                  <p>Total Marks : <span className="text-black ml-2">{totalMarks}</span></p>
                </div>

                {/* ========================================== */}
                {/* ADDITIONAL INFORMATION SECTION             */}
                {/* ========================================== */}
                <div className="mt-10 mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-4">
                    Additional Information (For better output)
                  </label>
                  <div className="relative">
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="e.g Generate a question paper for 3 hour exam duration..."
                      className="w-full min-h-[120px] p-5 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
                    ></textarea>

                    {/* Microphone Icon button positioned in the bottom right corner */}
                    <button type="button" className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                      <Mic size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={16} /> Previous
                </Link>
                
                <button onClick={handleGenerate} disabled={isGenerating} className={`flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-sm font-medium transition-all ${isGenerating ? 'opacity-80 cursor-wait' : 'hover:bg-black active:scale-95 shadow-md hover:shadow-lg'}`}>
                  {isGenerating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <>Generate Paper <ArrowRight size={16} /></>}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1a1a1a] text-white rounded-3xl px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><Home size={20} /><span className="text-[10px] font-medium">Home</span></Link>
        <Link href="/create" className="flex flex-col items-center gap-1 text-white"><FileText size={20} /><span className="text-[10px] font-medium">Assignments</span></Link>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><BookOpen size={20} /><span className="text-[10px] font-medium">Library</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><Wrench size={20} /><span className="text-[10px] font-medium">AI Toolkit</span></button>
      </nav>
    </div>
  );
}