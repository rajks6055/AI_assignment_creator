"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileText, Sparkles, Loader2 } from "lucide-react";

export default function AssignmentOutput() {
  const params = useParams();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH THE REAL DATA FROM MONGODB
  // ==========================================
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/papers/${params.id}`);
        const data = await response.json();
        
        if (data.success && data.paper.generatedContent) {
          setPaper(data.paper.generatedContent);
        }
      } catch (error) {
        console.error("Error fetching paper:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchPaper();
  }, [params.id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center pt-32">
        <Loader2 className="animate-spin text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Retrieving your AI document...</p>
      </div>
    );
  }

  if (!paper) {
    return <div className="text-center pt-32 text-red-500">Document not found or still generating.</div>;
  }

  return (
    <div className="min-h-full p-4 md:p-8 flex flex-col items-center bg-[#f4f5f6]">
      <div className="w-full max-w-4xl">
        
        {/* Header Ribbon */}
        <div className="bg-[#1e2530] text-gray-200 rounded-2xl p-4 md:p-6 mb-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white mt-0.5 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-relaxed">
                Certainly! Here is your customized Question Paper based on your specific criteria.
              </p>
            </div>
          </div>
          <button onClick={handlePrint} className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow transition-colors">
            <Download size={14} /> Download as PDF
          </button>
        </div>

        {/* Real Exam Paper Sheet */}
        <div id="printable-exam-paper" className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-12 text-gray-900 font-serif leading-relaxed">
          
          <div className="text-center mb-6 font-sans">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{paper.schoolName || "Delhi Public School"}</h2>
            <div className="flex justify-center gap-6 text-sm text-gray-600 mt-1 font-medium">
              <span>Subject: {paper.subject}</span>
              <span>Class: {paper.className}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-gray-300 pb-4 mb-6 font-sans font-medium">
            <span>Time Allowed: {paper.timeAllowed}</span>
            <span>Maximum Marks: {paper.maxMarks}</span>
          </div>

          <p className="text-xs italic text-gray-500 mb-8 font-sans">* {paper.instructions}</p>

          {paper.sections?.map((section: any, sIdx: number) => (
            <div key={sIdx} className="mb-10">
              <div className="text-center mb-4">
                <h3 className="text-base font-bold font-sans tracking-wide uppercase bg-gray-100 px-4 py-1 rounded-md inline-block">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 italic font-sans px-4">{section.instruction}</p>
              </div>

              <div className="space-y-6 mt-6">
                {section.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="flex items-start justify-between gap-4 group text-sm md:text-base">
                    <div className="flex items-start gap-2.5">
                      <span className="font-sans font-semibold text-sm text-gray-400 mt-0.5">{qIdx + 1}.</span>
                      <div className="space-y-1">
                        {q.difficulty && (
                          <span className="inline-block text-[10px] uppercase font-sans font-extrabold tracking-wider px-1.5 py-0.5 rounded mr-2 border bg-gray-50 text-gray-600 border-gray-200">
                            {q.difficulty}
                          </span>
                        )}
                        <span className="text-gray-800 font-medium">{q.text}</span>
                      </div>
                    </div>
                    <span className="font-sans text-xs font-bold text-gray-400 whitespace-nowrap shrink-0 mt-1">
                      [{q.marks} Marks]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center border-t border-b border-gray-100 py-2 my-8 text-xs font-sans tracking-widest text-gray-400 uppercase font-semibold">
            End of Question Paper
          </div>

          {paper.answerKey && (
            <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200 bg-slate-50 p-6 rounded-xl">
              <h4 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} className="text-slate-500" /> Answer Key Preview (Teacher Eyes Only)
              </h4>
              <ol className="list-decimal pl-5 space-y-3 text-xs text-slate-600 font-sans">
                {paper.answerKey.map((ans: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{ans}</li>
                ))}
              </ol>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}