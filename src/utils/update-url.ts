export function updateURL({
  fromVersion,
  toVersion,
}: {
  fromVersion: string
  toVersion: string
}) {
  const url = new URL(window.location.origin)
  url.pathname = window.location.pathname
  url.hash = window.location.hash

  if (fromVersion) {
    url.searchParams.set('from', fromVersion)
  }
  if (toVersion) {
    url.searchParams.set('to', toVersion)
  }
  window.history.replaceState(null, '', url.toString())
}
