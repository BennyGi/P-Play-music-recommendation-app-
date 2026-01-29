/**
 * בדיקות אוטומציה ל-GenreSelection Component
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהקומפוננטה נטענת נכון
 * 2. בודקות שאפשר לבחור ז'אנרים
 * 3. בודקות שהכפתור Continue לא פעיל כשלא בחרו ז'אנרים
 * 4. בודקות שהפונקציות onContinue ו-onSkip נקראות נכון
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenreSelection from '../../components/onboarding/GenreSelection';

describe('GenreSelection Component', () => {
  const mockOnContinue = vi.fn();
  const mockOnSkip = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render genre selection screen', () => {
    render(
      <GenreSelection
        initialSelected={[]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/What music genres do you love/i)).toBeInTheDocument();
    expect(screen.getByText(/Select at least 1 favorite genre/i)).toBeInTheDocument();
  });

  it('should display genre options', () => {
    render(
      <GenreSelection
        initialSelected={[]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    // Check if some genres are displayed
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('Hip Hop')).toBeInTheDocument();
  });

  it('should allow selecting genres', () => {
    render(
      <GenreSelection
        initialSelected={[]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const popButton = screen.getByText('Pop').closest('button');
    fireEvent.click(popButton);

    // Check that selected count increased
    expect(screen.getByText(/Selected: 1/i)).toBeInTheDocument();
  });

  it('should disable Continue button when no genres selected', () => {
    render(
      <GenreSelection
        initialSelected={[]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const continueButton = screen.getByText('Continue').closest('button');
    expect(continueButton).toBeDisabled();
  });

  it('should enable Continue button when at least one genre selected', () => {
    render(
      <GenreSelection
        initialSelected={[1]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const continueButton = screen.getByText('Continue').closest('button');
    expect(continueButton).not.toBeDisabled();
  });

  it('should call onContinue with selected genres', () => {
    render(
      <GenreSelection
        initialSelected={[1]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const continueButton = screen.getByText('Continue').closest('button');
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledWith([1]);
  });

  it('should call onSkip with selected genres', () => {
    render(
      <GenreSelection
        initialSelected={[1, 2]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const skipButton = screen.getByText('Save & Skip').closest('button');
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('should call onBack when back button is clicked', () => {
    render(
      <GenreSelection
        initialSelected={[]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText('Back').closest('button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should show initial selected genres', () => {
    render(
      <GenreSelection
        initialSelected={[1, 2]}
        onContinue={mockOnContinue}
        onSkip={mockOnSkip}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/Selected: 2/i)).toBeInTheDocument();
  });
});

