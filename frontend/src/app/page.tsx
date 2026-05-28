"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bell, Home, Users, FileText, Wrench, BookOpen, Settings, Plus, Menu, Sparkles, Filter, Search, MoreVertical, Loader2 } from "lucide-react";

// Define what a Paper looks like coming from your backend
interface Paper {
  _id: string;
  criteria: {
    subject: string;
    dueDate: string;
  };
  createdAt: string;
}

export default function DashboardLayout() {
  const [assignments, setAssignments] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from your backend when the page loads
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Change this URL if your backend runs on a different port!
        const response = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/papers"); 
        const data = await response.json();
        
        if (data.success) {
          // Sort by newest first
          const sortedData = data.papers.sort((a: Paper, b: Paper) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAssignments(sortedData);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    // Add a quick confirmation so users don't accidentally delete things!
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();

      if (data.success) {
        // This is the magic! It instantly removes the paper from the screen 
        // without needing to refresh the browser.
        setAssignments(assignments.filter((assignment) => assignment._id !== id));
      } else {
        alert("Failed to delete the assignment.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred while deleting.");
    }
  };

  // Format dates to match your Figma design (DD-MM-YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback if invalid date
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

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

          <Link href="/create">
            <button className="w-full bg-[#2b2b2b] border-[3px] border-[#e86a44] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 font-medium hover:bg-[#1a1a1a] transition-all mb-8 shadow-sm">
              <Sparkles size={18} className="text-white" fill="white" /> 
              Create Assignment
            </button>
          </Link>

          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-900 bg-gray-100 rounded-xl font-medium text-sm">
              <Home size={18} /> Home
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"><Users size={18} /> My Groups</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"><FileText size={18} /> Assignments</a>
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
      {/* RIGHT SIDE (Header + Main Content)          */}
      {/* ========================================= */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-gray-600 font-medium text-sm">Assignment</h1>
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <Image src="/logo.png" alt="VedaAI Logo" width={36} height={36} className="rounded-xl drop-shadow-sm object-contain" />
            <span className="text-xl font-bold text-gray-900 leading-none">VedaAI</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-gray-500 hover:text-gray-900"><Bell size={20} /></button>
            <div className="flex items-center gap-2 border border-gray-200 rounded-full py-1.5 px-2 md:px-3 bg-gray-50">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f4f5f7" alt="Profile" className="w-6 h-6 rounded-full"/>
              <span className="hidden md:block text-sm font-medium text-gray-700 pr-1">John Doe</span>
            </div>
            <button className="lg:hidden text-gray-700 hover:text-black"><Menu size={24} /></button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative rounded-2xl">
          
          {isLoading ? (
            // Loading State
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : assignments.length > 0 ? (
            
            // ==========================================
            // STATE 1: REAL GRID VIEW 
            // ==========================================
            <div className="h-full flex flex-col pt-4 px-2 md:px-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Assignments</h2>
                </div>
                <p className="text-sm text-gray-400">Manage and create assignments for your classes.</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium">
                  <Filter size={16} /> Filter By
                </button>
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search Assignment" className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"/>
                </div>
              </div>

              {/* Scrollable Grid populated with REAL database data */}
              <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow group relative">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-900 capitalize">
                          {assignment.criteria?.subject ? `Assignment on ${assignment.criteria.subject}` : "General Assignment"}
                        </h3>
                        <div className="relative group/menu">
                          <button className="text-gray-400 hover:text-gray-900 p-1">
                            <MoreVertical size={20} />
                          </button>
                          {/* Dropdown Menu (Hidden by default, shown on hover) */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 hidden group-hover/menu:block z-20">
                            <Link href={`/output/${assignment._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">View Assignment</Link>
                            <button 
                              onClick={() => handleDelete(assignment._id)} 
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 mt-auto">
                        <span>Assigned on: {formatDate(assignment.createdAt)}</span>
                        <span>Due: {formatDate(assignment.criteria?.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <Link href="/create">
                  <button className="bg-[#1a1a1a] text-white rounded-full py-3 px-6 flex items-center gap-2 font-medium hover:bg-black transition-all shadow-lg hover:scale-105">
                    <Plus size={18} /> Create Assignment
                  </button>
                </Link>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f5f7] to-transparent pointer-events-none z-0 hidden lg:block"></div>
            </div>
            
          ) : (

            // ==========================================
            // STATE 2: EMPTY VIEW (Database has 0 papers)
            // ==========================================
            <div className="h-full flex flex-col items-center justify-center overflow-y-auto pb-24 lg:pb-0">
              <div className="max-w-md w-full flex flex-col items-center text-center px-4">
                <div className="w-40 h-40 md:w-48 md:h-48 bg-gray-200 rounded-full flex items-center justify-center mb-8 relative">
                  <Image 
                  src="/illustrations.png" 
                  alt="A description of the image for screen readers" 
                  width={800} 
                  height={400} 
                  className="rounded-lg shadow-md"
                />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No assignments yet</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Create your first assignment to start collecting and grading student submissions. 
                  You can set up rubrics, define marking criteria, and let AI assist with grading.
                </p>
                <Link href="/create" className="hidden lg:block">
                  <button className="bg-[#1a1a1a] text-white rounded-full py-3 px-6 flex items-center gap-2 font-medium hover:bg-black transition-colors shadow-md">
                    <Plus size={18} /> Create Your First Assignment
                  </button>
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>
      
      {/* ========================================= */}
      {/* MOBILE FLOATING ELEMENTS                    */}
      {/* ========================================= */}
      <Link href="/create">
        <button className="lg:hidden fixed bottom-28 right-6 w-12 h-12 bg-white text-orange-500 rounded-full shadow-lg border border-gray-100 flex items-center justify-center font-bold text-xl z-40 hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
      </Link>

      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1a1a1a] text-white rounded-3xl px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
        <Link href="/" className="flex flex-col items-center gap-1 text-white"><Home size={20} /><span className="text-[10px] font-medium">Home</span></Link>
        <Link href="/create" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><FileText size={20} /><span className="text-[10px] font-medium">Assignments</span></Link>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><BookOpen size={20} /><span className="text-[10px] font-medium">Library</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"><Wrench size={20} /><span className="text-[10px] font-medium">AI Toolkit</span></button>
      </nav>

    </div>
  );
}
