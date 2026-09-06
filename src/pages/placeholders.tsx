import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 max-w-md mx-auto">This page is currently under construction as part of the initial implementation phase.</p>
      </div>
    </div>
  );
};

export const CandidateRanking = () => <PlaceholderPage title="AI Screening & Candidates" />;
export const CandidateDetail = () => <PlaceholderPage title="Candidate Profile" />;
export const Settings = () => <PlaceholderPage title="Platform Settings" />;
