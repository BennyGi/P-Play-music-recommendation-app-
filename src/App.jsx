import React, { useState } from 'react';
import RegistrationScreen from './components/onboarding/RegistrationScreen';
import GenreSelection from './components/onboarding/GenreSelection';

function App() {
   const [currentStep, setCurrentStep] = useState('registration');
   const [userData, setUserData] = useState(null);
   const [selectedGenres, setSelectedGenres] = useState([]);

   const handleRegistrationComplete = (data) => {
      setUserData(data);
      setCurrentStep('genres');
   };

   const handleGenreContinue = (genres) => {
      setSelectedGenres(genres);
      console.log('Selected genres:', genres);
      alert(`Great! You selected ${genres.length} genres. Next step would be languages.`);
   };

   const handleGenreSkip = (genres) => {
      setSelectedGenres(genres);
      console.log('Skipped genre selection with:', genres);
      alert('Skipped! Creating default playlist...');
   };

   return (
      <div>
         {currentStep === 'registration' && (
            <RegistrationScreen onComplete={handleRegistrationComplete} />
         )}

         {currentStep === 'genres' && (
            <GenreSelection
               onContinue={handleGenreContinue}
               onSkip={handleGenreSkip}
            />
         )}
      </div>
   );
}

export default App;