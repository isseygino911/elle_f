import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/lib/LanguageContext'

// Chooses which survey the roster's progress is measured against.
//
// This control exists because progress across MULTIPLE surveys has no single
// honest number. Summing them (what the server used to do unconditionally)
// makes "completion" mean "fraction of the org's entire accumulated question
// corpus", so finishing one of three surveys reads as 33%, and uploading a
// fourth silently drops every student's percentage without anyone answering
// anything. There is no is_active flag on surveys to pick a winner
// automatically -- migration 0012 dropped the only per-student link and
// nothing replaced it -- so the teacher says which one they mean.
//
// Renders nothing for a single survey: a picker with one option is a control
// that cannot be operated, and the card title already says what is being
// measured.
export default function SurveyPicker({ surveys, surveyId, onChange, disabled }) {
  const { language, t } = useLanguage()

  if (!surveys || surveys.length < 2) return null

  // title_zh is nullable -- a survey uploaded before the translation columns
  // existed, or simply never translated, falls back to its original title
  // rather than rendering an empty option.
  const labelFor = (survey) => (language === 'zh' && survey.title_zh) || survey.title

  return (
    <Select
      value={surveyId == null ? '' : String(surveyId)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
      items={surveys.map((survey) => ({ value: String(survey.id), label: labelFor(survey) }))}
    >
      <SelectTrigger className="h-8 w-auto min-w-40 text-xs" aria-label={t('dashboard.surveyPickerLabel')}>
        <SelectValue>
          {(current) => {
            const match = surveys.find((survey) => String(survey.id) === current)
            return match ? labelFor(match) : t('dashboard.surveyPickerLabel')
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {surveys.map((survey) => (
          <SelectItem key={survey.id} value={String(survey.id)}>
            {labelFor(survey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
