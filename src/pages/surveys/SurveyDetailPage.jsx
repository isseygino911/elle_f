import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, Download } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useLanguage } from "@/lib/LanguageContext";
import {
  getSurvey,
  getSurveyDownloadUrl,
  downloadStudentSurvey,
  submitSurveyRatings,
} from "../../api/client.js";
import { saveBlob } from "../../utils/saveBlob.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingText, ErrorAlert } from "@/components/Page";
import InsightCard from "@/components/records/InsightCard";

// Survey content (title/question/answer text) is per-survey user data from
// the uploaded XML, not a static UI string -- it can't live in
// translations.js like the rest of the app's i18n, so it carries its own
// _zh sibling column (server/migrations/0013_add_survey_zh_translations.sql)
// and falls back to the English text whenever a translation hasn't been
// entered for that row yet.
function localize(en, zh, language) {
  return language === "zh" && zh ? zh : en;
}

// A day is submittable only once every one of its statements carries a
// rating -- the server rejects a partial day, so the Submit button mirrors
// that rule rather than letting the student discover it via an error.
function isDayFullyRated(question, dayRatings) {
  return question.answers.every((answer) => Boolean(dayRatings[answer.id]));
}

// One statement's 1..max rating scale, rendered as a row of numbered
// buttons.
//
// These are real <input type="radio"> elements with the number drawn on the
// <label>, not <button>s with role="radio": that hands the whole group's
// keyboard behaviour (arrow-key roving focus, one tab stop, correct
// screen-reader announcement of "3 of 10") to the browser instead of
// reimplementing it. `name` scopes each group to its own statement so the
// ten scales on a day don't collide.
//
// `max` comes from the statement's own points attribute, so a points="5"
// statement renders 1-5. Above SCALE_BUTTON_LIMIT the row would wrap into
// something unusable, so it degrades to a <select> -- the parser allows
// points up to 1000, even though 10 is the norm in practice.
const SCALE_BUTTON_LIMIT = 12;

