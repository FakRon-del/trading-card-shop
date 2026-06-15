'use client'

import { useState, useRef } from 'react'
import { getToken } from '../lib/auth'

type Props = {
  value: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('http://localhost:4000/api/upload/card-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        setPreview(value)
        return
      }

      setPreview(data.imageUrl)
      onChange(data.imageUrl)
    } catch {
      setError('Upload failed. Try again.')
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 block">Card Image</label>

      {/* Preview + upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Card preview"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-xs font-medium">Click to change</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-2xl mb-1">📸</p>
            <p className="text-xs text-gray-400">Click to upload card image</p>
            <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, WebP · Max 5MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
              <p className="text-white text-xs">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* URL fallback */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Or paste image URL
        </label>
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setPreview(e.target.value) }}
          className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors"
          placeholder="https://..."
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}