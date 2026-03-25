export interface DepartmentVisibilityInput {
  department_name?: string | null
  department_code?: string | null
}

const INTERNAL_DEPARTMENT_NAMES = new Set([
  'administration',
  'system administration',
  'program management',
])

export function isInternalDepartment(department: DepartmentVisibilityInput): boolean {
  const name = (department.department_name ?? '').trim().toLowerCase()
  const code = (department.department_code ?? '').trim().toUpperCase()

  if (INTERNAL_DEPARTMENT_NAMES.has(name)) return true
  if (code === 'ADMIN') return true

  return false
}

export function filterVisibleDepartments<T extends DepartmentVisibilityInput>(departments: T[]): T[] {
  return departments.filter((department) => !isInternalDepartment(department))
}
