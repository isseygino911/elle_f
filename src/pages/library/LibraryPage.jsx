import { useCallback, useEffect, useMemo, useState } from 'react'
import { canManageStudents } from '../../lib/roles.js'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  Folder,
  Plus,
  Pencil,
  Trash2,
  Download,
  FolderInput,
  Search,
  Upload,
  Eye,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  File as FileIcon,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import {
  listLibraryCategories,
  listLibraryFiles,
  createLibraryCategory,
  renameLibraryCategory,
  deleteLibraryCategory,
  getLibraryDownloadUrl,
  updateLibraryFile,
  deleteLibraryFile,
} from '../../api/client.js'
import { UNCATEGORIZED } from '../../constants/library.js'
import { formatFileSize, fileKind } from '../../utils/formatFileSize.js'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import ConfirmDialog from '@/components/ConfirmDialog'
import FilePreviewDialog from '@/components/library/FilePreviewDialog'
import { isPreviewable } from '@/components/library/FilePreview'

const KIND_ICONS = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  sheet: FileSpreadsheet,
  pdf: FileText,
  document: FileText,
  file: FileIcon,
}

// Dark-themed override for the (light-by-default) shadcn Input/Select, used
// only for the controls that sit inside the dark category panel — same
// approach as VideosLayout's DARK_TRIGGER_CLASS.
const DARK_INPUT_CLASS =
  'h-8 border-dark-border bg-dark-card-hover text-xs text-white placeholder:text-dark-muted focus-visible:border-lime focus-visible:ring-lime/50'

