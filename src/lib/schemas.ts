import { z } from 'zod'

// --- Branded UUID ---

export const UuidSchema = z.string().uuid()

// --- Subtask ---

export const SubtaskSchema = z.object({
  id: UuidSchema,
  title: z.string(),
  completed: z.boolean(),
  order: z.number().optional(),
  estimation: z.number().optional(),
})

// --- Comment ---

export const CommentSchema = z.object({
  id: UuidSchema,
  content: z.string(),
  createdAt: z.string(),
  userId: UuidSchema,
})

// --- Task ---

export const PrioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
])

export const RecurringModeSchema = z.union([
  z.literal('dueDate'),
  z.literal('completedAt'),
  z.literal('autoRollover'),
])

export const TaskSchema = z.object({
  id: UuidSchema,
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  archived: z.boolean().optional(),
  priority: PrioritySchema,
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  projectId: UuidSchema.optional(),
  ownerId: UuidSchema.optional(),
  assignees: z.array(UuidSchema).optional(),
  labels: z.array(UuidSchema),
  subtasks: z.array(SubtaskSchema),
  comments: z.array(CommentSchema),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  recurring: z.string().optional(),
  recurringMode: RecurringModeSchema,
  estimation: z.number().optional(),
  trackingId: UuidSchema.optional(),
})

// --- Section ---

export const SectionSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  type: z.literal('section'),
  items: z.array(UuidSchema),
  isDefault: z.boolean().optional(),
})

// --- Project ---

export const ProjectSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  color: z.string(),
  sections: z.array(SectionSchema).min(1),
})

// --- Label ---

export const LabelSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  color: z.string(),
})

// --- API Response Meta ---

export const MetaSchema = z.object({
  count: z.number(),
  timestamp: z.string(),
  version: z.string(),
})

// --- List Responses ---

export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  meta: MetaSchema,
})

export const ProjectListResponseSchema = z.object({
  projects: z.array(ProjectSchema),
  meta: MetaSchema,
})

export const LabelListResponseSchema = z.object({
  labels: z.array(LabelSchema),
  meta: MetaSchema,
})

// --- Mutation Responses ---

export const TaskMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  taskIds: z.array(UuidSchema),
})

export const ProjectMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  projectIds: z.array(UuidSchema),
})

// --- API Error ---

export const ApiErrorSchema = z.object({
  code: z.string(),
  error: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  filePath: z.string().optional(),
})

// --- Create / Update Inputs ---

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  archived: z.boolean().optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  projectId: UuidSchema.optional(),
  ownerId: UuidSchema.optional(),
  assignees: z.array(UuidSchema).optional(),
  labels: z.array(UuidSchema).optional(),
  subtasks: z.array(SubtaskSchema).optional(),
  comments: z.array(CommentSchema).optional(),
  recurring: z.string().optional(),
  recurringMode: RecurringModeSchema.optional(),
  estimation: z.number().optional(),
  trackingId: UuidSchema.optional(),
  sectionId: UuidSchema.optional(),
})

export const UpdateTaskInputSchema = z.object({
  id: UuidSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  projectId: UuidSchema.optional(),
  labels: z.array(UuidSchema).optional(),
  subtasks: z.array(SubtaskSchema).optional(),
  comments: z.array(CommentSchema).optional(),
  recurring: z.string().optional(),
  recurringMode: RecurringModeSchema.optional(),
  estimation: z.number().optional(),
  trackingId: UuidSchema.optional(),
  sectionId: UuidSchema.optional(),
})
