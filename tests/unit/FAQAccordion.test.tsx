import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQAccordion from '@/components/landing/FAQAccordion';

const items = [
  { question: 'Question one?', answer: 'Answer one.' },
  { question: 'Question two?', answer: 'Answer two.' },
];

describe('FAQAccordion', () => {
  it('shows the first answer expanded by default', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('Answer one.')).toBeInTheDocument();
    expect(screen.queryByText('Answer two.')).not.toBeInTheDocument();
  });

  it('toggles an answer open and closed on click', () => {
    render(<FAQAccordion items={items} />);
    fireEvent.click(screen.getByText('Question two?'));
    expect(screen.getByText('Answer two.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Question two?'));
    expect(screen.queryByText('Answer two.')).not.toBeInTheDocument();
  });
});
