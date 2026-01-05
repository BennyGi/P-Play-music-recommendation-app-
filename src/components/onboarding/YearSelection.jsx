import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, SkipForward, Calendar } from 'lucide-react';

const YearSelection = ({ initialSelected, onContinue, onSkip, onBack }) => {
  const currentYear = new Date().getFullYear();

  const defaultYears = { from: 2010, to: currentYear };

  const [selectedYears, setSelectedYears] = useState(initialSelected ?? defaultYears);

  useEffect(() => {
    if (initialSelected) {
      setSelectedYears({
        from: initialSelected.from ?? defaultYears.from,
        to: initialSelected.to ?? defaultYears.to
      });
    }
  }, [initialSelected]);

  const handleSliderChange = (type, value) => {
    const numValue = parseInt(value, 10);
    if (type === 'from') {
      setSelectedYears(prev => ({
        ...prev,
        from: numValue,
        to: Math.max(numValue, prev.to)
      }));
    } else {
      setSelectedYears(prev => ({
        ...prev,
        to: numValue,
        from: Math.min(numValue, prev.from)
      }));
    }
  };

  const yearSpan = selectedYears.to - selectedYears.from + 1;

  const getDecadeDescription = () => {
    const fromDecade = Math.floor(selectedYears.from / 10) * 10;
    const toDecade = Math.floor(selectedYears.to / 10) * 10;

    if (selectedYears.from < 1950) return "Vintage classics & jazz era";
    if (fromDecade === toDecade) return `${fromDecade}s music`;
    if (selectedYears.to === currentYear && selectedYears.from <= 2000) return "Classic to modern hits";
    if (selectedYears.from >= 2020) return "Latest releases";
    if (selectedYears.from >= 2010) return "Modern era";
    if (selectedYears.from >= 2000) return "2000s to present";
    return "Wide selection";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-5xl mx-auto py-12">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              <Check className="w-6 h-6" />
            </div>
            <div className="w-12 h-1 bg-white/20"></div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              <Check className="w-6 h-6" />
            </div>
            <div className="w-12 h-1 bg-white/20"></div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
              3
            </div>
            <div className="w-12 h-1 bg-white/10"></div>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
              4
            </div>
          </div>
          <p className="text-center text-white/60 text-sm">Step 3 of 4</p>
        </div>

        <div className="text-center mb-12 space-y-4">
          <Calendar className="w-16 h-16 text-white mx-auto" />
          <h2 className="text-5xl font-bold text-white">What era of music do you prefer?</h2>
          <p className="text-xl text-white/80">Select your preferred year range</p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 inline-block">
            <p className="text-white/80 text-lg">{getDecadeDescription()}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium text-lg">From Year:</label>
                <div className="bg-white/20 backdrop-blur px-6 py-2 rounded-xl">
                  <span className="text-4xl font-bold text-white">{selectedYears.from}</span>
                </div>
              </div>
              <input
                type="range"
                min="1900"
                max={currentYear}
                value={selectedYears.from}
                onChange={(e) => handleSliderChange('from', e.target.value)}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((selectedYears.from - 1900) / (currentYear - 1900)) * 100}%, rgba(255,255,255,0.2) ${((selectedYears.from - 1900) / (currentYear - 1900)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-white/60 text-sm">
                <span>1900</span>
                <span>{currentYear}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium text-lg">To Year:</label>
                <div className="bg-white/20 backdrop-blur px-6 py-2 rounded-xl">
                  <span className="text-4xl font-bold text-white">{selectedYears.to}</span>
                </div>
              </div>
              <input
                type="range"
                min="1900"
                max={currentYear}
                value={selectedYears.to}
                onChange={(e) => handleSliderChange('to', e.target.value)}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((selectedYears.to - 1900) / (currentYear - 1900)) * 100}%, rgba(255,255,255,0.2) ${((selectedYears.to - 1900) / (currentYear - 1900)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-white/60 text-sm">
                <span>1900</span>
                <span>{currentYear}</span>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-white text-lg mb-2">
                Selected Period: <span className="font-bold text-2xl">{selectedYears.from} - {selectedYears.to}</span>
              </p>
              <p className="text-white/70">
                Spanning {yearSpan} year{yearSpan !== 1 ? 's' : ''} of music
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 max-w-2xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-white/10 backdrop-blur-lg text-white px-6 py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => onSkip(selectedYears)}
            className="flex-1 bg-white/10 backdrop-blur-lg text-white py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            <span>Save & Skip</span>
          </button>

          <button
            onClick={() => onContinue(selectedYears)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YearSelection;
