import { type Option, type PlayerProfile } from '../types'

function evaluateCondition(
  field: keyof PlayerProfile,
  check: string,
  value: string,
  profile: PlayerProfile
): boolean {
  const profileValue = profile[field]

  if (check === 'includes') {
    return Array.isArray(profileValue)
      ? profileValue.includes(value)
      : profileValue === value
  }
  if (check === 'notIncludes') {
    return Array.isArray(profileValue)
      ? !profileValue.includes(value)
      : profileValue !== value
  }
  if (check === 'equals') {
    return profileValue === value
  }
  return false
}

export function filterOptionsByProfile(options: Option[], profile: PlayerProfile): Option[] {
  const filtered: Option[] = []

  for (const option of options) {
    if (option.type !== 'DYNAMIC') {
      filtered.push(option)
      continue
    }

    if (!option.profileRequired) {
      if (option.resolvedType) {
        filtered.push({ ...option, type: option.resolvedType })
      }
      continue
    }

    const { field, check, value } = option.profileRequired
    if (evaluateCondition(field, check, value, profile)) {
      filtered.push({
        ...option,
        type: option.resolvedType ?? 'SUBOPTIMAL',
      })
    }
    // If condition not met, option is simply omitted
  }

  // Safety: ensure at least 2 options
  if (filtered.length < 2) {
    const fallback = options.find(o => o.type === 'SUBOPTIMAL' || o.type === 'OPTIMAL')
    if (fallback && !filtered.find(o => o.id === fallback.id)) {
      filtered.push(fallback)
    }
  }

  return filtered
}
