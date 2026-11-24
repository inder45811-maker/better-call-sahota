export const reviewAudiences = ['family', 'player', 'agent'] as const;
export type ReviewAudience = (typeof reviewAudiences)[number];

export function reviewQuestions(audience: ReviewAudience) {
  const agent = audience === 'agent';
  return [
    {
      key: 'location',
      label: 'Where are you based?',
      options: ['England', 'Wales', 'Scotland', 'Northern Ireland', 'Overseas'],
    },
    {
      key: 'trigger',
      label: 'What prompted this?',
      options: [
        'New mortgage',
        'Children or family change',
        'Existing plan overdue',
        'Inheritance planning',
        'Business',
        'Football career change',
        'Other',
      ],
    },
    {
      key: 'needs',
      label: agent
        ? 'What support are you exploring?'
        : 'What needs reviewing?',
      options: agent
        ? [
            'Initial fit conversation',
            'Player and family planning',
            'Coordination with existing advisers',
            'Not sure',
          ]
        : [
            'Wills',
            'LPAs',
            'Protection',
            'Property',
            'Pensions or investments',
            'Inheritance planning',
            'Not sure',
          ],
      multiple: true,
    },
    {
      key: 'timing',
      label: 'When do you want to act?',
      options: ['Now', 'Within 3 months', 'Later', 'Exploring'],
    },
    {
      key: 'circumstances',
      label: agent
        ? 'Which professionals are already involved?'
        : 'Which circumstances apply?',
      options: agent
        ? [
            'Agent',
            'Accountant',
            'Solicitor',
            'Financial adviser',
            'Prefer to discuss',
          ]
        : [
            'Own home',
            'Other property',
            'Business',
            'Dependants',
            'Prefer to discuss',
          ],
      multiple: true,
    },
    {
      key: 'proposal',
      label:
        'Are you open to a proposal with the scope and fees explained upfront?',
      options: ['Yes', 'Explain the process', 'Information only'],
    },
  ];
}

export function validateReview(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Please check your review answers.');
  const value = input as Record<string, unknown>;
  const audience = value.audience as ReviewAudience;
  if (!reviewAudiences.includes(audience))
    throw new Error('Please choose a review route.');
  function answer(key: string, options: string[], multiple?: boolean) {
    const choices = value[key];
    if (
      !Array.isArray(choices) ||
      !choices.length ||
      (!multiple && choices.length !== 1) ||
      choices.length > options.length ||
      choices.some((choice) => !options.includes(choice))
    )
      throw new Error('Please complete all six review questions.');
    return options.filter((option) => choices.includes(option));
  }
  const [location, trigger, needs, timing, circumstances, proposal] =
    reviewQuestions(audience).map(({ key, options, multiple }) =>
      answer(key, options, multiple),
    );
  return {
    audience,
    location,
    trigger,
    needs,
    timing,
    circumstances,
    proposal,
  };
}

export function reviewStatus(review: ReturnType<typeof validateReview>) {
  if (
    review.timing.includes('Exploring') ||
    review.proposal.includes('Information only')
  )
    return 'exploring';
  if (
    review.audience !== 'agent' &&
    ['England', 'Wales'].some((location) =>
      review.location.includes(location),
    ) &&
    ['Now', 'Within 3 months'].some((timing) =>
      review.timing.includes(timing),
    ) &&
    !review.needs.includes('Not sure') &&
    review.proposal.includes('Yes')
  )
    return 'ready';
  return 'scope-check';
}
