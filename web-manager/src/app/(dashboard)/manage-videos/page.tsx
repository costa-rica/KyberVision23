'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingOverlay } from '@/components/loading-overlay'
import { ConfirmModal } from '@/components/modals/confirm-modal'
import { Video, Trash2, Upload } from 'lucide-react'
import apiClient from '@/lib/api/client'

interface VideoRecord {
  id: string
  name: string
  date: string | null
  sessionId: string
  sessionDate: string | null
  filename: string
  processingCompleted: number | boolean | null
  processingFailed: number | boolean | null
}

function ProcessingStatus({ completed, failed }: { completed: VideoRecord['processingCompleted']; failed: VideoRecord['processingFailed'] }) {
  if (failed) return <span className="text-xs font-medium text-destructive">Failed</span>
  if (completed) return <span className="text-xs font-medium text-green-500">Completed</span>
  return <span className="text-xs font-medium text-yellow-500">Pending</span>
}

export default function ManageVideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading videos...')
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Upload form
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [uploadMethod, setUploadMethod] = useState<'youtube' | 'oldway'>('youtube')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete modal
  const [deleteVideo, setDeleteVideo] = useState<VideoRecord | null>(null)

  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/videos')
      const mapped: VideoRecord[] = (data.videosArray ?? []).map((v: any) => ({
        id: String(v.id),
        name: String(v.matchName ?? ''),
        date: v.date ?? null,
        sessionId: String(v.sessionId ?? ''),
        sessionDate: v.session?.sessionDate ?? null,
        filename: v.filename ?? '',
        processingCompleted: v.processingCompleted,
        processingFailed: v.processingFailed,
      }))
      setVideos(mapped)
    } catch {
      setError('Failed to load videos.')
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      setLoadingMessage('Loading videos...')
      await fetchVideos()
      setLoading(false)
    }
    init()
  }, [fetchVideos])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
    e.target.value = ''
  }

  async function handleUpload() {
    if (!selectedFile) return
    if (!sessionId.trim()) {
      setError('Please enter a Session ID.')
      return
    }

    setError(null)
    setLoading(true)
    setLoadingMessage('Uploading video...')
    setLoadingProgress(0)

    const formData = new FormData()
    formData.append('video', selectedFile)
    formData.append('sessionId', sessionId.trim())

    const endpoint = uploadMethod === 'youtube' ? '/videos/upload-youtube' : '/videos/upload'

    try {
      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : undefined
          setLoadingProgress(pct)
        },
      })
      setSelectedFile(null)
      setSessionId('')
      await fetchVideos()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Upload failed.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingProgress(undefined)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteVideo) return
    const video = deleteVideo
    setDeleteVideo(null)
    setLoading(true)
    setLoadingMessage('Deleting video...')
    try {
      await apiClient.delete(`/videos/${video.id}`)
      await fetchVideos()
    } catch {
      setError(`Failed to delete "${video.filename}".`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <LoadingOverlay
        visible={loading}
        message={loadingMessage}
        progress={loadingProgress}
      />

      <ConfirmModal
        isOpen={deleteVideo !== null}
        title="Delete Video"
        message={`Delete "${deleteVideo?.filename}"${deleteVideo?.sessionId ? ` (Session ID: ${deleteVideo.sessionId})` : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteVideo(null)}
      />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <Video className="size-5 text-kyber-purple-light" />
        <h1 className="text-xl font-semibold text-foreground">Manage Videos</h1>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Upload section */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground">Upload Video</span>
        </div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* File picker */}
            <div className="flex flex-col gap-1.5">
              <Label className="select-text text-xs font-medium text-muted-foreground">
                Video File
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <span className="truncate text-xs text-foreground">
                  {selectedFile.name}
                </span>
              )}
              {!selectedFile && (
                <span className="text-xs text-muted-foreground">.mp4 or .mov</span>
              )}
            </div>

            {/* Session ID */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="session-id"
                className="select-text text-xs font-medium text-muted-foreground"
              >
                Session ID
              </Label>
              <Input
                id="session-id"
                type="number"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="e.g. 42"
                className="h-9 border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Upload method */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="upload-method"
                className="select-text text-xs font-medium text-muted-foreground"
              >
                Upload Method
              </Label>
              <select
                id="upload-method"
                value={uploadMethod}
                onChange={(e) => setUploadMethod(e.target.value as 'youtube' | 'oldway')}
                className="h-9 rounded-md border border-border bg-secondary/30 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="youtube">via YouTube</option>
                <option value="oldway">Old way</option>
              </select>
            </div>

            {/* Upload button */}
            <div className="flex flex-col justify-end gap-1.5">
              <Button
                size="sm"
                disabled={!selectedFile || !sessionId.trim()}
                className="bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover disabled:opacity-40"
                onClick={handleUpload}
              >
                <Upload className="size-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Videos
            {videos.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({videos.length})</span>
            )}
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Match Name</TableHead>
              <TableHead className="text-muted-foreground">Session ID</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Filename</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No videos found.
                </TableCell>
              </TableRow>
            ) : (
              videos.map((v) => (
                <TableRow key={v.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {v.id}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{v.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {v.sessionId}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {v.sessionDate ?? v.date ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-48 truncate font-mono text-xs text-muted-foreground">
                    {v.filename}
                  </TableCell>
                  <TableCell>
                    <ProcessingStatus
                      completed={v.processingCompleted}
                      failed={v.processingFailed}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setDeleteVideo(v)}
                      className="group"
                      title={`Delete ${v.filename}`}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground transition-colors group-hover:text-destructive" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
