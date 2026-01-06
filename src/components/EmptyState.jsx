import React from 'react';
import { Music } from 'lucide-react';

const EmptyState = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Music className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
          {subtitle && <p className="text-white/70 text-lg mb-8">{subtitle}</p>}

          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white px-8 py-4 rounded-xl transition-colors text-lg font-semibold"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
