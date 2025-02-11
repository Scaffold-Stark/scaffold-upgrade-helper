import { useEffect, useState } from 'react'

export const useFetchReleaseVersions = ({
  packageName,
}: {
  packageName: string
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDone, setIsDone] = useState<boolean>(false)
  const [releaseVersions, setReleaseVersions] = useState<string[]>([])

  useEffect(() => {
    const fetchReleaseVersions = async () => {
      setIsLoading(true)
      setIsDone(false)
      const tagsResponse = await fetch(
        'https://api.github.com/repos/Scaffold-Stark/scaffold-stark-2/tags'
      )
      const tags = await tagsResponse.json()
      const releaseVersions = tags.map((tag: any) => tag.name)

      setReleaseVersions(releaseVersions)

      setIsLoading(false)
      setIsDone(true)

      return
    }

    fetchReleaseVersions()
  }, [packageName])

  return {
    isLoading,
    isDone,
    releaseVersions,
  }
}
