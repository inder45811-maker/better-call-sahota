'use client';
import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  LoaderCircle,
} from 'lucide-react';
import { Choice, CheckField } from './form-controls';
import {
  MARKETING_COPY,
  REVIEW_FOLLOW_UP_COPY,
  validateLead,
} from '@/lib/validation';
import { identifySubmission } from '@/lib/submission';
import { ReviewCheck, ReviewPrompts } from './review-check';
import { captureCampaign } from '@/lib/attribution';
import type { ReviewAudience, validateReview } from '@/lib/review';
import { REVIEW_CTA, site } from '@/lib/site';

const reviewInterests = [
  'Financial & Estate Review',
  'Estate Planning',
  'Financial Advice',
  'Property Finance',
  'Footballers & Sports Professionals',
  'Not sure yet',
].map((value) => ({ value, label: value }));

export function EnquiryForm({
  initialInterest = 'Financial & Estate Review',
  submitLabel = REVIEW_CTA,
  audience,
  variant = 'full',
}: {
  initialInterest?: string;
  submitLabel?: string;
  audience?: ReviewAudience;
  variant?: 'full' | 'homepage';
}) {
  const homepage = variant === 'homepage';
  const id = useId();
  const [review, setReview] = useState<ReturnType<
    typeof validateReview
  > | null>(null);
  const [editing, setEditing] = useState(Boolean(audience));
  const heading = useRef<HTMLHeadingElement>(null);
  const [interest, setInterest] = useState(initialInterest),
    [method, setMethod] = useState('email'),
    [marketing, setMarketing] = useState(false),
    [reviewFollowUps, setReviewFollowUps] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<{
      reference: string;
      delivery: string;
    } | null>(null);
  const identity = useRef({ fingerprint: '', id: '' }),
    errorRef = useRef<HTMLDivElement>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      const { first, latest } = captureCampaign();
      const lead = identifySubmission(
        identity.current,
        validateLead({
          requestId: crypto.randomUUID(),
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone') ?? '',
          message: data.get('message') ?? '',
          website: data.get('website') ?? '',
          interest,
          review: review ?? undefined,
          firstCampaign: first,
          latestCampaign: latest,
          referral: data.get('referral') ?? '',
          contactMethod: method,
          callback: method !== 'email',
          marketingEmail: marketing,
          reviewFollowUps,
        }),
      );
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(25000),
      });
      const json = (await response.json()) as {
        error?: string;
        reference: string;
        delivery: string;
      };
      if (!response.ok)
        throw new Error(json.error || 'Unable to send your request.');
      if (json.delivery !== 'sent' || !json.reference)
        throw new Error(
          'Delivery could not be confirmed. Please retry or contact Sim directly.',
        );
      setResult(json);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !== 'TimeoutError' &&
          err.name !== 'TypeError' &&
          err.name !== 'SyntaxError'
          ? err.message
          : 'Delivery could not be confirmed. Please retry or contact Sim directly.',
      );
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <div className="success-panel" role="status">
        <CheckCircle2 size={42} strokeWidth={1.3} />
        <p className="eyebrow">YOUR NEXT STEP</p>
        <h2 ref={heading} tabIndex={-1}>
          Your review request
          <br />
          <em>has been sent.</em>
        </h2>
        <p>
          Reference: <strong>{result.reference}</strong>.
        </p>
        <p>An appointment is not booked automatically.</p>
        <p>
          Sim will review your request and get in touch using your preferred
          contact method
          {site.reviewResponseTime ? ' ' + site.reviewResponseTime : ''} to
          agree the next step.
        </p>
        <div className="enquiry-social-links">
          <a
            href={site.instagram}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Instagram @bettercallsimuk <ArrowUpRight size={17} />
          </a>
          <a
            href={site.tiktok}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            TikTok @bettercallsimuk <ArrowUpRight size={17} />
          </a>
        </div>
        <Link href="/the-plan" className="button">
          Explore the planning approach <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  if (audience && editing)
    return (
      <ReviewCheck
        audience={audience}
        initial={review}
        onComplete={(answers) => {
          setReview(answers);
          setEditing(false);
          requestAnimationFrame(() => heading.current?.focus());
        }}
      />
    );
  return (
    <>
      {review && (
        <ReviewPrompts review={review} edit={() => setEditing(true)} />
      )}
      <form
        onSubmit={submit}
        className={homepage ? 'enquiry-form homepage-enquiry' : 'enquiry-form'}
      >
        <div className="form-heading">
          <span>
            {homepage ? 'COMPLIMENTARY INITIAL REVIEW' : 'LET’S START WITH YOU'}
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {homepage || review ? 'Request a review' : 'What’s on your mind?'}
          </h2>
          <p>
            {homepage
              ? 'Tell me what’s on your mind and I’ll email you to arrange a conversation.'
              : 'Share a few details. There’s no need to have all the answers.'}
          </p>
        </div>
        {site.preview && (
          <p className="notice">
            Website review version — use sample details. No appointment will be
            automatically booked.
          </p>
        )}
        <div ref={errorRef} tabIndex={-1} role={error ? 'alert' : undefined}>
          {error && (
            <>
              <p className="form-error">{error}</p>
              <a
                className="text-link"
                href={`mailto:${site.email}?subject=Financial%20%26%20Estate%20Review`}
              >
                Email Sim directly: {site.email}
              </a>
            </>
          )}
        </div>
        {homepage && (
          <Choice
            id={id + '-interest'}
            label="What would you like to talk about?"
            value={interest}
            onChange={setInterest}
            options={reviewInterests}
          />
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor={id + '-name'}>Your name</label>
            <input
              className="field-input"
              autoComplete="name"
              id={id + '-name'}
              name="name"
              required
              maxLength={100}
              placeholder="Full name"
            />
          </div>
          <div className="field">
            <label htmlFor={id + '-email'}>Email address</label>
            <input
              className="field-input"
              id={id + '-email'}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </div>
        </div>
        {!homepage && !audience && (
          <Choice
            id={id + '-interest'}
            label="What would you like to explore?"
            value={interest}
            onChange={setInterest}
            options={reviewInterests}
          />
        )}
        {!homepage && (
          <>
            <div className="form-grid">
              <Choice
                id={id + '-contact-method'}
                label="How would you prefer to hear back?"
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Telephone' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                ]}
              />
              <div className="field">
                <label htmlFor={id + '-phone'}>
                  Telephone {method === 'email' ? '(optional)' : ''}
                </label>
                <input
                  className="field-input"
                  id={id + '-phone'}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required={method !== 'email'}
                  maxLength={30}
                  placeholder="Your contact number"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor={id + '-message'}>
                Anything you’d like to add? <span>(optional)</span>
              </label>
              <textarea
                className="field-input"
                id={id + '-message'}
                name="message"
                rows={4}
                maxLength={1000}
                placeholder="A little about what you’d like to discuss…"
              />
              <p className="field-hint">
                Please leave out account numbers, health details, contracts and
                other confidential information.
              </p>
            </div>
            <div className="field">
              <label htmlFor={id + '-referral'}>
                How did you hear about me? <span>(optional)</span>
              </label>
              <input
                className="field-input"
                id={id + '-referral'}
                name="referral"
                maxLength={120}
              />
            </div>
          </>
        )}
        <div className="honeypot" aria-hidden="true">
          <label htmlFor={id + '-website'}>Website</label>
          <input
            id={id + '-website'}
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        {!homepage && (
          <>
            <CheckField
              id={id + '-review-follow-ups'}
              label={REVIEW_FOLLOW_UP_COPY}
              checked={reviewFollowUps}
              onChange={setReviewFollowUps}
            />
            <CheckField
              id={id + '-marketing-email'}
              label={MARKETING_COPY}
              checked={marketing}
              onChange={setMarketing}
            />
          </>
        )}
        <p className="privacy-copy">
          <LockKeyhole size={14} /> Your details are used to handle this
          request. {!homepage && 'Marketing is optional. '}
          <Link href="/privacy">Privacy notice</Link>
        </p>
        <button disabled={busy} className="button form-submit" type="submit">
          {busy ? 'Sending your request…' : submitLabel}
          {busy ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            !homepage && <ArrowUpRight size={17} />
          )}
        </button>
        {homepage ? (
          <p className="field-hint">
            <Link href="/book-review">Prefer a call or WhatsApp reply?</Link>
          </p>
        ) : (
          <p className="field-hint">
            The appointment format, scope and any fee will be agreed before you
            proceed.
          </p>
        )}
      </form>
    </>
  );
}
