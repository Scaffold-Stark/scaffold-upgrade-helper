import React, { useState, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import { Popover } from 'antd'
import semver from 'semver/preload'
import queryString from 'query-string'
import { Select } from '.'
import UpgradeButton from './UpgradeButton'
import { useFetchReleaseVersions } from '../../hooks/fetch-release-versions'
import { updateURL } from '../../utils/update-url'
import { deviceSizes } from '../../utils/device-sizes'
import type { SelectProps } from './Select'

export const testIDs = {
  fromVersionSelector: 'fromVersionSelector',
  toVersionSelector: 'toVersionSelector',
}

const Selectors = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media ${deviceSizes.tablet} {
    flex-direction: row;
  }
`

const FromVersionSelector = styled(Select)``

interface ToVersionSelectorProps extends SelectProps {
  popover?: React.ReactNode
}

const ToVersionSelector = styled(
  ({ popover, ...props }: ToVersionSelectorProps) =>
    popover ? (
      // @ts-ignore-next-line
      React.cloneElement(popover, {
        children: <Select {...props} />,
      })
    ) : (
      <Select {...props} />
    )
)``

const InstructionsContainer = styled.div`
  margin: 24px 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.instruction.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.instruction.background};
  color: ${({ theme }) => theme.text};

  h3 {
    margin: 0 0 16px 0;
    color: ${({ theme }) => theme.text};
    font-size: 18px;
    font-weight: 600;
  }

  h4 {
    margin: 16px 0 8px 0;
    color: ${({ theme }) => theme.text};
    font-size: 16px;
    font-weight: 500;
  }

  p {
    margin: 0 0 12px 0;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
  }

  ol,
  ul {
    margin: 8px 0 16px 0;
    padding-left: 20px;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
  }

  li {
    margin-bottom: 6px;
    color: ${({ theme }) => theme.text};
  }

  code {
    background-color: ${({ theme }) => theme.border};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo',
      'Courier', monospace;
    font-size: 0.9em;
    color: ${({ theme }) => theme.text};
  }

  a {
    color: ${({ theme }) => theme.link};
    text-decoration: none;

    &:hover {
      color: ${({ theme }) => theme.linkHover};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.instruction.border};
    margin: 12px 0;
    display: block;
  }
