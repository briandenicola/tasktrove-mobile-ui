import type { z } from 'zod'
import type {
  TaskSchema,
  ProjectSchema,
  LabelSchema,
  SubtaskSchema,
  CommentSchema,
  SectionSchema,
  MetaSchema,
  ApiErrorSchema,
  TaskListResponseSchema,
  ProjectListResponseSchema,
  LabelListResponseSchema,
  TaskMutationResponseSchema,
  ProjectMutationResponseSchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  PrioritySchema,
  RecurringModeSchema,
} from './schemas'

// --- Branded ID types ---

export type TaskId = string & { readonly __brand: 'TaskId' }
export type ProjectId = string & { readonly __brand: 'ProjectId' }
export type LabelId = string & { readonly __brand: 'LabelId' }
export type SubtaskId = string & { readonly __brand: 'SubtaskId' }
export type CommentId = string & { readonly __brand: 'CommentId' }
export type SectionId = string & { readonly __brand: 'SectionId' }

// --- Inferred types from Zod schemas ---

export type Task = z.infer<typeof TaskSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Label = z.infer<typeof LabelSchema>
export type Subtask = z.infer<typeof SubtaskSchema>
export type Comment = z.infer<typeof CommentSchema>
export type Section = z.infer<typeof SectionSchema>
export type Meta = z.infer<typeof MetaSchema>
export type ApiError = z.infer<typeof ApiErrorSchema>
export type Priority = z.infer<typeof PrioritySchema>
export type RecurringMode = z.infer<typeof RecurringModeSchema>

// --- API response types ---

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>
export type LabelListResponse = z.infer<typeof LabelListResponseSchema>
export type TaskMutationResponse = z.infer<typeof TaskMutationResponseSchema>
export type ProjectMutationResponse = z.infer<typeof ProjectMutationResponseSchema>

// --- Input types ---

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>

// --- Date group for task list ---

export type DateGroup = 'overdue' | 'today' | 'upcoming' | 'no-date'

export interface TaskGroup {
  key: DateGroup
  label: string
  tasks: Task[]
}
