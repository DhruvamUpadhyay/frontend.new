"use client";
import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Placeholder Stat Cards */}
        {[
          { label: 'Total Courses', value: '3' },
          { label: 'Mock Tests', value: '12' },
          { label: 'Study Materials', value: '45' },
          { label: 'Active Events', value: '2' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#1D1A39]/10">
            <h3 className="text-[#1D1A39]/60 font-medium mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-[#1D1A39]">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
        <h2 className="text-xl font-bold text-[#1D1A39] mb-4">Welcome to your Control Panel</h2>
        <p className="text-[#1D1A39]/70 font-medium">
          Use the sidebar to navigate through your collections. Any changes you make here will instantly update the public website via your Cloudflare Worker.
        </p>
      </div>
    </div>
  );
};