function RatingScale({ name, max, value, onChange, disabled, ariaLabel }) {
  const scale = Array.from({ length: max }, (_, index) => index + 1);

  if (max > SCALE_BUTTON_LIMIT) {
    return (
      <select
        aria-label={ariaLabel}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm disabled:opacity-70"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        <option value="" disabled>
          Rate 1-{max}
        </option>
        {scale.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-1.5"
    >
      {scale.map((n) => {
        const isSelected = value === n;
        const inputId = `${name}-${n}`;
        return (
          <span key={n}>
            <input
              type="radio"
              id={inputId}
              name={name}
              value={n}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <label
              htmlFor={inputId}
              className={cn(
                "flex size-9 cursor-pointer select-none items-center justify-center rounded-full border text-sm tabular-nums transition-colors",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                isSelected
                  ? "border-transparent bg-lime font-bold text-on-lime"
                  : "border-border text-muted-foreground hover:border-lime hover:text-foreground",
                // Read-only (elle previewing a day, or reviewing a submitted
                // one): drop the hover affordances entirely and mute the
                // unpicked numbers, so the scale reads as "this is what the
                // student is asked" rather than something clickable. A
                // selected value keeps its lime pill at full strength -- it
                // is the information being reported, so it must not fade.
                disabled && "cursor-default hover:border-border hover:text-muted-foreground",
                disabled && !isSelected && "opacity-50",
              )}
            >
              {n}
            </label>
          </span>
        );
      })}
    </div>
  );
}

export default function SurveyDetailPage() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const { language } = useLanguage();
  const isStudent = Boolean(user && user.role === "student");

  // Admin drill-in: elle viewing a specific student's answers/scores for
  // this survey, reached via a Students-section link
  // (`/surveys/:id?student_id=...`). GET /surveys/:id already supports
  // `student_id` for non-student roles (server/src/routes/surveys.route.js)
  // — this just threads it through from the URL.
  const [searchParams] = useSearchParams();
  const viewingStudentId = !isStudent ? searchParams.get("student_id") : null;

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [activeDayId, setActiveDayId] = useState(null);
  // { [questionId]: { [answerId]: rating } } -- a day is rated statement by
  // statement, and only submitted once every statement has a rating.
  const [ratings, setRatings] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [submitErrors, setSubmitErrors] = useState({});
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    autoSelectedRef.current = false;

    getSurvey(accessToken, id, { studentId: viewingStudentId })
      .then((body) => {
        if (cancelled) return;
        const nextSurvey = { ...body.survey, questions: body.questions };
        setSurvey(nextSurvey);
        setStatus("success");

        if (!autoSelectedRef.current) {
          autoSelectedRef.current = true;
          // Land on the first not-yet-submitted day so the student picks up
          // where they left off. If every day is already submitted, land on
          // the last one instead -- there's always exactly one active tab,
          // unlike the old accordion which could have nothing expanded.
          const answerable = nextSurvey.questions.filter(
            (q) => q.answers && q.answers.length > 0,
          );
          const current = answerable.find((q) => !q.submission);
          setActiveDayId(
            current
              ? current.id
              : answerable.length > 0
                ? answerable[answerable.length - 1].id
                : null,
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.status === 404
              ? "Survey not found."
              : (err.body && err.body.message) || err.message,
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, id, viewingStudentId]);

  // Re-fetches the survey in place after a successful submission, so
  // submission state for every question comes straight from the server
  // instead of being reimplemented client-side.
  // Deliberately does not touch activeDayId — the day the student just
  // submitted stays selected, now showing its submitted state.
  async function reloadSurvey() {
    const body = await getSurvey(accessToken, id, {
      studentId: viewingStudentId,
    });
    setSurvey({ ...body.survey, questions: body.questions });
  }

  async function handleDownload() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const { url } = await getSurveyDownloadUrl(accessToken, id);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      setDownloadError((err.body && err.body.message) || err.message);
    } finally {
      setDownloading(false);
    }
  }

  // Downloads what this page is currently showing — the student's ratings
  // drawn onto each statement's scale — as a printable document. Only
  // reachable while drilled into a student (see the button's guard below);
  // the survey's own blank XML is what handleDownload above fetches.
  async function handleDownloadFilled() {
    setDownloadError(null);
    setExporting(true);
    try {
      const { blob, filename } = await downloadStudentSurvey(accessToken, id, {
        studentId: viewingStudentId,
        language,
      });
      saveBlob(blob, filename);
    } catch (err) {
      setDownloadError((err.body && err.body.message) || err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleSubmitDay(question) {
    const dayRatings = ratings[question.id] || {};
    if (!isDayFullyRated(question, dayRatings)) return;

    setSubmittingId(question.id);
    setSubmitErrors((prev) => ({ ...prev, [question.id]: null }));
    try {
      await submitSurveyRatings(
        accessToken,
        id,
        question.id,
        question.answers.map((answer) => ({
          answer_id: answer.id,
          rating: dayRatings[answer.id],
        })),
      );
      await reloadSurvey();
    } catch (err) {
      setSubmitErrors((prev) => ({
        ...prev,
        [question.id]: (err.body && err.body.message) || err.message,
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  const flatQuestions = survey
    ? survey.questions.filter((q) => !q.answers || q.answers.length === 0)
    : [];
  const answerableQuestions = survey
    ? survey.questions.filter((q) => q.answers && q.answers.length > 0)
    : [];
  const activeQuestion =
    answerableQuestions.find((q) => q.id === activeDayId) || null;
  const completedCount = answerableQuestions.filter((q) => q.submission).length;
  const pointsEarned = answerableQuestions.reduce(
    (sum, q) => sum + (q.submission ? q.submission.points_earned : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        {status === "loading" && <LoadingText>Loading survey...</LoadingText>}
        {status === "error" && <ErrorAlert>{error}</ErrorAlert>}
        {status === "success" && survey && (
          <section className="flex flex-col gap-3">
            <h2>{localize(survey.title, survey.title_zh, language)}</h2>
            <p className="m-0 text-sm text-muted-foreground">
              {survey.original_filename} — {survey.uploaded_at}
            </p>
            {viewingStudentId && (
              <p className="m-0 text-sm text-muted-foreground">
                Viewing submissions for this student —{" "}
                <Link
                  to={`/students/${encodeURIComponent(viewingStudentId)}`}
                  className="text-primary hover:underline"
                >
                  back to their scores
                </Link>
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Only offered while drilled into a specific student —
                  without one there are no answers to fill in, and the route
                  requires student_id. viewingStudentId is already null for a
                  student viewing their own survey. */}
              {viewingStudentId && (
                <Button onClick={handleDownloadFilled} disabled={exporting}>
                  <Download className="size-4" aria-hidden="true" />
                  {exporting
                    ? "Preparing download..."
                    : "Download filled survey"}
                </Button>
              )}
              <Button
                variant={viewingStudentId ? "outline" : "default"}
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading
                  ? "Preparing download..."
                  : "Download original file"}
              </Button>
            </div>
            {downloadError && <ErrorAlert>{downloadError}</ErrorAlert>}

            {flatQuestions.length > 0 && (
              <ul className="flex flex-col">
                {flatQuestions.map((question) => (
                  <li
                    key={question.id}
                    className="border-b border-border py-2 last:border-b-0"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span>
                        {localize(
                          question.question_text,
                          question.question_text_zh,
                          language,
                        )}
                      </span>
                      <Badge variant="outline">{question.points} pts</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {answerableQuestions.length > 0 && (
              <div className="flex flex-col">
                {/* "Inverted tab" day switcher (.day-tab-active in global.css
                    supplies the concave-corner notch) — only one day's
                    content shows at a time, replacing the previous
                    multi-expand accordion. The whole strip (not each
                    inactive tab individually) carries the lighter-lime
                    wash, so the active tab's notch curve hands off to one
                    continuous surface instead of per-pill gaps. */}
                <div className="flex items-end rounded-t-2xl " role="tablist">
                  {answerableQuestions.map((question, index) => {
                    const isActive = question.id === activeDayId;
                    const isSubmitted = Boolean(question.submission);
                    return (
                      <button
                        key={question.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveDayId(question.id)}
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 rounded-t-2xl px-4 text-sm transition-colors",
                          isActive
                            ? cn(
                                "day-tab-active h-12 bg-lime font-extrabold text-on-lime",
                                index === 0 && "day-tab-active-first",
                              )
                            : "h-10 font-medium text-on-lime/70 hover:text-on-lime",
                        )}
                      >
                        Day {index + 1}
                        {isSubmitted && (
                          <Check className="size-3.5" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {activeQuestion && (
                  <div className="overflow-hidden rounded-b-2xl bg-card shadow-sm">
                    {/* Question header bar: main lime, matching the active
                        tab it hangs from. Answers below stay on the plain
                        white card surface. */}
                    <div className="bg-lime px-4 py-3">
                      <p className="m-0 font-medium text-on-lime">
                        {localize(
                          activeQuestion.question_text,
                          activeQuestion.question_text_zh,
                          language,
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 p-4">
                      {activeQuestion.submission && (
                        <div className="flex flex-col gap-3">
                          <ul className="flex flex-col">
                            {activeQuestion.answers.map((answer) => {
                              const given =
                                activeQuestion.submission.ratings.find(
                                  (entry) => entry.answer_id === answer.id,
                                );
                              const rating = given
                                ? given.points_earned
                                : null;
                              return (
                                <li
                                  key={answer.id}
                                  className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 last:pb-0"
                                >
                                  <span className="flex items-baseline justify-between gap-3">
                                    <span className="min-w-0">
                                      {localize(
                                        answer.answer_text,
                                        answer.answer_text_zh,
                                        language,
                                      )}
                                    </span>
                                    <Badge variant="success">
                                      {rating} / {answer.points}
                                    </Badge>
                                  </span>
                                  <RatingScale
                                    name={`submitted-${activeQuestion.id}-${answer.id}`}
                                    max={answer.points}
                                    value={rating}
                                    onChange={() => {}}
                                    disabled
                                    ariaLabel={`${localize(
                                      activeQuestion.question_text,
                                      activeQuestion.question_text_zh,
                                      language,
                                    )} ${localize(
                                      answer.answer_text,
                                      answer.answer_text_zh,
                                      language,
                                    )}`}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                          <Progress
                            value={
                              (activeQuestion.submission.points_earned /
                                activeQuestion.points) *
                              100
                            }
                          >
                            <p className="m-0 text-sm text-muted-foreground">
                              {activeQuestion.submission.points_earned} pts —
                              submitted {activeQuestion.submission.submitted_at}
                            </p>
                          </Progress>
                        </div>
                      )}

                      {!activeQuestion.submission && !isStudent && (
                          <ul className="flex flex-col">
                            {activeQuestion.answers.map((answer) => (
                              <li
                                key={answer.id}
                                className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 last:pb-0"
                              >
                                <span className="min-w-0">
                                  {localize(
                                    answer.answer_text,
                                    answer.answer_text_zh,
                                    language,
                                  )}
                                </span>
                                <RatingScale
                                  name={`preview-${activeQuestion.id}-${answer.id}`}
                                  max={answer.points}
                                  value={null}
                                  onChange={() => {}}
                                  disabled
                                  ariaLabel={`${localize(
                                    activeQuestion.question_text,
                                    activeQuestion.question_text_zh,
                                    language,
                                  )} ${localize(
                                    answer.answer_text,
                                    answer.answer_text_zh,
                                    language,
                                  )}`}
                                />
                              </li>
                            ))}
                          </ul>
                        )}

                      {!activeQuestion.submission && isStudent && (
                          <form
                            className="flex flex-col gap-3"
                            onSubmit={(event) => {
                              event.preventDefault();
                              handleSubmitDay(activeQuestion);
                            }}
                          >
                            <ul className="flex flex-col">
                              {activeQuestion.answers.map((answer) => (
                                <li
                                  key={answer.id}
                                  className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 last:pb-0"
                                >
                                  <span className="min-w-0">
                                    {localize(
                                      answer.answer_text,
                                      answer.answer_text_zh,
                                      language,
                                    )}
                                  </span>
                                  <RatingScale
                                    name={`rating-${activeQuestion.id}-${answer.id}`}
                                    max={answer.points}
                                    value={
                                      (ratings[activeQuestion.id] || {})[
                                        answer.id
                                      ] ?? null
                                    }
                                    onChange={(value) =>
                                      setRatings((prev) => ({
                                        ...prev,
                                        [activeQuestion.id]: {
                                          ...(prev[activeQuestion.id] || {}),
                                          [answer.id]: value,
                                        },
                                      }))
                                    }
                                    ariaLabel={`${localize(
                                      activeQuestion.question_text,
                                      activeQuestion.question_text_zh,
                                      language,
                                    )} ${localize(
                                      answer.answer_text,
                                      answer.answer_text_zh,
                                      language,
                                    )}`}
                                  />
                                </li>
                              ))}
                            </ul>
                            {submitErrors[activeQuestion.id] && (
                              <ErrorAlert>
                                {submitErrors[activeQuestion.id]}
                              </ErrorAlert>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <Button
                                type="submit"
                                disabled={
                                  !isDayFullyRated(
                                    activeQuestion,
                                    ratings[activeQuestion.id] || {},
                                  ) || submittingId === activeQuestion.id
                                }
                              >
                                {submittingId === activeQuestion.id
                                  ? "Submitting..."
                                  : "Submit"}
                              </Button>
                              {!isDayFullyRated(
                                activeQuestion,
                                ratings[activeQuestion.id] || {},
                              ) && (
                                <span className="text-xs text-muted-foreground">
                                  Rate every statement to submit this day.
                                </span>
                              )}
                            </div>
                          </form>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {status === "success" && survey && (
        <aside className="w-full shrink-0 lg:w-72">
          <InsightCard tone="lime" title="Progress">
            <p className="m-0">
              <span className="font-semibold">
                {completedCount} of {answerableQuestions.length} days completed
              </span>
            </p>
            <p className="m-0 opacity-80">{pointsEarned} points earned</p>
            <p className="m-0 opacity-80">Uploaded {survey.uploaded_at}</p>
          </InsightCard>
        </aside>
      )}
    </div>
  );
}
