export interface ModuleField {
  name: string;
  type: 'string' | 'text' | 'boolean';
  required?: boolean;
  unique?: boolean;
}

export interface ModuleDefinition {
  name: string;
  pascal: string;
  plural: string;
  fields: ModuleField[];
}

export interface ModuleGeneratorOptions {
  module: ModuleDefinition;
  orm: 'drizzle' | 'mongoose';
}

function toSnakeCase(s: string): string {
  return s.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
}

function toPascal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Controller ─────────────────────────────────────

function generateController(module: ModuleDefinition): string {
  const { name, pascal, plural } = module;
  return `import { Request, Response } from 'express';
import { ${pascal}Service } from './${name}.service.js';

export class ${pascal}Controller {
  constructor(private ${name}Service: ${pascal}Service) {}

  async findAll(_req: Request, res: Response): Promise<void> {
    const items = await this.${name}Service.findAll();
    res.json({ data: items });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const item = await this.${name}Service.findById(id);
    if (!item) {
      res.status(404).json({ message: '${pascal} not found' });
      return;
    }
    res.json({ data: item });
  }

  async create(req: Request, res: Response): Promise<void> {
    const item = await this.${name}Service.create(req.body);
    res.status(201).json({ data: item });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const item = await this.${name}Service.update(id, req.body);
    if (!item) {
      res.status(404).json({ message: '${pascal} not found' });
      return;
    }
    res.json({ data: item });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.${name}Service.delete(id);
    res.status(204).send();
  }
}
`;
}

// ─── Service ────────────────────────────────────────

function generateService(module: ModuleDefinition): string {
  const { name, pascal } = module;
  return `import { ${pascal}Repository } from './${name}.repository.js';

export class ${pascal}Service {
  constructor(private ${name}Repository: ${pascal}Repository) {}

  async findAll() {
    return this.${name}Repository.findAll();
  }

  async findById(id: string) {
    return this.${name}Repository.findById(id);
  }

  async create(data: Record<string, unknown>) {
    return this.${name}Repository.create(data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.${name}Repository.update(id, data);
  }

  async delete(id: string) {
    return this.${name}Repository.delete(id);
  }
}
`;
}

// ─── Routes ─────────────────────────────────────────

function generateRoutes(module: ModuleDefinition): string {
  const { name, pascal, plural } = module;
  const requiredFields = module.fields.filter((f) => f.required);
  const firstField = module.fields[0];

  return `import { Router } from 'express';
import { ${pascal}Controller } from './${name}.controller.js';
import { ${pascal}Service } from './${name}.service.js';
import { ${pascal}Repository } from './${name}.repository.js';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';

const router = Router();
const repository = new ${pascal}Repository();
const service = new ${pascal}Service(repository);
const controller = new ${pascal}Controller(service);

/**
 * @openapi
 * /api/v1/${plural}:
 *   get:
 *     tags: [${pascal}s]
 *     summary: List all ${plural}
 *     responses:
 *       200:
 *         description: Array of ${plural}
 */
router.get('/', asyncHandler(controller.findAll.bind(controller)));

/**
 * @openapi
 * /api/v1/${plural}/{id}:
 *   get:
 *     tags: [${pascal}s]
 *     summary: Get ${pascal} by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${pascal} object
 */
router.get('/:id', asyncHandler(controller.findById.bind(controller)));

/**
 * @openapi
 * /api/v1/${plural}:
 *   post:
 *     tags: [${pascal}s]
 *     summary: Create a new ${pascal}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [${requiredFields.map((f) => `'${f.name}'`).join(', ')}]
 *             properties:
 *               ${firstField ? `${firstField.name}:\n *                 type: ${firstField.type === 'boolean' ? 'boolean' : 'string'}` : ''}
 *     responses:
 *       201:
 *         description: Created ${pascal}
 */
router.post('/', asyncHandler(controller.create.bind(controller)));

router.put('/:id', asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export { router as ${name}Router };
`;
}

// ─── Drizzle Repository ─────────────────────────────

function drizzleFieldType(field: ModuleField): string {
  const snake = toSnakeCase(field.name);
  switch (field.type) {
    case 'string':
      return `varchar('${snake}', { length: 255 })`;
    case 'text':
      return `text('${snake}')`;
    case 'boolean':
      return `boolean('${snake}').default(false)`;
    default:
      return `varchar('${snake}', { length: 255 })`;
  }
}

function drizzleFieldConstraints(field: ModuleField): string {
  let result = '';
  if (field.required) result += '.notNull()';
  if (field.unique) result += '.unique()';
  return result;
}

function drizzleImportTypes(module: ModuleDefinition): string {
  return `${module.pascal}, New${module.pascal}`;
}

