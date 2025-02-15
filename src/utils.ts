export const getDiffURL = ({
  packageName,
  language,
  fromVersion,
  toVersion,
}: {
  packageName: string
  language: string
  fromVersion: string
  toVersion: string
}) => {
  return `https://github.com/Scaffold-Stark/scaffold-stark-2/compare/${fromVersion}..${toVersion}.diff`
}

interface GetBinaryFileURLProps {
  packageName: string
  language?: string
  version: string
  path: string
}
// `path` must contain `RnDiffApp` prefix
export const getBinaryFileURL = ({
  packageName,
  language,
  version,
  path,
}: GetBinaryFileURLProps) => {
  return `https://raw.githubusercontent.com/Scaffold-Stark/scaffold-stark-2/refs/tags/${version}/${path}`
}

export const getVersionsContentInDiff = ({
  packageName,
  fromVersion,
  toVersion,
}: {
  packageName: string
  fromVersion: string
  toVersion: string
}) => {
  return []
}

// If the browser is headless (running puppeteer) then it doesn't have any duration
export const getTransitionDuration = (duration: number) =>
  navigator.webdriver ? 0 : duration

// settings constants
export const SHOW_LATEST_RCS = 'Show latest release candidates'