// A single row in the file table. Kept in this file (rather than its own
// module) because it's only ever rendered here and shares the page's
// handlers directly.
// `uncategorizedLabel` is passed in rather than read from useLanguage() here
// so the row stays a presentational component and the label can't drift from
// the one the category panel renders.
function FileRow({ file, isElle, categories, uncategorizedLabel, onPreview, onDownload, onMove, onRename, onDelete, busy }) {
  const Icon = KIND_ICONS[fileKind(file.content_type)] || FileIcon
  // Office docs and archives have nothing the browser can render, so they
  // get no View affordance rather than a button that opens a dead end.
  const canPreview = isPreviewable(file.content_type)

  return (
    <li className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <Link
            to={`/library/${file.id}`}
            className="block truncate text-sm font-semibold text-foreground hover:text-primary"
          >
            {file.title}
          </Link>
          <span className="block truncate text-xs text-muted-foreground">
            {file.original_filename} · {formatFileSize(file.size_bytes)}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <Badge variant={file.category_id ? 'outline' : 'secondary'}>
          {file.category_name || uncategorizedLabel}
        </Badge>

        {/* Moving a file is a category reassignment, so the control is the
            category picker itself rather than a separate dialog.
            SelectValue needs the children render-prop: Base UI renders the
            raw value string otherwise, not the matching item's label. */}
        {isElle && (
          <Select
            value={file.category_id ? String(file.category_id) : UNCATEGORIZED}
            onValueChange={(next) => onMove(file, next)}
            disabled={busy}
            items={[
              { value: UNCATEGORIZED, label: uncategorizedLabel },
              ...categories.map((category) => ({ value: String(category.id), label: category.name })),
            ]}
          >
            <SelectTrigger
              className="h-8 w-auto min-w-36 text-xs"
              aria-label={`Move ${file.title} to another category`}
            >
              <FolderInput className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <SelectValue>
                {(current) =>
                  current === UNCATEGORIZED || !current
                    ? uncategorizedLabel
                    : categories.find((candidate) => String(candidate.id) === current)?.name || uncategorizedLabel
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {canPreview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`View ${file.title}`}
            onClick={() => onPreview(file)}
          >
            <Eye className="size-4" aria-hidden="true" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Download ${file.title}`}
          onClick={() => onDownload(file)}
        >
          <Download className="size-4" aria-hidden="true" />
        </Button>

        {isElle && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`Rename ${file.title}`}
              onClick={() => onRename(file)}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              aria-label={`Delete ${file.title}`}
              onClick={() => onDelete(file)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </>
        )}
      </span>
    </li>
  )
}

export default function LibraryPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const isElle = canManageStudents(user)

  const [categories, setCategories] = useState([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const [activeCategory, setActiveCategory] = useState('') // '' = all files
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [busyFileId, setBusyFileId] = useState(null)

  const [pendingDelete, setPendingDelete] = useState(null) // { kind: 'file'|'category', record }
  const [deleting, setDeleting] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)

  // Debounced so typing in the search box doesn't fire a request per
  // keystroke; the server does the LIKE filtering.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadCategories = useCallback(async () => {
    const body = await listLibraryCategories(accessToken)
    setCategories(body.categories)
    setUncategorizedCount(body.uncategorized_count)
  }, [accessToken])

  // Both lists reload together after any mutation: a move changes file
  // placement *and* the per-category counts, so refetching only one would
  // leave the other stale.
  const reload = useCallback(async () => {
    setActionError(null)
    try {
      await Promise.all([
        loadCategories(),
        listLibraryFiles(accessToken, {
          categoryId: activeCategory || undefined,
          q: debouncedSearch || undefined,
        }).then((body) => setFiles(body.files)),
      ])
      setStatus('success')
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken, activeCategory, debouncedSearch, loadCategories])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    Promise.all([
      listLibraryCategories(accessToken),
      listLibraryFiles(accessToken, {
        categoryId: activeCategory || undefined,
        q: debouncedSearch || undefined,
      }),
    ])
      .then(([categoryBody, fileBody]) => {
        if (cancelled) return
        setCategories(categoryBody.categories)
        setUncategorizedCount(categoryBody.uncategorized_count)
        setFiles(fileBody.files)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, activeCategory, debouncedSearch])

  const totalFileCount = useMemo(
    () => categories.reduce((sum, category) => sum + (category.file_count || 0), 0) + uncategorizedCount,
    [categories, uncategorizedCount]
  )

  async function handleCreateCategory(event) {
    event.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setCreatingCategory(true)
    setActionError(null)
    try {
      await createLibraryCategory(accessToken, name)
      setNewCategoryName('')
      await loadCategories()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleRenameCategory(category) {
    const next = window.prompt('Rename category', category.name)
    if (next === null) return
    const trimmed = next.trim()
    if (!trimmed || trimmed === category.name) return

    setActionError(null)
    try {
      await renameLibraryCategory(accessToken, category.id, trimmed)
      await loadCategories()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    }
  }

  async function handleDownload(file) {
    setActionError(null)
    try {
      const { url } = await getLibraryDownloadUrl(accessToken, file.id)
      // The presigned URL already carries a Content-Disposition attachment
      // header, so navigating to it downloads rather than navigates away.
      window.location.href = url
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    }
  }

  async function handleMove(file, nextValue) {
    const nextCategoryId = nextValue === UNCATEGORIZED ? null : Number(nextValue)
    if (nextCategoryId === file.category_id) return

    setBusyFileId(file.id)
    setActionError(null)
    try {
      await updateLibraryFile(accessToken, file.id, { category_id: nextCategoryId })
      await reload()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setBusyFileId(null)
    }
  }

  async function handleRenameFile(file) {
    const next = window.prompt('Rename file', file.title)
    if (next === null) return
    const trimmed = next.trim()
    if (!trimmed || trimmed === file.title) return

    setBusyFileId(file.id)
    setActionError(null)
    try {
      await updateLibraryFile(accessToken, file.id, { title: trimmed })
      await reload()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setBusyFileId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return

    setDeleting(true)
    setActionError(null)
    try {
      if (pendingDelete.kind === 'file') {
        await deleteLibraryFile(accessToken, pendingDelete.record.id)
      } else {
        await deleteLibraryCategory(accessToken, pendingDelete.record.id)
        // The deleted category may be the active filter; fall back to "All
        // files" so the view isn't left pointing at something gone.
        if (String(activeCategory) === String(pendingDelete.record.id)) {
          setActiveCategory('')
        }
      }
      setPendingDelete(null)
      await reload()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setDeleting(false)
    }
  }

  const categoryButton = (value, label, count, category) => {
    const isActive = activeCategory === value
    return (
      <li key={value || 'all'} className="group flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory(value)}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors duration-150',
            isActive ? 'bg-lime text-on-lime' : 'text-dark-muted hover:bg-dark-card-hover hover:text-white'
          )}
        >
          {isActive ? (
            <FolderOpen className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Folder className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <span className={cn('shrink-0 text-xs', isActive ? 'text-on-lime/70' : 'text-dark-muted')}>{count}</span>
        </button>
        {isElle && category && (
          <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-dark-muted hover:bg-dark-card-hover hover:text-white"
              aria-label={`Rename ${category.name}`}
              onClick={() => handleRenameCategory(category)}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-dark-muted hover:bg-dark-card-hover hover:text-red-400"
              aria-label={`Delete ${category.name}`}
              onClick={() => setPendingDelete({ kind: 'category', record: category })}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </span>
        )}
      </li>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      {/* Category panel — the dark chrome surface, matching the list panel
          in MasterDetailLayout used by /videos and /surveys. */}
      <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-dark-border bg-dark p-5 lg:h-full lg:w-[20rem] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="m-0 font-heading text-xl font-extrabold text-white">{t('library.title')}</h1>
          {/* Base UI's Button composes via `render`, not asChild — same
              pattern the Sheet/Tooltip triggers use elsewhere. */}
          {isElle && (
            <Button
              size="sm"
              className="shrink-0"
              render={
                <Link to="/library/upload">
                  <Upload className="size-4" aria-hidden="true" />
                  {t('library.upload')}
                </Link>
              }
            />
          )}
        </div>

        <ul className="flex flex-col gap-1">
          {categoryButton('', t('library.allFiles'), totalFileCount, null)}
          {categories.map((category) => categoryButton(String(category.id), category.name, category.file_count, category))}
          {categoryButton(UNCATEGORIZED, t('library.uncategorized'), uncategorizedCount, null)}
        </ul>

        {isElle && (
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-2 border-t border-dark-border pt-3">
            <label htmlFor="new-category" className="text-xs font-medium text-dark-muted">
              {t('library.newCategory')}
            </label>
            <div className="flex items-center gap-1.5">
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder={t('library.categoryNamePlaceholder')}
                className={DARK_INPUT_CLASS}
              />
              <Button type="submit" size="icon" className="size-8 shrink-0" disabled={creatingCategory || !newCategoryName.trim()} aria-label={t('library.newCategory')}>
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* File list */}
      <div className="min-w-0 flex-1 bg-background lg:h-full lg:overflow-y-auto">
        <main className="mx-auto flex w-full max-w-(--content-max-width) flex-col gap-5 px-5 pt-6 pb-16 [--content-max-width:64rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('library.searchPlaceholder')}
              aria-label={t('library.searchPlaceholder')}
              className="pl-9"
            />
          </div>

          {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

          {status === 'loading' && <LoadingText>{t('library.loading')}</LoadingText>}
          {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
          {status === 'success' && files.length === 0 && <EmptyState>{t('library.empty')}</EmptyState>}

          {status === 'success' && files.length > 0 && (
            <ul className="flex flex-col gap-2">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isElle={isElle}
                  categories={categories}
                  uncategorizedLabel={t('library.uncategorized')}
                  busy={busyFileId === file.id}
                  onPreview={setPreviewFile}
                  onDownload={handleDownload}
                  onMove={handleMove}
                  onRename={handleRenameFile}
                  onDelete={(record) => setPendingDelete({ kind: 'file', record })}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      <FilePreviewDialog
        file={previewFile}
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title={pendingDelete?.kind === 'category' ? t('library.deleteCategoryTitle') : t('library.deleteFileTitle')}
        description={
          pendingDelete?.kind === 'category'
            ? t('library.deleteCategoryDescription')
            : t('library.deleteFileDescription')
        }
        pending={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
