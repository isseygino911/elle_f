import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import {
  getSurvey,
  getSurveyDownloadUrl,
  submitSurveyAnswer,
} from "../../api/client.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingText, ErrorAlert } from "@/components/Page";
import InsightCard from "@/components/records/InsightCard";

export default function SurveyDetailPage() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
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

  const [activeDayId, setActiveDayId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
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
          // Land on the current answerable day (the first unlocked,
          // not-yet-submitted question) so the student picks up where they
          // left off. If every day is already submitted, land on the last
          // one instead -- there's always exactly one active tab, unlike
          // the old accordion which could have nothing expanded.
          const answerable = nextSurvey.questions.filter(
            (q) => q.answers && q.answers.length > 0,
          );
          const current = answerable.find((q) => !q.locked && !q.submission);
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
  // locked/submission state for every question comes straight from the
  // server's ordering logic instead of being reimplemented client-side.
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

  async function handleSubmitAnswer(questionId) {
    const answerId = selectedAnswers[questionId];
    if (!answerId) return;

    setSubmittingId(questionId);
    setSubmitErrors((prev) => ({ ...prev, [questionId]: null }));
    try {
      await submitSurveyAnswer(accessToken, id, questionId, answerId);
      await reloadSurvey();
    } catch (err) {
      setSubmitErrors((prev) => ({
        ...prev,
        [questionId]: (err.body && err.body.message) || err.message,
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
            <h2>{survey.title}</h2>
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
              <Button onClick={handleDownload} disabled={downloading}>
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
                      <span>{question.question_text}</span>
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
                        {question.locked && (
                          <Lock className="size-3" aria-hidden="true" />
                        )}
                        {!question.locked && isSubmitted && (
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
                        {activeQuestion.question_text}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 p-4">
                      {activeQuestion.locked && (
                        <p className="m-0 text-xs text-muted-foreground">
                          Complete the previous day to unlock this one.
                        </p>
                      )}

                      {!activeQuestion.locked && activeQuestion.submission && (
                        <div className="flex flex-col gap-3">
                          <ul className="flex flex-col">
                            {activeQuestion.answers.map((answer) => {
                              const isSelected =
                                answer.id ===
                                activeQuestion.submission.answer_id;
                              return (
                                <li
                                  key={answer.id}
                                  className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={isSelected}
                                      disabled
                                      readOnly
                                      className="accent-primary"
                                    />
                                    {answer.answer_text}
                                  </span>
                                  {isSelected && (
                                    <Badge variant="success">✓ selected</Badge>
                                  )}
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

                      {!activeQuestion.locked &&
                        !activeQuestion.submission &&
                        !isStudent && (
                          <ul className="flex flex-col">
                            {activeQuestion.answers.map((answer) => (
                              <li
                                key={answer.id}
                                className="border-b border-border py-3 last:border-b-0 last:pb-0"
                              >
                                {answer.answer_text}
                              </li>
                            ))}
                          </ul>
                        )}

                      {!activeQuestion.locked &&
                        !activeQuestion.submission &&
                        isStudent && (
                          <form
                            className="flex flex-col gap-3"
                            onSubmit={(event) => {
                              event.preventDefault();
                              handleSubmitAnswer(activeQuestion.id);
                            }}
                          >
                            <ul className="flex flex-col">
                              {activeQuestion.answers.map((answer) => (
                                <li
                                  key={answer.id}
                                  className="border-b border-border py-3 last:border-b-0 last:pb-0"
                                >
                                  <label className="flex min-w-0 items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`answer-${activeQuestion.id}`}
                                      value={answer.id}
                                      checked={
                                        selectedAnswers[activeQuestion.id] ===
                                        answer.id
                                      }
                                      onChange={() =>
                                        setSelectedAnswers((prev) => ({
                                          ...prev,
                                          [activeQuestion.id]: answer.id,
                                        }))
                                      }
                                      className="accent-primary"
                                    />
                                    {answer.answer_text}
                                  </label>
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
                                  !selectedAnswers[activeQuestion.id] ||
                                  submittingId === activeQuestion.id
                                }
                              >
                                {submittingId === activeQuestion.id
                                  ? "Submitting..."
                                  : "Submit"}
                              </Button>
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
