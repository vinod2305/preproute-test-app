// The API returns subject/topic/sub-topic display NAMES on reads but expects
// UUIDs on writes. These helpers map names back to ids when editing a test.

interface NamedEntity {
  id: string
  name: string
}

export function idsFromNames(names: string[] | null, entities: NamedEntity[]): string[] {
  if (!names) return []
  const byName = new Map(entities.map((e) => [e.name, e.id]))
  return names.map((n) => byName.get(n)).filter((id): id is string => Boolean(id))
}

export function toOptions(entities: NamedEntity[]) {
  return entities.map((e) => ({ value: e.id, label: e.name }))
}
