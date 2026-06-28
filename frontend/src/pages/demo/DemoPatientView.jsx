import { useParams, Link } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { getScenarioById } from "../../api/demo";
import ScribeRecorder from "../../components/visit/ScribeRecorder";
import { 
  Calendar, FileText, ArrowLeft, Heart, 
  MapPin, Phone, User, Activity, Clock, 
  MessageSquare, Send, CheckCircle2, ChevronRight, XCircle, ChevronDown, ChevronLeft,
  AlertTriangle, CheckSquare, Pill, Mic
} from 'lucide-react';

export default function DemoPatientView() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    getScenarioById(id).then(res => setData(res.data)).catch(console.error);
  }, [id]);

  const patient = data?.patient;
  const visits = [...(data?.visits || [])].sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));

  if (!patient) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col font-sans bg-gray-50 overflow-hidden">
      {/* Demo Mode Top Banner */}
      <div className="bg-orange-500 text-white text-sm font-medium py-1.5 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 rounded-full bg-white block"></span>
          Demo Mode — Viewing {patient.name}'s Profile
        </div>
        <Link to="/demo/scenarios" className="flex items-center gap-1 hover:text-orange-100 transition-colors text-xs font-bold uppercase tracking-wider bg-orange-600 px-3 py-1 rounded">
          <ArrowLeft size={14} />
          Exit Demo
        </Link>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-10 shadow-sm relative">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Shifa<span className="text-emerald-500">.ai</span></span>
          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Patient Panel</span>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <span 
              onClick={() => { setActiveTab('profile'); setSelectedVisit(null); }}
              className={`pb-4 pt-4 px-1 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'hover:text-gray-900'}`}>Profile</span>
            <span 
              onClick={() => { setActiveTab('myHealth'); setSelectedVisit(null); }}
              className={`pb-4 pt-4 px-1 cursor-pointer transition-colors ${activeTab === 'myHealth' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'hover:text-gray-900'}`}>My Health</span>
            <span 
              onClick={() => { setActiveTab('reference'); setSelectedVisit(null); }}
              className={`pb-4 pt-4 px-1 cursor-pointer transition-colors ${activeTab === 'reference' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'hover:text-gray-900'}`}>Reference</span>
            <span 
              onClick={() => { setActiveTab('record'); setSelectedVisit(null); }}
              className={`flex items-center gap-2 pb-4 pt-4 px-1 cursor-pointer transition-colors ${activeTab === 'record' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'hover:text-gray-900'}`}>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Record Visit
            </span>
          </nav>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 pr-2 rounded-full transition-colors pb-1 pt-1 pl-1">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              {patient.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">{patient.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </header>

      {/* Content Area flex */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Scrollable Area */}
        <div className="flex-1 overflow-y-auto w-full p-6 relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            
            {!selectedVisit ? (
              // ----------------- TAB VIEWS -----------------
              <>
                {activeTab === 'profile' && (
                  <>
                    {/* Patient Header Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-inner flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                            <p className="text-gray-500 text-sm mt-1">{patient.gender}, {patient.age} y.o.</p>
                            <p className="text-gray-400 text-xs mt-0.5">{patient.name.toLowerCase().replace(' ', '.')}@demo.shifa.ai</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-300" />
                        </div>
                      </div>
                    </div>

                    {/* Visits Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          Visit History
                        </h2>
                        <button className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-sm font-bold border border-emerald-100">
                          <CheckCircle2 size={16}/> Ask
                        </button>
                      </div>

                      <div className="space-y-4">
                        {visits.map((visit, idx) => {
                          const vDate = new Date(visit.visitDate);
                          const mockDocs = [
                            { name: "Dr. Michał Nedoszytko", specialty: "Cardiology" },
                            { name: "Dr. rwerwer werwer", specialty: "Werwer" },
                            { name: "Dr. Sarah Chen", specialty: "Cardiology" },
                            { name: "Dr. Michał Nedoszytko", specialty: "Cardiology" },
                            { name: "Dr. Sarah Chen", specialty: "Cardiology" }
                          ];
                          const doc = mockDocs[idx % mockDocs.length];
                          return (
                          <div 
                            key={visit.id} 
                            className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => setSelectedVisit({ ...visit, mockDoc: doc })}
                          >
                            {/* Date Left Column */}
                            <div className="flex flex-col items-center justify-start flex-shrink-0 w-16">
                              <div className="bg-indigo-500 text-white text-[10px] font-bold uppercase w-12 text-center rounded-t-md py-1">
                                {vDate.toLocaleString('default', { month: 'short' })}
                              </div>
                              <div className="bg-indigo-50 text-indigo-900 text-xl font-bold w-12 text-center rounded-b-md py-1 border border-indigo-100 border-t-0">
                                {vDate.getDate()}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-gray-500">{visit.visitType || 'Office Visit'}</span>
                                <span className="text-indigo-600 text-xs font-semibold hover:underline">Contact</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs bg-cover bg-center"
                                     style={doc.name === "Dr. Sarah Chen" ? {backgroundImage: 'url(https://i.pravatar.cc/100?img=5)'} : 
                                            doc.name.includes("Michał") ? {backgroundImage: 'url(https://i.pravatar.cc/100?img=11)'} : {}}>
                                  {!doc.name.includes("Michał") && !doc.name.includes("Sarah") && "Dr"}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 text-sm">{doc.name}</h3>
                                  <p className="text-xs text-indigo-500">{doc.specialty}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{visit.chiefComplaint || visit.diagnosis || 'General Consultation'}</p>
                            </div>
                            <div className="flex items-center justify-center px-2">
                              <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                          </div>
                        )})}

                        {visits.length === 0 && (
                          <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-500">
                            <XCircle size={32} className="mx-auto mb-3 text-gray-300" />
                            <p>No past visits recorded.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'record' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-12">
                    <ScribeRecorder 
                      onCancel={() => setActiveTab('profile')} 
                      onAudioReady={(blob) => {
                        console.log('Audio recorded:', blob);
                        alert('Recording complete! Processing feature coming soon.');
                        setActiveTab('profile');
                      }} 
                    />
                  </div>
                )}

                {['myHealth', 'reference'].includes(activeTab) && (
                  <div className="pt-24 pb-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                      {activeTab === 'myHealth' ? <Activity size={32} /> : <FileText size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeTab === 'myHealth' ? 'My Health' : 'Reference Materials'}
                    </h2>
                    <p className="text-gray-500 max-w-md">
                      This section is part of the Shifa platform but is currently under development. 
                      Check back later for medical records, lab results, and patient education materials.
                    </p>
                  </div>
                )}
              </>
            ) : (
              // ----------------- VISIT SUMMARY VIEW -----------------
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setSelectedVisit(null)}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back to Profile
                </button>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Visit Summary</h1>
                
                {/* Visit Summary Header row */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex flex-col items-center justify-start flex-shrink-0">
                    <div className="bg-indigo-500 text-white text-[10px] font-bold uppercase w-10 text-center rounded-t-sm py-0.5">
                      {new Date(selectedVisit.visitDate).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="bg-indigo-50 text-indigo-900 text-sm font-bold w-10 text-center rounded-b-sm py-0.5 border border-indigo-100 border-t-0">
                      {new Date(selectedVisit.visitDate).getDate()}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{selectedVisit.visitType?.replace('_', ' ') || 'Office Visit'}</span>
                  <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] text-indigo-800 bg-cover bg-center"
                         style={selectedVisit.mockDoc?.name === "Dr. Sarah Chen" ? {backgroundImage: 'url(https://i.pravatar.cc/100?img=5)'} : 
                         selectedVisit.mockDoc?.name?.includes("Michał") ? {backgroundImage: 'url(https://i.pravatar.cc/100?img=11)'} : {}}>
                      {!selectedVisit.mockDoc?.name?.includes("Michał") && !selectedVisit.mockDoc?.name?.includes("Sarah") && "Dr"}
                    </div>
                    {selectedVisit.mockDoc?.name || 'Dr. Assigned Provider'} • <span className="lowercase">{selectedVisit.mockDoc?.specialty || 'General Practice'}</span>
                  </div>
                </div>

                {/* Dynamic Visit Content */}
                {(() => {
                  let detailedData = null;
                  if (selectedVisit.rawNotes && selectedVisit.rawNotes.startsWith('{')) {
                    try {
                      detailedData = JSON.parse(selectedVisit.rawNotes);
                    } catch (e) {}
                  }

                  return (
                    <>
                      {/* Quick Summary highlighted box */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6 flex gap-4">
                        <div className="mt-1">
                          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center text-xs font-bold">i</div>
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-800 mb-2 text-sm">Quick Summary</h3>
                          <p className="text-emerald-900 text-sm leading-relaxed">
                            {detailedData ? detailedData.quickSummary : (
                              <>Patient presented with <strong>{selectedVisit.chiefComplaint || 'general concerns'}</strong>. {selectedVisit.diagnosis ? `Diagnosed with ${selectedVisit.diagnosis}.` : 'Evaluation performed.'} Follow-up required as directed.</>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Sections */}
                      <div className="space-y-3 pb-8">
                        {detailedData ? (
                          <>
                            <ExpandableSection icon={<MessageSquare size={16}/>} title="Chief Complaint" content={
                              <div className="text-gray-700 text-sm">
                                Heart <span className="text-emerald-700 border-b border-dashed border-emerald-400 cursor-help relative group">palpitations</span> and <span className="text-emerald-700 border-b border-dashed border-emerald-400 cursor-help relative group">
                                  irregular heartbeat
                                  <div className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block z-50 transition-all text-sm font-normal text-gray-700 normal-case shadow-emerald-500/10">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold text-emerald-800">irregular heartbeat</h4>
                                      <button className="text-gray-400 hover:text-gray-600"><XCircle size={14}/></button>
                                    </div>
                                    <p>When the heart doesn't beat in its normal steady rhythm. Your EKG showed extra beats (PVCs) causing this irregularity.</p>
                                    <div className="mt-3 flex justify-end">
                                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> Ask</span>
                                    </div>
                                  </div>
                                </span> for 3 weeks
                              </div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<Clock size={16}/>} title="History of Present Illness" content={
                              <div className="text-gray-700 text-sm leading-relaxed">{detailedData.historyOfPresentIllness}</div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<FileText size={16}/>} title="Reported Symptoms" content={
                              <div className="text-gray-700 text-sm leading-relaxed">{detailedData.reportedSymptoms}</div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<Heart size={16}/>} title="Physical Examination" content={
                              <div className="text-gray-700 text-sm leading-relaxed">{detailedData.physicalExamination}</div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<Activity size={16}/>} title="Assessment" content={
                              <div className="text-gray-700 text-sm leading-relaxed">{detailedData.assessment}</div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<CheckCircle2 size={16}/>} title="Plan" content={
                              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                {detailedData.plan.map((p, i) => <li key={i}>{p}</li>)}
                              </ul>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<Calendar size={16}/>} title="Follow-up" content={
                              <div className="text-gray-700 text-sm">{detailedData.followUp}</div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<AlertTriangle size={16}/>} title="Doctor's Recommendations" content={
                              <div className="space-y-2">
                                {detailedData.plan.map((p, i) => (
                                  <div key={i} className="flex gap-3 items-start bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                                    <div className="min-w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xs">{i + 1}</div>
                                    <span className="text-sm pt-0.5">{p}</span>
                                  </div>
                                ))}
                              </div>
                            } defaultOpen={true} />
                            <ExpandableSection icon={<CheckSquare size={16}/>} title="Next Actions" content={
                              <div className="space-y-3">
                                <label className="flex items-start gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                  <span className="text-sm text-gray-700 leading-relaxed font-medium">{detailedData.followUp}</span>
                                </label>
                                {detailedData.medicationsPrescribed.map((m, i) => (
                                  <label key={i} className="flex items-start gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                    <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                    <span className="text-sm text-gray-700 leading-relaxed font-medium">Take {m.name} {m.instruction}</span>
                                  </label>
                                ))}
                              </div>
                            } defaultOpen={true} />
                            
                            <ExpandableSection icon={<Activity size={16}/>} title={<div className="flex items-center">Test Results & Observations <span className="inline-flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-[10px] w-6 h-6 rounded-full ml-2">39</span></div>} content={
                               <div className="space-y-4 text-sm">
                                 <div className="flex gap-4 border-b border-gray-100 pb-3 mb-4 mt-2">
                                   <button className="text-gray-900 font-medium px-4 py-1 bg-gray-900 rounded-full text-white text-xs">All (39)</button>
                                   <button className="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 text-xs">Vitals (1)</button>
                                   <button className="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 text-xs">Exams (2)</button>
                                   <button className="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 text-xs">Lab (36)</button>
                                 </div>
                                 {detailedData.testResults.map((t, i) => (
                                   <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                     <div className="flex justify-between items-center mb-1">
                                       <span className="font-bold text-gray-900 text-sm">{t.name} <span className="ml-2 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Normal</span></span>
                                       <span className="text-xs text-gray-400">{t.date}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <span className="text-sm text-gray-600 font-medium">{t.value}</span>
                                     </div>
                                   </div>
                                 ))}
                                 <div className="border-b border-gray-100 pb-3">
                                  <div className="flex justify-between items-center mb-1">
                                     <span className="font-bold text-gray-900 text-sm">Total cholesterol <span className="ml-2 text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">High</span></span>
                                     <span className="text-xs text-gray-400">Feb 15</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-900 font-bold">215 mg/dL <span className="text-xs text-gray-500 font-normal ml-1">(Desirable: &lt;200 mg/dL)</span></span>
                                    <div className="w-full bg-gray-100 h-1 mt-2 rounded-full relative"><div className="absolute right-0 bg-red-400 h-full w-1/4 rounded-full"></div></div>
                                  </div>
                                 </div>
                               </div>
                            } defaultOpen={true} />

                            <ExpandableSection icon={<Activity size={16}/>} title="Diagnosis" content={
                              <div className="space-y-4">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">I49.3</span>
                                    <span className="font-bold text-gray-900 text-sm">Premature ventricular contractions</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2">Patient reports frequent palpitations for 3 weeks. EKG confirms frequent PVCs. Echocardiogram shows preserved EF. Starting beta-blocker therapy.</p>
                                </div>
                              </div>
                            } defaultOpen={true} />

                            <ExpandableSection icon={<Pill size={16}/>} title="Medications Prescribed" content={
                              <div className="space-y-3">
                                {detailedData.medicationsPrescribed.map((m, i) => (
                                  <div key={i} className="border-b border-gray-100 pb-3">
                                    <h4 className="font-bold text-gray-900 text-sm">{m.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{m.instruction}</p>
                                    <p className="text-xs text-gray-500 mt-1">{m.notes}</p>
                                  </div>
                                ))}
                              </div>
                            } defaultOpen={true} />

                            <ExpandableSection icon={<FileText size={16}/>} title="Attachments" hideAsk={true} content={
                              <div className="space-y-3">
                                <div className="border border-dashed border-emerald-300 rounded-xl py-8 px-6 flex flex-col items-center justify-center text-center bg-emerald-50/30">
                                  <div className="w-10 h-10 bg-white rounded-full border border-emerald-100 flex items-center justify-center text-emerald-500 mb-3 shadow-sm">
                                    <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                  </div>
                                  <p className="text-sm text-gray-600"><span className="text-emerald-600 font-medium">Upload files</span> or drag and drop</p>
                                  <p className="text-xs text-gray-400 mt-1">Images, PDF · up to 20 MB</p>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                  <Phone size={16} /> Upload from phone
                                </button>
                                <p className="text-center text-xs text-gray-400 pt-2">No attachments yet. Upload your ECG, imaging, or lab results.</p>
                              </div>
                            } defaultOpen={true} />

                            <ExpandableSection icon={<Mic size={16}/>} title={<div className="flex items-center gap-2">Visit Transcript <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase text-[10px] font-bold">Completed</span></div>} content={
                              <div className="space-y-4 text-sm leading-relaxed text-gray-700 pb-4">
                                <div className="text-xs text-gray-400 mb-4 uppercase">
                                  VISIT TRANSCRIPT — Shifa Demo<br/>
                                  Date: 2026-02-15<br/>
                                  Provider: Dr. Ananya Sharma, MD — Cardiology<br/>
                                  Patient: Rajesh Kumar, 52M
                                </div>
                                {detailedData.transcript.map((t, i) => (
                                  <div key={i} className="flex gap-3">
                                    <span className="text-xs text-gray-400 w-8 shrink-0 py-0.5">{t.time}</span>
                                    <div>
                                      <span className={`font-bold mr-2 uppercase text-[11px] tracking-wider ${t.speaker === 'DR. NEDO' ? 'text-emerald-700' : 'text-indigo-700'}`}>{t.speaker}:</span>
                                      {t.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            } defaultOpen={true} />
                          </>
                        ) : (
                          <>
                            <ExpandableSection icon={<MessageSquare size={16}/>} title="Chief Complaint" content={selectedVisit.chiefComplaint || "No specific complaint."} />
                            <ExpandableSection icon={<Clock size={16}/>} title="History of Present Illness" content={"Detailed history not recorded at this time."} />
                            <ExpandableSection icon={<FileText size={16}/>} title="Reported Symptoms" content={selectedVisit.chiefComplaint} />
                            <ExpandableSection icon={<Heart size={16}/>} title="Physical Examination" content={"Vitals stable. Examination unremarkable unless noted in diagnosis."} />
                            <ExpandableSection icon={<Activity size={16}/>} title="Assessment" content={selectedVisit.diagnosis || "Pending assessment."} />
                            <ExpandableSection icon={<CheckCircle2 size={16}/>} title="Plan" content={selectedVisit.rawNotes || "Follow prescribed treatment. Return to clinic if symptoms worsen."} />
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

          </div>
        </div>

        {/* Right Sidebar - AI Assistant (RAG-Powered) */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 flex-shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Shifa</h3>
                <p className="text-[10px] text-gray-500">Ask anything about your visit</p>
              </div>
            </div>
            <div className="text-gray-400 flex gap-2">
              <Activity size={16} />
            </div>
          </div>
          
          <RagChatPanel patientId={id} patientName={patient.name} />
        </div>

      </div>
    </div>
  );
}

// Sub-components
function SuggestionChip({ text }) {
  return (
    <button className="w-full text-left bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors shadow-sm">
      {text}
    </button>
  );
}

function ExpandableSection({ icon, title, content, defaultOpen = false, hideAsk = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm">
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="text-emerald-500">{icon}</div>
          <span className="font-bold text-gray-900 text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {!hideAsk && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12}/> Ask
            </span>
          )}
          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
            {open ? 'Collapse' : 'Expand'}
            <ChevronDown size={14} className={`transform transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </div>
      {open && (
        <div className="px-6 pb-5 pt-0 text-sm text-gray-600 border-t border-gray-100 mt-2 pt-4">
          {content}
        </div>
      )}
    </div>
  );
}

// ─── RAG-Powered Chat Panel ───────────────────────────────────────────────────
const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:5050';

const CHAT_SUGGESTIONS = [
  "What does my diagnosis mean in simple terms?",
  "Explain my medication and side effects",
  "What should I watch out for at home?",
];

function RagChatPanel({ patientId, patientName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = (text || "").trim();
    if (!q || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${RAG_API_URL}/api/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          question: q,
          language: "en",
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || "I couldn't find an answer to that question.",
          sources: data.sources || [],
          disclaimer: data.disclaimer || "",
        },
      ]);
    } catch (err) {
      console.error("[RAG Chat] Error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting right now. Please make sure the RAG service is running and try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4 flex flex-col">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center flex-1 text-center pt-8 pb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Your visit assistant</h2>
            <p className="text-xs text-gray-500 mt-2 px-6 leading-relaxed">
              I have the full context of your visit. Ask me anything about your diagnosis, medications, or next steps.
            </p>
            <div className="w-full space-y-2 mt-6">
              {CHAT_SUGGESTIONS.map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(text)}
                  className="w-full text-left bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Shifa AI</span>
                </div>
              )}
              <div
                className={[
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : msg.error
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm',
                ].join(' ')}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.sources.map((src, j) => (
                    <span key={j} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      📋 {src.type === 'visit_record' ? `Visit ${src.visit_date}` : src.type === 'patient_profile' ? 'Profile' : src.type}
                      {src.doctor_name && ` · ${src.doctor_name}`}
                    </span>
                  ))}
                </div>
              )}
              {/* Disclaimer */}
              {msg.disclaimer && (
                <p className="mt-2 text-[10px] text-gray-400 italic">{msg.disclaimer}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500">Shifa AI</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <span className="text-gray-400 font-bold px-1">+</span>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Ask about your visit..."
            className="w-full bg-transparent border-transparent py-2 px-2 outline-none text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={loading}
          />
          <button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className={`py-1.5 px-4 rounded-full text-sm font-bold transition-colors shrink-0 ${
              input.trim() && !loading 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-emerald-100 text-emerald-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
