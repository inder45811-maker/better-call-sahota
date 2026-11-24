'use client';

import { useRef, useState, type FormEvent } from 'react';
import {
  reviewQuestions,
  validateReview,
  type ReviewAudience,
} from '@/lib/review';

type Review = ReturnType<typeof validateReview>;

export function ReviewCheck({
  audience,
  initial,
  onComplete,
}: {
  audience: ReviewAudience;
  initial: Review | null;
  onComplete: (review: Review) => void;
}) {
  const questions = reviewQuestions(audience);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const unanswered = questions.find(({ key }) => !data.getAll(key).length);
    if (unanswered) {
      setError(
        'Please select at least one answer for “' + unanswered.label + '”',
      );
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    onComplete(
      validateReview({
        audience,
        ...Object.fromEntries(
          questions.map(({ key }) => [key, data.getAll(key)]),
        ),
      }),
    );
  }

  return (
    <form className="enquiry-form review-check" onSubmit={submit}>
      <h2>
        {audience === 'family'
          ? 'Family Wealth Check'
          : 'A few questions before we talk'}
      </h2>
      <p>
        {audience === 'agent'
          ? 'Tell us about the type of support you need. Please leave out client names, contracts and confidential details.'
          : 'Answer six short questions to find topics worth discussing in your initial review.'}
      </p>
      {questions.map(({ key, label, options, multiple }) => (
        <fieldset className="field" key={key}>
          <legend>{label}</legend>
          {multiple ? (
            <div className="review-options">
              {options.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name={key}
                    value={option}
                    defaultChecked={initial?.[
                      key as keyof Omit<Review, 'audience'>
                    ].includes(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <select
              className="field-input"
              aria-label={label}
              name={key}
              required
              defaultValue={
                initial?.[key as keyof Omit<Review, 'audience'>][0] ?? ''
              }
            >
              <option value="" disabled>
                Choose an answer
              </option>
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          )}
        </fieldset>
      ))}
      {error && (
        <p className="form-error" role="alert" tabIndex={-1} ref={errorRef}>
          {error}
        </p>
      )}
      <button className="button" type="submit">
        See my discussion prompts
      </button>
    </form>
  );
}

const prompts: Record<string, string> = {
  Wills:
    'Check whether your will still reflects who you want to provide for and who you want to appoint.',
  LPAs: 'Consider who you would want to make decisions for you if you needed help.',
  Protection:
    'Check what your existing cover is intended to do and whether your family’s needs have changed.',
  Property:
    'List the properties, mortgages and ownership arrangements you want to discuss.',
  'Pensions or investments':
    'Gather a list of your providers and any questions about how those arrangements fit together.',
  'Inheritance planning':
    'Think about whom you want to provide for and which assets or arrangements you want to discuss.',
  'Initial fit conversation':
    'Bring a broad outline of the support you are looking for and your ideal timeframe.',
  'Player and family planning':
    'Identify the family, property or career changes that have prompted the conversation.',
  'Coordination with existing advisers':
    'Consider who should take part and what the client is comfortable sharing.',
  'Not sure':
    'Start with what changed, what you already have and who you want to protect.',
};

export function ReviewPrompts({
  review,
  edit,
}: {
  review: Review;
  edit: () => void;
}) {
  return (
    <div className="booking-expectation">
      <h2>Topics worth discussing</h2>
      <ul>
        {review.needs.map((need) => (
          <li key={need}>{prompts[need]}</li>
        ))}
      </ul>
      <p>
        The initial conversation is complimentary. Any further work is scoped
        and priced separately.
      </p>
      <button className="button button-outline" type="button" onClick={edit}>
        Edit my answers
      </button>
    </div>
  );
}