`

const getVersionsInURL = (): {
  fromVersion: string
  toVersion: string
} => {
  // Parses `/?from=VERSION&to=VERSION` from URL
  const { from: fromVersion, to: toVersion } = queryString.parse(
    window.location.search
  )

  return {
    fromVersion: fromVersion as string,
    toVersion: toVersion as string,
  }
}

// Users making changes to version should not retain anchor links
// to files that may or may not change.
const stripAnchorInUrl = () => {
  if (window.location.hash) {
    const url = new URL(window.location.toString())
    url.hash = ''
    window.history.pushState({}, '', url)
  }
  return true
}

const compareReleaseCandidateVersions = ({
  version,
  versionToCompare,
}: {
  version: string | semver.SemVer
  versionToCompare: string | semver.SemVer
}) =>
  ['prerelease', 'prepatch', null].includes(
    semver.diff(version, versionToCompare)
  )

const getLatestMajorReleaseVersion = (releasedVersions: string[]) =>
  semver.valid(
    semver.coerce(
      releasedVersions.find(
        (releasedVersion) =>
          !semver.prerelease(releasedVersion) &&
          semver.patch(releasedVersion) === 0
      )
    )
  )

// Check if `from` rc version is one of the latest major release (ie. 0.60.0)
const checkIfVersionIsALatestRC = ({
  version,
  latestVersion,
}: {
  version: string
  latestVersion: string
}) =>
  semver.prerelease(version) &&
  compareReleaseCandidateVersions({
    version: latestVersion,
    versionToCompare: version,
  })

// Filters out release candidates from `releasedVersion` with the
// exception of the release candidates from the latest version
const getReleasedVersionsWithCandidates = ({
  releasedVersions,
  toVersion,
  latestVersion,
  showReleaseCandidates,
}: {
  releasedVersions: string[]
  toVersion: string
  latestVersion: string
  showReleaseCandidates: boolean
}) => {
  const isToVersionAReleaseCandidate = semver.prerelease(toVersion) !== null
  const isLatestAReleaseCandidate = semver.prerelease(latestVersion) !== null

  return releasedVersions.filter((releasedVersion) => {
    // Show the release candidates of the latest version
    const isLatestReleaseCandidate =
      showReleaseCandidates &&
      checkIfVersionIsALatestRC({
        version: releasedVersion,
        latestVersion,
      })

    return (
      isLatestReleaseCandidate ||
      semver.prerelease(releasedVersion) === null ||
      (isToVersionAReleaseCandidate &&
        compareReleaseCandidateVersions({
          version: toVersion,
          versionToCompare: releasedVersion,
        })) ||
      (isLatestAReleaseCandidate &&
        compareReleaseCandidateVersions({
          version: latestVersion,
          versionToCompare: releasedVersion,
        }))
    )
  })
}

const getReleasedVersions = ({
  releasedVersions,
  minVersion,
  maxVersion,
}: {
  releasedVersions: string[]
  minVersion?: string
  maxVersion?: string
}) => {
  const latestMajorReleaseVersion =
    getLatestMajorReleaseVersion(releasedVersions)

  const isVersionAReleaseAndOfLatest = (version: string) =>
    version.includes('rc') &&
    semver.valid(semver.coerce(version)) === latestMajorReleaseVersion

  return releasedVersions.filter(
    (releasedVersion) =>
      releasedVersion.length > 0 &&
      ((maxVersion && semver.lt(releasedVersion, maxVersion)) ||
        (minVersion &&
          semver.gt(releasedVersion, minVersion) &&
          !isVersionAReleaseAndOfLatest(releasedVersion)))
  )
}

const getFirstMajorRelease = ({
  releasedVersions,
  versionToCompare,
}: {
  releasedVersions: string[]
  versionToCompare: string
}) =>
  releasedVersions.find(
    (releasedVersion) =>
      semver.lt(releasedVersion, versionToCompare) &&
      semver.diff(
        semver.valid(semver.coerce(releasedVersion))!,
        semver.valid(semver.coerce(versionToCompare))!
      ) === 'minor'
  )

// Return if version exists in the ones returned from GitHub
const doesVersionExist = ({
  version,
  allVersions,
  minVersion,
}: {
  version: string
  allVersions: string[]
  minVersion?: string
}) => {
  try {
    return (
      version &&
      allVersions.includes(version) &&
      // Also compare the version against a `minVersion`, this is used
      // to not allow the user to have a `fromVersion` newer than `toVersion`
      (!minVersion || (minVersion && semver.gt(version, minVersion)))
    )
  } catch (_error) {
    return false
  }
}

const VersionSelector = ({
  showDiff,
}: {
  showDiff: (args: { fromVersion: string; toVersion: string }) => void
}) => {
  const { isLoading, isDone, releaseVersions } = useFetchReleaseVersions()
  const [allVersions, setAllVersions] = useState<string[]>([])
  const [fromVersionList, setFromVersionList] = useState<string[]>([])
  const [toVersionList, setToVersionList] = useState<string[]>([])
  const [hasVersionsFromURL, setHasVersionsFromURL] = useState<boolean>(false)

  const [localFromVersion, setLocalFromVersion] = useState<string>('')
  const [localToVersion, setLocalToVersion] = useState<string>('')

  const upgradeButtonEl = useRef<HTMLElement>(null)

  useEffect(() => {
    const versionsInURL = getVersionsInURL()

    const fetchVersions = async () => {
      // Check if the versions provided in the URL are valid
      const hasFromVersionInURL = doesVersionExist({
        version: versionsInURL.fromVersion,
        allVersions: releaseVersions,
      })

      const hasToVersionInURL = doesVersionExist({
        version: versionsInURL.toVersion,
        allVersions: releaseVersions,
        minVersion: versionsInURL.fromVersion,
      })

      const latestVersion = releaseVersions[0]
      // If the version from URL is not valid then fallback to the latest
      const toVersionToBeSet = hasToVersionInURL
        ? versionsInURL.toVersion
        : latestVersion

      // Remove `rc` versions from the array of versions
      const sanitizedVersions = getReleasedVersionsWithCandidates({
        releasedVersions: releaseVersions,
        toVersion: toVersionToBeSet,
        latestVersion,
        showReleaseCandidates: false,
      })

      setAllVersions(sanitizedVersions)

      const fromVersionToBeSet = hasFromVersionInURL
        ? versionsInURL.fromVersion
        : // Get first major release before latest
          getFirstMajorRelease({
            releasedVersions: sanitizedVersions,
            versionToCompare: toVersionToBeSet,
          })

      setFromVersionList(
        getReleasedVersions({
          releasedVersions: sanitizedVersions,
          maxVersion: toVersionToBeSet,
        })
      )
      setToVersionList(
        getReleasedVersions({
          releasedVersions: sanitizedVersions,
          minVersion: fromVersionToBeSet,
        })
      )

      setLocalFromVersion(fromVersionToBeSet!)
      setLocalToVersion(toVersionToBeSet)

      const doesHaveVersionsInURL = hasFromVersionInURL && hasToVersionInURL

      setHasVersionsFromURL(!!doesHaveVersionsInURL)
    }

    if (isDone) {
      fetchVersions()
    }
  }, [isDone, releaseVersions, setLocalFromVersion, setLocalToVersion])

  useEffect(() => {
    if (isLoading) {
      return
    }

    setFromVersionList(
      getReleasedVersions({
        releasedVersions: allVersions,
        maxVersion: localToVersion,
      })
    )
    setToVersionList(
      getReleasedVersions({
        releasedVersions: allVersions,
        minVersion: localFromVersion,
      })
    )

    if (hasVersionsFromURL) {
      upgradeButtonEl?.current?.click()
    }
  }, [
    isLoading,
    allVersions,
    localFromVersion,
    localToVersion,
    hasVersionsFromURL,
  ])

  const onShowDiff = () => {
    showDiff({
      fromVersion: localFromVersion,
      toVersion: localToVersion,
    })

    updateURL({
      fromVersion: localFromVersion,
      toVersion: localToVersion,
    })
  }

  return (
    <>
      <Selectors>
        <FromVersionSelector
          showSearch
          data-testid={testIDs.fromVersionSelector}
          title={`What's your current Scaffold-Stark version?`}
          loading={isLoading}
          value={localFromVersion}
          options={fromVersionList}
          onChange={(chosenVersion) =>
            stripAnchorInUrl() && setLocalFromVersion(chosenVersion)
          }
        />

        <ToVersionSelector
          showSearch
          data-testid={testIDs.toVersionSelector}
          title="To which version would you like to upgrade?"
          loading={isLoading}
          value={localToVersion}
          options={toVersionList}
          popover={
            localToVersion === '0.60.1' && (
              <Popover
                open={true}
                placement="topLeft"
                content="We recommend using the latest 0.60 patch release instead of 0.60.1."
              />
            )
          }
          onChange={(chosenVersion) =>
            stripAnchorInUrl() && setLocalToVersion(chosenVersion)
          }
        />
      </Selectors>

      <InstructionsContainer>
        <h3>📋 How to find your Scaffold Stark version</h3>

        <h4>Method 1: Check your package.json file (Recommended)</h4>
        <ol>
          <li>Open your Scaffold Stark project folder</li>
          <li>
            Look for the <code>package.json</code> file in the root directory
            (same level as your README.md)
          </li>
          <li>
            Open <code>package.json</code> in any text editor
          </li>
          <li>
            Find the <code>"name"</code> field - it should contain{' '}
            <code>"scaffold-stark-2"</code>
          </li>
          <li>
            Look for the <code>"version"</code> field right below it - this is
            your current version (e.g., "2.0.0")
          </li>
        </ol>

        <h4>Method 2: Check online repositories</h4>
        <p>
          You can also check the latest versions on{' '}
          <a
            href="https://github.com/scaffold-stark/scaffold-stark-2/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            Scaffold Stark GitHub releases
          </a>{' '}
          or{' '}
          <a
            href="https://www.npmjs.com/package/scaffold-stark"
            target="_blank"
            rel="noopener noreferrer"
          >
            NPM page
          </a>
          .
        </p>

        <h3>🚀 How to use the upgrade diffs</h3>
        <p>
          Once you click "Show me how to upgrade!", this tool will generate a
          detailed comparison showing:
        </p>
        <ul>
          <li>
            <strong>📁 File changes:</strong> Each file that needs to be
            modified, added, or removed
          </li>
          <li>
            <strong>🔍 Line-by-line diffs:</strong> Exact changes showing what
            to remove (red) and add (green)
          </li>
          <li>
            <strong>📋 Action buttons:</strong> Each file has three helpful
            buttons at the top right
          </li>
          <li>
            <strong>✅ Progress tracking:</strong> Mark files as completed to
            track your progress
          </li>
        </ul>

        <h4>Action Buttons for Each File</h4>
        <p>
          Each file diff comes with three action buttons to help you manage the
          upgrade process:
        </p>
        <img
          src="https://res.cloudinary.com/dv765kdgq/image/upload/v1754086601/Screenshot_From_2025-08-02_01-15-50_tybqty.png"
          alt="Three action buttons: Raw, Copy, and Mark as viewed"
          style={{ maxWidth: '100%', height: 'auto', margin: '8px 0' }}
        />
        <ul>
          <li>
            <strong>Raw:</strong> View the complete file content without
            formatting
          </li>
          <li>
            <strong>Copy:</strong> Copy the entire updated file content to your
            clipboard
          </li>
          <li>
            <strong>Mark as viewed:</strong> Track your progress by marking
            files you've completed
          </li>
        </ul>

        <h4>Progress Tracker</h4>
        <p>
          As you mark files as viewed, a progress counter appears at the bottom
          right showing your completion status:
        </p>
        <img
          src="https://res.cloudinary.com/dv765kdgq/image/upload/v1754086801/Screenshot_From_2025-08-02_01-19-37_vfr91d.png"
          alt="Progress tracker showing completed files count"
          style={{ maxWidth: '100%', height: 'auto', margin: '8px 0' }}
        />
        <p>
          This counter helps you keep track of which files you've reviewed and
          how many are left to complete your upgrade.
        </p>

        <p>
          <strong>💡 Pro tip:</strong> Work through the files one by one, making
          the suggested changes to your local project. Use the "Copy" button to
          easily replace file contents, and mark files as viewed to track your
          progress!
        </p>
      </InstructionsContainer>

      <UpgradeButton ref={upgradeButtonEl} onShowDiff={onShowDiff} />
    </>
  )
}

export default VersionSelector
