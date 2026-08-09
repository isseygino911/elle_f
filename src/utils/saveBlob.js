// Triggers a browser "save file" for bytes the app already holds in memory.
//
// Every other download in this app points the browser at a presigned S3 URL
// (see LibraryPage's handleDownload), which needs none of this — the URL is
// public for its lifetime and carries its own Content-Disposition, so
// `window.location.href = url` is enough.
//
// A student's filled survey has no S3 object: the server renders it per
// request from their current responses, over an authenticated request. Bytes
// fetched that way arrive as a blob, and a blob can only be handed to the
// user through a synthetic <a download> click — which also means the filename
// has to be supplied here rather than by a response header.
//
// The object URL is revoked immediately after the click. The download has
// already been handed to the browser's download manager by then, so revoking
// does not cancel it, and skipping the revoke would pin the blob in memory
// for the lifetime of the page.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
