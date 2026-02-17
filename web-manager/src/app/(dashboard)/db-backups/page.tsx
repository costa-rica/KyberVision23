'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingOverlay } from '@/components/loading-overlay'
import {
  ChevronDown,
  HardDrive,
  Download,
  Upload,
  Plus,
  FileArchive,
} from 'lucide-react'
import apiClient from '@/lib/api/client'

interface TableRowCount {
  tableName: string
  rowCount: number
}

export default function DbBackupsPage() {
  const [backupOpen, setBackupOpen] = useState(true)
  const [tablesOpen, setTablesOpen] = useState(true)
  const [backups, setBackups] = useState<string[]>([])
  const [tables, setTables] = useState<TableRowCount[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const [loadingDetail, setLoadingDetail] = useState<string | undefined>()
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch backups and table counts on mount
  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setLoadingMessage('Loading backup data...')
      try {
        const [backupRes, tableRes] = await Promise.all([
          apiClient.get('/admin-db/backup-database-list'),
          apiClient.get('/admin-db/db-row-counts-by-table'),
        ])
        if (cancelled) return
        setBackups(backupRes.data.backups ?? [])
        setTables(tableRes.data.arrayRowCountsByTable ?? [])
      } catch {
        if (!cancelled) setError('Failed to load backup data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  async function refreshBackups() {
    try {
      const { data } = await apiClient.get('/admin-db/backup-database-list')
      setBackups(data.backups ?? [])
    } catch {
      // silent — the user already sees the main list
    }
  }

  async function handleCreateBackup() {
    setLoading(true)
    setLoadingMessage('Creating backup...')
    setLoadingDetail('This may take a moment')
    setLoadingProgress(undefined)
    setError(null)
    try {
      await apiClient.get('/admin-db/create-database-backup')
      await refreshBackups()
    } catch {
      setError('Failed to create backup.')
    } finally {
      setLoading(false)
      setLoadingDetail(undefined)
    }
  }

  async function handleDownload(filename: string) {
    try {
      const response = await apiClient.get(
        `/admin-db/send-db-backup/${encodeURIComponent(filename)}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to download ${filename}.`)
    }
  }

  async function handleUpload(file: File) {
    if (!file.name.endsWith('.zip')) {
      alert('Please select a .zip file')
      return
    }

    setLoading(true)
    setLoadingMessage('Uploading backup...')
    setLoadingDetail(file.name)
    setLoadingProgress(undefined)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('backupFile', file)
      await apiClient.post('/admin-db/import-db-backup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Refresh both lists after import
      const [backupRes, tableRes] = await Promise.all([
        apiClient.get('/admin-db/backup-database-list'),
        apiClient.get('/admin-db/db-row-counts-by-table'),
      ])
      setBackups(backupRes.data.backups ?? [])
      setTables(tableRes.data.arrayRowCountsByTable ?? [])
    } catch {
      setError('Failed to upload and restore backup.')
    } finally {
      setLoading(false)
      setLoadingDetail(undefined)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
      e.target.value = ''
    }
  }

  return (
    <>
      <LoadingOverlay
        visible={loading}
        message={loadingMessage}
        detail={loadingDetail}
        progress={loadingProgress}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <HardDrive className="size-5 text-kyber-purple-light" />
          <h1 className="text-xl font-semibold text-foreground">
            Db Backups
          </h1>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        {/* ===== Backup and Restore Section ===== */}
        <Collapsible open={backupOpen} onOpenChange={setBackupOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3 text-left transition-colors hover:bg-card/80">
            <span className="text-sm font-semibold text-foreground">
              Backup and Restore
            </span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                backupOpen ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4">
            {/* Create backup button */}
            <div>
              <Button
                size="sm"
                className="bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
                onClick={handleCreateBackup}
              >
                <Plus className="size-4" />
                Create Backup
              </Button>
            </div>

            {/* Backup list */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Available Backups
              </h3>
              {backups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No backups found.
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {backups.map((filename) => (
                    <li key={filename} className="flex items-center gap-2">
                      <FileArchive className="size-3.5 shrink-0 text-kyber-purple-light" />
                      <button
                        onClick={() => handleDownload(filename)}
                        className="truncate text-sm text-kyber-purple-light underline-offset-2 hover:underline text-left"
                        title={`Download ${filename}`}
                      >
                        {filename}
                      </button>
                      <Download className="size-3 shrink-0 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* File upload */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Restore from file
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Choose .zip file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Upload backup zip file"
                />
                <span className="text-xs text-muted-foreground">
                  .zip files only
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== Tables Section ===== */}
        <Collapsible open={tablesOpen} onOpenChange={setTablesOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3 text-left transition-colors hover:bg-card/80">
            <span className="text-sm font-semibold text-foreground">
              Tables
            </span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                tablesOpen ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 overflow-hidden rounded-lg border border-border bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Table Name
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Row Count
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                      No tables found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tables.map((t) => (
                    <TableRow
                      key={t.tableName}
                      className="border-border hover:bg-secondary/20"
                    >
                      <TableCell className="font-mono text-sm text-foreground">
                        {t.tableName}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {t.rowCount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}
