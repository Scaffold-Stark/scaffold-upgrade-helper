import { useEffect, useState } from 'react'
import { parseDiff } from 'react-diff-view'
import type { File } from 'gitdiff-parser'
import { getDiffURL } from '../utils'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const movePackageJsonToTop = (parsedDiff: File[]) =>
  parsedDiff.sort(({ newPath }) => (newPath.includes('package.json') ? -1 : 1))

interface UseFetchDiffProps {
  shouldShowDiff: boolean
  packageName: string
  language: string
  fromVersion: string
  toVersion: string
}
export const useFetchDiff = ({
  shouldShowDiff,
  packageName,
  language,
  fromVersion,
  toVersion,
}: UseFetchDiffProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDone, setIsDone] = useState<boolean>(false)
  const [diff, setDiff] = useState<File[]>([])

  useEffect(() => {
    const fetchDiff = async () => {
      setIsLoading(true)
      setIsDone(false)
      console.log(
        `https://github.com/Scaffold-Stark/scaffold-stark-2/compare/${fromVersion}..${toVersion}.diff`
      )
      // const [response] = await Promise.all([
      //   fetch(
      //     `https://github.com/Scaffold-Stark/scaffold-stark-2/compare/${fromVersion}..${toVersion}.diff`,
      //     {
      //       headers: {
      //         // 'Access-Control-Allow-Origin': '*',
      //         'Content-Type': 'text/plain',
      //       },
      //     }
      //   ),
      //   delay(300),
      // ])

      const response_ = await fetch(
        `https://api.github.com/repos/Scaffold-Stark/scaffold-stark-2/compare/${fromVersion}...${toVersion}`
      )
      // console.log(response_)
      const json = await response_.json()
      console.log(json)
      let diff_buf = ''
      json.files.forEach(async (file: any) => {
        if (file.status === 'added') {
          diff_buf += `diff --git a/${file.filename} b/${file.filename}\n`
          diff_buf += `index ${file.sha}\n`
          diff_buf += '--- /dev/null\n'
          diff_buf += `+++ b/${file.filename}\n`
          diff_buf += file.patch + '\n'
        } else if (file.status === 'modified') {
          diff_buf += `diff --git a/${file.filename} b/${file.filename}\n`
          diff_buf += `index ${file.sha}\n`
          diff_buf += `--- a/${file.filename}\n`
          diff_buf += `+++ b/${file.filename}\n`
          diff_buf += file.patch + '\n'
        } else if (file.status === 'removed') {
          diff_buf += `diff --git a/${file.filename} b/${file.filename}\n`
          diff_buf += `index ${file.sha}\n`
          diff_buf += `--- a/${file.filename}\n`
          diff_buf += `+++ /dev/null\n`
          diff_buf += file.patch + '\n'
        } else if (file.status === 'renamed') {
          // console.log('========= renamed', file)
          // const content = await fetch(file.contents_url)
          // const content_json = await content.json()
          // console.log(atob(content_json.content))
          // console.log(
          //   atob(content_json.content)
          //     .split('\n')
          //     .map((line) => `-${line}`)
          //     .join('\n')
          // )
          // diff_buf += `diff --git a/${file.previous_filename} b/${file.previous_filename}\n`
          // diff_buf += `index ${file.sha}0\n`
          // diff_buf += `--- a/${file.previous_filename}\n`
          // diff_buf += `+++ /dev/null\n`
          // diff_buf += `@@ -0,0 +0,0 @@\n`
          // diff_buf +=
          //   atob(content_json.content)
          //     .split('\n')
          //     .map((line) => `-${line}`)
          //     .join('\n') + '\n'
          // diff_buf += `diff --git a/${file.previous_filename} b/${file.filename}\n`
          // diff_buf += `rename from ${file.previous_filename}\n`
          // diff_buf += `rename to ${file.previous_filename}\n`
          diff_buf += `diff --git a/${file.previous_filename} b/${file.filename}
rename from ${file.previous_filename}
rename to ${file.filename}\n`
        }
      })

      setDiff(movePackageJsonToTop(parseDiff(diff_buf)))

      setIsLoading(false)
      setIsDone(true)

      return
    }

    if (shouldShowDiff) {
      fetchDiff()
    }
  }, [shouldShowDiff, packageName, language, fromVersion, toVersion])

  return {
    isLoading,
    isDone,
    diff,
  }
}