function generateDrizzleSchema(module: ModuleDefinition): string {
  const { name, pascal, plural, fields } = module;
  const imports = ['pgTable', 'serial', 'timestamp'];
  if (fields.some((f) => f.type === 'string')) imports.push('varchar');
  if (fields.some((f) => f.type === 'text')) imports.push('text');
  if (fields.some((f) => f.type === 'boolean')) imports.push('boolean');

  const fieldLines = fields
    .map((f) => `  ${f.name}: ${drizzleFieldType(f)}${drizzleFieldConstraints(f)},`)
    .join('\n');

  return `import { ${imports.join(', ')} } from 'drizzle-orm/pg-core';

export const ${plural} = pgTable('${plural}', {
  id: serial('id').primaryKey(),
${fieldLines}
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ${pascal} = typeof ${plural}.$inferSelect;
export type New${pascal} = typeof ${plural}.$inferInsert;
`;
}

function generateDrizzleRepository(module: ModuleDefinition): string {
  const { name, pascal, plural } = module;
  const fields = module.fields;

  const updateFields = fields
    .filter((f) => f.name !== 'id')
    .map((f) => `${f.name}: data.${f.name}`)
    .join(',\n      ');

  return `import { db } from '../../shared/database/index.js';
import { ${plural} } from './${name}.schema.js';
import { ${drizzleImportTypes(module)} } from './${name}.schema.js';
import { eq } from 'drizzle-orm';
export class ${pascal}Repository {
  async findAll(): Promise<${pascal}[]> {
    return db.select().from(${plural}).orderBy(${plural}.createdAt);
  }

  async findById(id: string): Promise<${pascal} | undefined> {
    const [result] = await db.select().from(${plural}).where(eq(${plural}.id, parseInt(id)));
    return result;
  }

  async create(data: New${pascal}): Promise<${pascal}> {
    const [result] = await db.insert(${plural}).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<New${pascal}>): Promise<${pascal} | undefined> {
    const [result] = await db
      .update(${plural})
      .set({ ...data, updatedAt: new Date() })
      .where(eq(${plural}.id, parseInt(id)))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await db.delete(${plural}).where(eq(${plural}.id, parseInt(id)));
  }
}
`;
}

// ─── Mongoose Model ─────────────────────────────────

function mongooseFieldDef(field: ModuleField): string {
  const parts: string[] = [];
  switch (field.type) {
    case 'string':
      parts.push('type: String');
      if (field.required) parts.push('required: true');
      parts.push('trim: true');
      if (field.unique) parts.push('unique: true');
      break;
    case 'text':
      parts.push('type: String');
      if (field.required) parts.push('required: true');
      parts.push('trim: true');
      break;
    case 'boolean':
      parts.push('type: Boolean');
      parts.push('default: false');
      break;
  }
  return `  ${field.name}: { ${parts.join(', ')} }`;
}

function generateMongooseModel(module: ModuleDefinition): string {
  const { name, pascal, fields } = module;
  const fieldDefs = fields.map(mongooseFieldDef).join(',\n');

  return `import mongoose, { Schema, Document } from 'mongoose';

export interface I${pascal} extends Document {
  ${fields.map((f) => `${f.name}${f.required ? '' : '?'}: ${f.type === 'boolean' ? 'boolean' : 'string'};`).join('\n  ')}
  createdAt: Date;
  updatedAt: Date;
}

const ${name}Schema = new Schema<I${pascal}>(
  {
${fieldDefs},
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ${pascal} = mongoose.model<I${pascal}>('${pascal}', ${name}Schema);
`;
}

function generateMongooseRepository(module: ModuleDefinition): string {
  const { name, pascal } = module;
  return `import { ${pascal} } from './${name}.model.js';
export class ${pascal}Repository {
  async findAll() {
    return ${pascal}.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string) {
    return ${pascal}.findById(id).lean();
  }

  async create(data: Record<string, unknown>) {
    return ${pascal}.create(data);
  }

  async update(id: string, data: Record<string, unknown>) {
    return ${pascal}.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    await ${pascal}.findByIdAndDelete(id);
  }
}
`;
}

// ─── Public API ─────────────────────────────────────

export interface FileEntry {
  path: string;
  content: string;
}

export function generateModuleFiles(opts: ModuleGeneratorOptions): FileEntry[] {
  const { module, orm } = opts;
  const prefix = `backend/src/modules/${module.name}`;
  const files: FileEntry[] = [];

  files.push(
    { path: `${prefix}/${module.name}.controller.ts`, content: generateController(module) },
    { path: `${prefix}/${module.name}.service.ts`, content: generateService(module) },
    { path: `${prefix}/${module.name}.routes.ts`, content: generateRoutes(module) },
  );

  if (orm === 'drizzle') {
    files.push(
      { path: `${prefix}/${module.name}.schema.ts`, content: generateDrizzleSchema(module) },
      { path: `${prefix}/${module.name}.repository.ts`, content: generateDrizzleRepository(module) },
    );
  } else {
    files.push(
      { path: `${prefix}/${module.name}.model.ts`, content: generateMongooseModel(module) },
      { path: `${prefix}/${module.name}.repository.ts`, content: generateMongooseRepository(module) },
    );
  }

  return files;
}

// ─── Built-in module definitions ────────────────────

export const USER_MODULE: ModuleDefinition = {
  name: 'user',
  pascal: 'User',
  plural: 'users',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true, unique: true },
    { name: 'bio', type: 'text' },
    { name: 'avatarUrl', type: 'string' },
    { name: 'isActive', type: 'boolean' },
  ],
};
