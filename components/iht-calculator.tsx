'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  FileText,
  LockKeyhole,
  LoaderCircle,
  Info,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Choice } from './form-controls';
import {
  EMPTY_IHT,
  IHT_RULES,
  calculateIht,
  formatMoney,
  validateIht,
  type IhtInput,
  type IhtResult,
} from '@/lib/iht';
import { REVIEW_CTA } from '@/lib/site';
const opts = (entries: [string, string][]) => entries.map(([value, label]) => ({ value, label }));
const tri = opts([
  ['yes', 'Yes'],
  ['no', 'No'],
  ['unsure', 'Not sure'],
]);
const transfer = opts([
  ['0', 'None (0%)'],
  ['50', 'Half (50%)'],
  ['100', 'All (100%)'],
  ['unsure', 'Not sure — adviser review needed'],
]);
const steps = ['Your situation', 'Your assets', 'Your allowances', 'Your report'];
type ReportResponse = {
  result: IhtResult;
  pdf: string;
  reference: string;
};
export function IhtCalculator() {
  const [input, setInput] = useState<IhtInput>({ ...EMPTY_IHT }),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [completed, setCompleted] = useState<ReportResponse | null>(null),
    [pdfUrl, setPdfUrl] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    setInput((previous) => ({ ...previous, date: today }));
  }, []);
  const set = <K extends keyof IhtInput>(key: K, value: IhtInput[K]) => {
    setInput((previous) => ({
      ...previous,
      [key]: value,
      ...(key === 'scenario' && value === 'individual'
        ? { transferNrb: '0', transferRnrb: '0' }
        : {}),
    }));
  };
  useEffect(() => {
    if (!completed) return;
    const raw = atob(completed.pdf),
      bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0)),
      url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [completed]);
  useEffect(() => {
    type Registry = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (value: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => unknown;
    };
    const context = (document as unknown as { modelContext?: Registry }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const properties: Record<string, unknown> = {};
    Object.entries(EMPTY_IHT).forEach(([key, value]) => {
      properties[key] = { type: typeof value === 'number' ? 'number' : 'string' };
    });
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'prepare_iht_illustration',
            title: 'Prepare an IHT illustration',
            description:
              'Validate and stage calculator answers for the visitor to review. Does not save personal details, send a report or contact anyone.',
            inputSchema: {
              type: 'object',
              properties,
              required: Object.keys(EMPTY_IHT),
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(value) {
              const next = validateIht(value);
              setInput(next);
              setCompleted(null);
              setStep(2);
              return {
                prepared: true,
                requiresAdviserReview: calculateIht(next).needsReview,
                nextStep: 'Review your allowances, then request your report.',
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. */
    }
    return () => lifecycle.abort();
  }, []);
  function move(next: number) {
    setError('');
    setStep(next);
    setTimeout(() => {
      panel.current?.focus();
      panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 0);
  }
  function advance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      validateIht(input);
      move(step + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check your answers.');
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    setBusy(true);
    try {
      const name =
        String(form.get('name') || '')
          .trim()
          .slice(0, 100) || 'Your estate';
      const result = calculateIht(validateIht(input));
      const { makeReport, pdfBase64 } = await import('@/lib/report');
      const pdf = pdfBase64(await makeReport(name, result, Date.now()));
      setCompleted({ result, pdf, reference: crypto.randomUUID().slice(0, 8) });
      setTimeout(() => panel.current?.focus(), 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create your report. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  function Money({
    field,
    label,
    hint,
  }: {
    field:
      | 'home'
      | 'homeMortgage'
      | 'savings'
      | 'investments'
      | 'otherAssets'
      | 'debts'
      | 'pensions';
    label: string;
    hint?: string;
  }) {
    return (
      <div className="field">
        <label htmlFor={'iht-' + field}>{label}</label>
        <div className="currency-input">
          <span>£</span>
          <input
            id={'iht-' + field}
            inputMode="decimal"
            type="number"
            min="0"
            max="1000000000"
            step="0.01"
            value={input[field] || ''}
            placeholder="0"
            onChange={(e) => set(field, e.target.value === '' ? 0 : Number(e.target.value))}
            aria-describedby={hint ? field + '-hint' : undefined}
          />
        </div>
        {hint && (
          <p id={field + '-hint'} className="field-hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
  // Render currency fields inline via a render function to preserve focus on each keystroke.
  const money = (field: Parameters<typeof Money>[0]['field'], label: string, hint?: string) =>
    Money({ field, label, hint });
  if (completed) {
    const r = completed.result;
    return (
      <div className="calculator-layout">
        <div ref={panel} tabIndex={-1} className="calculator-panel result-panel">
          <div className="result-icon">
            <FileText size={28} />
          </div>
          <p className="eyebrow">YOUR ILLUSTRATION IS READY</p>
          <h2>{r.needsReview ? 'A closer look is needed.' : 'Your estate, in perspective.'}</h2>
          <p>
            {r.needsReview
              ? 'Some of your answers need professional review before a reliable estimate can be shown. Your report records those questions.'
              : 'This estimate reflects your answers and the assumptions below. It is a starting point for a conversation, not personal advice.'}
          </p>
          <div className="result-amount">
            <span>{r.needsReview ? 'NEXT STEP' : 'ILLUSTRATIVE INHERITANCE TAX'}</span>
            <strong>{r.needsReview ? 'Adviser review' : formatMoney(r.tax!)}</strong>
            <p>
              Net estate entered: {formatMoney(r.estate)} · {r.taxYear} rules
            </p>
          </div>
          {r.needsReview ? (
            <ul className="check-list">
              {r.reasons.map((reason) => (
                <li key={reason}>
                  <Info size={17} />
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <dl className="result-breakdown">
              <div>
                <dt>Basic allowance modelled</dt>
                <dd>{formatMoney(r.nilRateBand!)}</dd>
              </div>
              <div>
                <dt>Residence allowance modelled</dt>
                <dd>{formatMoney(r.residenceBand!)}</dd>
              </div>
              <div>
                <dt>Spouse/civil-partner exemption</dt>
                <dd>{formatMoney(r.exempt!)}</dd>
              </div>
              <div>
                <dt>Taxable estate in this illustration</dt>
                <dd>{formatMoney(r.taxable!)}</dd>
              </div>
            </dl>
          )}
          <div className="result-actions">
            <a
              className="button"
              href={pdfUrl || undefined}
              aria-disabled={!pdfUrl}
              download="better-call-sim-iht-report.pdf"
            >
              <Download size={18} />
              Download your report
            </a>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setCompleted(null);
                move(0);
              }}
            >
              Edit your answers <ArrowLeft size={16} />
            </button>
          </div>
          <p className="notice">
            Your PDF was created in this browser. Your name and calculator answers have not been
            sent to Sim or stored on the website. Save the download before leaving this page.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <h3>What this assumes</h3>
          <ul className="assumptions">
            {r.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="source-links">
            Sources:{' '}
            <a href="https://www.gov.uk/inheritance-tax" target="_blank" rel="noreferrer">
              GOV.UK inheritance tax
            </a>{' '}
            ·{' '}
            <a
              href="https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band"
              target="_blank"
              rel="noreferrer"
            >
              HMRC residence allowance
            </a>
          </p>
        </div>
        <aside className="calculator-aside">
          <span className="eyebrow">PUT IT IN CONTEXT</span>
          <h3>
            The numbers are
            <br />
            <em>part of the story.</em>
          </h3>
          <p>
            Your family, your own needs and your wishes matter too. A review can help identify the
            next questions to explore.
          </p>
          <Link href="/book-review" className="button">
            {REVIEW_CTA}
            <ArrowUpRight size={18} />
          </Link>
          <span className="report-reference">Report reference {completed.reference}</span>
        </aside>
      </div>
    );
  }
  return (
    <div className="calculator-layout">
      <div className="calculator-panel" ref={panel} tabIndex={-1}>
        <div className="calculator-progress">
          <span>STEP {step + 1} OF 4</span>
          <span>{steps[step]}</span>
        </div>
        <Progress
          value={(step + 1) * 25}
          aria-label={`Calculator progress, step ${step + 1} of 4`}
        />
        <form onSubmit={step === 3 ? submit : advance}>
          <div className="calculator-step-title">
            <h2>
              {
                [
                  'Let’s start with your situation.',
                  'What makes up your estate?',
                  'A few important details.',
                  'Your picture. Your report.',
                ][step]
              }
            </h2>
            <p>
              {
                [
                  'This tool illustrates a limited range of straightforward UK estates. “Not sure” answers are welcome — they will be flagged in your report.',
                  'Enter only the shares belonging to the estate you are considering. Use today’s values and avoid counting an asset or debt twice.',
                  'Allowances depend on who inherits and your circumstances. Only use confirmed answers; the report will identify anything that needs review.',
                  'Add an optional name for your PDF. It is generated in your browser without sending your answers or contact details.',
                ][step]
              }
            </p>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {step === 0 && (
            <>
              <div className="field">
                <label htmlFor="calculation-date">Calculation date</label>
                <input
                  className="field-input"
                  id="calculation-date"
                  type="date"
                  required
                  value={input.date}
                  onChange={(e) => set('date', e.target.value)}
                />
                <p className="field-hint">
                  Supported rules: {IHT_RULES.taxYear}. Dates outside this period are referred for
                  review.
                </p>
              </div>
              <Choice
                id="scenario"
                label="Whose estate are you considering?"
                value={input.scenario}
                onChange={(v) => set('scenario', v as IhtInput['scenario'])}
                options={opts([
                  ['individual', 'An individual estate'],
                  ['survivor', 'A surviving spouse or civil partner’s estate'],
                ])}
                hint="For a survivor, enter the assets belonging to that person and only confirmed unused allowance percentages."
              />
              <Choice
                id="residence"
                label="Does the straightforward UK residence scenario apply?"
                hint="All relevant people are long-term UK resident, all estate assets are in the UK and there are no cross-border factors. If unsure, choose review."
                value={input.residence}
                onChange={(v) => set('residence', v as IhtInput['residence'])}
                options={opts([
                  ['unsure', 'Not sure'],
                  ['straightforward-uk', 'Yes — this straightforward scenario applies'],
                  ['other', 'No — specialist review needed'],
                ])}
              />
              <Choice
                id="beneficiaries"
                label="Who receives the estate outright?"
                value={input.beneficiaries}
                onChange={(v) => set('beneficiaries', v as IhtInput['beneficiaries'])}
                options={opts([
                  ['unsure', 'Not sure'],
                  ['descendants', 'Children or other direct descendants'],
                  ['others', 'Other people (no exempt beneficiaries)'],
                  ['spouse', 'Everything to a qualifying spouse / civil partner'],
                  ['mixed', 'A mix, a charity or another arrangement'],
                ])}
              />
            </>
          )}
          {step === 1 && (
            <>
              <div className="form-grid">
                {money(
                  'home',
                  'Your share of your home',
                  'Exclude other property, which belongs in other assets.',
                )}
                {money(
                  'homeMortgage',
                  'Mortgage on that share',
                  'Do not repeat this mortgage in other debts.',
                )}
                {money('savings', 'Cash and savings')}
                {money('investments', 'Investments and ISAs')}
                {money(
                  'otherAssets',
                  'Other property and possessions',
                  'Do not include pensions here.',
                )}
                {money(
                  'debts',
                  'Other deductible debts',
                  'Exclude the home mortgage entered above.',
                )}
              </div>
              {money('pensions', 'Pension benefits (separate from assets)')}
              <Choice
                id="pension-treatment"
                label="Has the pension’s IHT treatment been confirmed for this date?"
                value={input.pensionTreatment}
                onChange={(v) => set('pensionTreatment', v as IhtInput['pensionTreatment'])}
                options={opts([
                  ['none', 'No pension benefits entered'],
                  ['confirmed-excluded', 'An adviser confirmed these benefits are excluded'],
                  ['review', 'No / not sure — review needed'],
                ])}
              />
              <p className="notice">
                Pension treatment can be complex. This tool does not apply the changes due from 6
                April 2027 to a 2026/27 calculation.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <Choice
                id="qualifying-home"
                label="Does a qualifying home pass outright to direct descendants?"
                hint="A home must meet the residence-allowance conditions. Trusts, downsizing and mixed inheritances need separate review."
                value={input.qualifyingHome}
                onChange={(v) => set('qualifyingHome', v as IhtInput['qualifyingHome'])}
                options={tri}
              />
              {input.scenario === 'survivor' && (
                <>
                  <Choice
                    id="transfer-nrb"
                    label="Confirmed unused basic allowance from the late spouse / civil partner"
                    value={input.transferNrb}
                    onChange={(v) => set('transferNrb', v as IhtInput['transferNrb'])}
                    options={transfer}
                  />
                  <Choice
                    id="transfer-rnrb"
                    label="Confirmed unused residence allowance"
                    value={input.transferRnrb}
                    onChange={(v) => set('transferRnrb', v as IhtInput['transferRnrb'])}
                    options={transfer}
                  />
                </>
              )}
              <Choice
                id="complexity"
                label="Are there any specialist circumstances?"
                hint="Examples: relevant lifetime gifts, retained benefits from gifts, trusts, business or agricultural assets, charitable gifts, overseas factors or downsizing claims."
                value={input.complexity}
                onChange={(v) => set('complexity', v as IhtInput['complexity'])}
                options={opts([
                  ['unsure', 'Not sure'],
                  ['none', 'None of these apply'],
                  ['yes', 'Yes — an adviser review is needed'],
                ])}
              />
              <p className="notice">
                If a factor could change your liability and this tool cannot model it, the report
                will explain why a numerical estimate has been withheld.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <div className="field">
                <label htmlFor="report-name">Your name (optional)</label>
                <input
                  className="field-input"
                  id="report-name"
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Name to show on your PDF"
                />
              </div>
              <p className="privacy-copy">
                <LockKeyhole size={14} /> Your answers stay in this browser. No email address is
                needed. <Link href="/privacy">Privacy notice</Link>
              </p>
            </>
          )}
          <div className="calculator-navigation">
            {step > 0 ? (
              <button
                type="button"
                className="back-button"
                disabled={busy}
                onClick={() => move(step - 1)}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <span />
            )}
            <button className="button" disabled={busy} type="submit">
              {busy ? 'Preparing your report…' : step === 3 ? 'Create My IHT Report' : 'Continue'}
              {busy ? <LoaderCircle size={17} className="spin" /> : <ArrowRight size={17} />}
            </button>
          </div>
        </form>
      </div>
      <aside className="calculator-aside">
        <FileText size={35} strokeWidth={1.2} />
        <h3>
          A little insight.
          <br />
          <em>A useful starting point.</em>
        </h3>
        <p>Your report brings your answers and assumptions together in one place.</p>
        <ul>
          {[
            'A clear summary of your estate',
            'Allowances for the supported scenario',
            'Questions that need a closer look',
            'A PDF to save and discuss',
          ].map((t) => (
            <li key={t}>
              <Check size={16} />
              {t}
            </li>
          ))}
        </ul>
        <div className="calculator-scope">
          <p>ILLUSTRATION, NOT ADVICE</p>
          <span>
            Rules version {IHT_RULES.version}. This tool cannot assess every estate, recommend a
            product or guarantee a tax outcome.
          </span>
          <Link href="/estate-planning/inheritance-tax-planning">
            Understand IHT planning <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
