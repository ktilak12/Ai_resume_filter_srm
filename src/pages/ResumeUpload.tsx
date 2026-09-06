import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { INITIAL_JOBS } from '../data/srmDataset';

export const ResumeUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedJob, setSelectedJob] = useState(INITIAL_JOBS[0].id);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setFiles([]);
            alert('Resumes successfully uploaded and queued for AI screening!');
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume Upload</h1>
        <p className="text-slate-400 mt-1">Upload student resumes for bulk AI parsing and screening.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <label htmlFor="job-select" className="block text-sm font-medium text-slate-300 mb-2">Target Placement Drive</label>
          <select 
            id="job-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-srm-500 focus:border-transparent transition-colors"
          >
            {INITIAL_JOBS.map(job => (
              <option key={job.id} value={job.id}>{job.company} - {job.title}</option>
            ))}
          </select>
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragActive ? 'border-srm-500 bg-srm-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={inputRef}
            type="file" 
            multiple 
            accept=".pdf,.docx,.doc"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-sm">
            <UploadCloud className="h-8 w-8 text-srm-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Drag and drop resumes here</h3>
          <p className="text-slate-400 text-sm mb-6">Supports PDF and DOCX (Max 10MB per file)</p>
          <button 
            onClick={() => inputRef.current?.click()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-300 mb-4 flex justify-between">
              <span>Selected Files ({files.length})</span>
              <button onClick={() => setFiles([])} className="text-slate-500 hover:text-slate-300 text-xs">Clear all</button>
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <File className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-200 truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-6">
              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin text-srm-400" /> 
                      Uploading and Parsing...
                    </span>
                    <span className="text-white font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-srm-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={simulateUpload}
                  className="w-full bg-srm-600 hover:bg-srm-500 text-white py-3 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-srm-500 flex justify-center items-center"
                >
                  <UploadCloud className="h-5 w-5 mr-2" />
                  Upload & Screen {files.length} Resumes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Upload Guidelines */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-srm-400" />
          Best Practices for Bulk Upload
        </h3>
        <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
          <li>Ensure resumes are primarily text-based for optimal parsing accuracy.</li>
          <li>We recommend grouping resumes by department before uploading for easier tracking.</li>
          <li>The AI engine automatically handles variations in date formats and section headings.</li>
          <li>For batches larger than 500 resumes, processing might take a few minutes in the background.</li>
        </ul>
      </div>
    </div>
  );
};
