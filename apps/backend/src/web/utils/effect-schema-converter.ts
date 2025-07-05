import type { AnySchema } from "@orpc/contract"
import type {
  ConditionalSchemaConverter,
  JSONSchema as OrpcOpenAPIJSONSchema,
  SchemaConvertOptions,
} from "@orpc/openapi"
import type { OpenAPIV3_1 } from "@scalar/openapi-types"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Schema as S } from "effect"
import type { AST } from "effect/SchemaAST"

type SchemaObject = OpenAPIV3_1.SchemaObject

interface SchemaVisitContext {
  visited: Set<AST>
  depth: number
}

export function convertEffectSchemaToOpenAPI<In, Out>(
  schema: S.Schema<Out, In, never>,
): SchemaObject {
  const context: SchemaVisitContext = {
    visited: new Set(),
    depth: 0,
  }

  // For Transformation schemas (like DateTime), don't use encodedBoundSchema as it loses annotations
  // Instead, handle the transformation directly in convertAST
  return convertAST(schema.ast, context)
}

function convertAST(ast: AST, context: SchemaVisitContext): SchemaObject {
  // Prevent infinite recursion for circular references
  if (context.visited.has(ast)) {
    return { type: "object" } // Return a simple object reference
  }

  if (context.depth > 10) {
    throw new Error("Maximum schema depth exceeded")
  }

  context.visited.add(ast)
  context.depth++

  try {
    const result = convertASTNode(ast, context)

    // Add annotations if present
    const annotations = extractAnnotations(ast)
    if (annotations) {
      Object.assign(result, annotations)
    }

    return result
  } finally {
    context.visited.delete(ast)
    context.depth--
  }
}

function convertASTNode(ast: AST, context: SchemaVisitContext): SchemaObject {
  switch (ast._tag) {
    case "StringKeyword":
      return { type: "string" }
    case "NumberKeyword":
      return { type: "number" }
    case "BooleanKeyword":
      return { type: "boolean" }
    case "VoidKeyword":
      return { type: "null" }
    case "UndefinedKeyword":
      return {} as SchemaObject
    case "Literal":
      return convertLiteral(ast)
    case "TypeLiteral":
      return convertTypeLiteral(ast, context)
    case "TupleType":
      return convertTuple(ast, context)
    case "Union":
      return convertUnion(ast, context)
    case "Refinement":
      return convertRefinement(ast, context)
    case "Suspend":
      return convertSuspend(ast, context)
    case "Transformation":
      return convertTransformation(ast, context)
    case "Declaration":
      return convertDeclaration(ast, context)
    default:
      throw new Error(`Unsupported AST node type: ${ast._tag}`)
  }
}

function convertLiteral(ast: AST): SchemaObject {
  if (ast._tag !== "Literal") throw new Error("Expected Literal AST")

  const value = ast.literal

  // Special case for null
  if (value === null) {
    return { type: "null" }
  }

  if (typeof value === "string") {
    return { type: "string", enum: [value] }
  } else if (typeof value === "number") {
    return { type: "number", enum: [value] }
  } else if (typeof value === "boolean") {
    return { type: "boolean", enum: [value] }
  }

  return { const: value }
}

function convertTypeLiteral(
  ast: AST,
  context: SchemaVisitContext,
): SchemaObject {
  if (ast._tag !== "TypeLiteral") throw new Error("Expected TypeLiteral AST")

  const result: SchemaObject = {
    type: "object",
  }

  // Handle index signatures first (records)
  if (ast.indexSignatures && ast.indexSignatures.length > 0) {
    const indexSig = ast.indexSignatures[0]
    if (indexSig) {
      result.additionalProperties = convertAST(indexSig.type, context)
    }
  }

  // Handle object types with properties
  if (ast.propertySignatures && ast.propertySignatures.length > 0) {
    result.properties = {}
    result.required = []

    for (const prop of ast.propertySignatures) {
      const propName = String(prop.name)

      // Handle optional fields with Union types (Type | undefined)
      if (
        prop.isOptional &&
        prop.type._tag === "Union" &&
        prop.type.types.length === 2 &&
        prop.type.types.some((t: AST) => t._tag === "UndefinedKeyword")
      ) {
        // Extract the non-undefined type
        const nonUndefinedType = prop.type.types.find(
          (t: AST) => t._tag !== "UndefinedKeyword",
        )
        if (result.properties && nonUndefinedType) {
          result.properties[propName] = convertAST(nonUndefinedType, context)
        }
      } else {
        if (result.properties) {
          result.properties[propName] = convertAST(prop.type, context)
        }
      }

      if (!prop.isOptional && result.required) {
        result.required.push(propName)
      }
    }
  } else if (!ast.indexSignatures?.length) {
    // Empty objects still need properties and required arrays
    result.properties = {}
    result.required = []
  }

  return result
}

function convertTuple(ast: AST, context: SchemaVisitContext): SchemaObject {
  if (ast._tag !== "TupleType") throw new Error("Expected TupleType AST")

  // Handle S.Array() case: TupleType with empty elements and rest array
  if (
    ast.elements &&
    ast.elements.length === 0 &&
    ast.rest &&
    ast.rest.length === 1
  ) {
    // This is an array type (S.Array)
    const restItem = ast.rest[0]
    if (restItem) {
      const result: SchemaObject = {
        type: "array",
        items: convertAST(restItem.type, context),
      }

      // Extract constraints from annotations
      const jsonSchemaAnnotation = extractJSONSchemaAnnotation(ast)
      if (jsonSchemaAnnotation) {
        Object.assign(result, jsonSchemaAnnotation)
      }

      return result
    }
  }

  // Handle NonEmptyArray case: single element with rest
  if (
    ast.elements &&
    ast.elements.length === 1 &&
    ast.rest &&
    ast.rest.length === 1
  ) {
    const firstElement = ast.elements[0]
    const restElement = ast.rest[0]

    if (
      firstElement &&
      restElement &&
      firstElement.type._tag === restElement.type._tag
    ) {
      // This is NonEmptyArray - treat as simple array with minItems
      const result: SchemaObject = {
        type: "array",
        items: convertAST(firstElement.type, context),
        minItems: 1,
      }

      return result
    }
  }

  // Handle actual tuple types
  const result: SchemaObject = {
    type: "array",
  }

  if (ast.elements && ast.elements.length > 0) {
    // Fixed tuple with specific types at each position
    if (ast.elements.length === 1) {
      // Single element tuple - use items directly
      const firstElement = ast.elements[0]
      if (firstElement) {
        result.items = convertAST(firstElement.type, context)
      }
    } else {
      // Multiple elements - use items array for ordered types
      result.items = ast.elements.map((elem) => convertAST(elem.type, context))
    }

    const requiredCount = ast.elements.filter((elem) => !elem.isOptional).length
    const totalCount = ast.elements.length

    result.minItems = requiredCount
    if (!ast.rest || ast.rest.length === 0) {
      result.maxItems = totalCount
    }
  }

  if (ast.rest && ast.rest.length > 0) {
    // Additional items beyond the fixed tuple elements
    const firstRestElement = ast.rest[0]
    if (firstRestElement) {
      result.additionalItems = convertAST(firstRestElement.type, context)
    }
  }

  return result
}

function convertUnion(ast: AST, context: SchemaVisitContext): SchemaObject {
  if (ast._tag !== "Union") {
    throw new Error("Expected Union AST")
  }

  if (!ast.types || ast.types.length === 0) {
    throw new Error("Union AST must have types property")
  }

  // Special case: if all union members are literals of the same type, convert to enum
  const allLiterals = ast.types.every((type: AST) => type._tag === "Literal")
  if (allLiterals) {
    const values = ast.types.map((type: AST) => {
      if (type._tag !== "Literal") {
        throw new Error("Expected Literal AST")
      }
      return type.literal
    })
    const firstType = typeof values[0]
    const sameType = values.every((val: unknown) => typeof val === firstType)

    if (sameType) {
      return {
        type:
          firstType === "string"
            ? "string"
            : firstType === "number"
              ? "number"
              : "boolean",
        enum: values,
      }
    }
  }

  // Special case: single union member
  if (ast.types.length === 1) {
    return convertAST(ast.types[0], context)
  }

  // Special case: handle duplicate types (deduplicate them)
  const uniqueTypes = new Map<string, AST>()
  for (const type of ast.types) {
    const converted = convertAST(type, context)
    const key = JSON.stringify(converted)
    if (!uniqueTypes.has(key)) {
      uniqueTypes.set(key, type)
    }
  }

  // If after deduplication we have only one type, return it directly
  if (uniqueTypes.size === 1) {
    const singleType = Array.from(uniqueTypes.values())[0]
    if (singleType) {
      return convertAST(singleType, context)
    }
  }

  const oneOf = Array.from(uniqueTypes.values()).map((type: AST) =>
    convertAST(type, context),
  )

  const result: SchemaObject = { oneOf }

  // Check for discriminated union
  const discriminator = detectDiscriminatorFromAST(
    Array.from(uniqueTypes.values()),
  )
  if (discriminator) {
    result.discriminator = { propertyName: discriminator }
  }

  return result
}

function convertRefinement(
  ast: AST,
  context: SchemaVisitContext,
): SchemaObject {
  if (ast._tag !== "Refinement") {
    throw new Error("Expected Refinement AST")
  }

  // Start with the base type
  const result = convertAST(ast.from, context)

  // Extract and merge all JSONSchema annotations from the refinement chain
  const allConstraints = extractAllRefinementConstraints(ast)
  Object.assign(result, allConstraints)

  return result
}

function extractAllRefinementConstraints(ast: AST): Record<string, unknown> {
  if (ast._tag !== "Refinement") {
    return {}
  }

  const constraints: Record<string, unknown> = {}

  // Extract constraints from current refinement
  const jsonSchemaAnnotation = extractJSONSchemaAnnotation(ast)
  if (jsonSchemaAnnotation) {
    Object.assign(constraints, jsonSchemaAnnotation)
  }

  // If the 'from' is also a refinement, recursively extract its constraints
  if (ast.from && ast.from._tag === "Refinement") {
    const fromConstraints = extractAllRefinementConstraints(ast.from)
    Object.assign(constraints, fromConstraints)
  }

  return constraints
}

function convertSuspend(ast: AST, context: SchemaVisitContext): SchemaObject {
  if (ast._tag !== "Suspend") {
    throw new Error("Expected Suspend AST")
  }

  // For suspended schemas (lazy/recursive), we need to evaluate the function
  // This is a simplified approach - in practice, you might need more sophisticated handling
  try {
    const resolvedAST = ast.f()
    return convertAST(resolvedAST, context)
  } catch {
    // Fallback for circular references
    return { type: "object" }
  }
}

function convertTransformation(
  ast: AST,
  context: SchemaVisitContext,
): SchemaObject {
  if (ast._tag !== "Transformation") {
    throw new Error("Expected Transformation AST")
  }

  // For transformations, we want the "from" (encoded/input) side for OpenAPI docs
  const baseResult = ast.from
    ? convertAST(ast.from, context)
    : { type: "string" }

  // BUT we also want to preserve any custom annotations from the transformation itself
  const transformationAnnotations = extractAnnotations(ast)

  // Check if this is a DateTime transformation for special handling
  const isDateTime =
    ast.annotations &&
    (Object.getOwnPropertySymbols(ast.annotations).some(
      (sym) =>
        sym.toString().includes("DateTimeUtc") ||
        sym.toString().includes("DateTime"),
    ) ||
      transformationAnnotations?.title
        ?.toString()
        .toLowerCase()
        .includes("time") ||
      transformationAnnotations?.description
        ?.toString()
        .toLowerCase()
        .includes("time"))

  if (isDateTime && baseResult.type === "number") {
    // Override with DateTime-specific formatting for number types
    const result = baseResult as SchemaObject & {
      format?: string
      description?: string
    }
    result.format = "timestamp"
    if (
      !transformationAnnotations?.description ||
      isAutoGeneratedDescription(transformationAnnotations.description)
    ) {
      result.description = "Unix timestamp in milliseconds"
    }
  }

  // Apply transformation-level annotations (these are the custom ones we want to preserve)
  if (transformationAnnotations) {
    Object.assign(baseResult, transformationAnnotations)
  }

  return baseResult as SchemaObject
}

function convertDeclaration(
  ast: AST,
  context: SchemaVisitContext,
): SchemaObject {
  if (ast._tag !== "Declaration") {
    throw new Error("Expected Declaration AST")
  }

  // Check if this is a DateTime declaration by looking at annotations
  const annotations = extractAnnotations(ast)
  const isDateTime =
    annotations?.title?.toString().toLowerCase().includes("time") ||
    annotations?.description?.toString().toLowerCase().includes("time") ||
    (ast.annotations &&
      Object.getOwnPropertySymbols(ast.annotations).some(
        (sym) =>
          sym.toString().includes("DateTimeUtc") ||
          sym.toString().includes("DateTime"),
      ))

  if (isDateTime) {
    // Return number type for timestamp representation
    const result: SchemaObject = {
      type: "number",
      format: "timestamp",
      description: "Unix timestamp in milliseconds",
    }

    // Extract custom JSONSchema annotations
    const jsonSchemaAnnotation = extractJSONSchemaAnnotation(ast)
    if (jsonSchemaAnnotation) {
      Object.assign(result, jsonSchemaAnnotation)
    }

    // Extract other annotations but preserve DateTime-specific formatting
    if (annotations) {
      const { title, description, examples, ...rest } = annotations
      Object.assign(result, rest)

      // Only use custom title/description if they're not auto-generated
      if (title && !isAutoGeneratedTitle(title)) {
        result.title = title as string
      }
      if (description && !isAutoGeneratedDescription(description)) {
        result.description = description as string
      }
      if (examples) {
        result.examples = examples
      }
    }

    return result
  }

  // For other declarations, try to extract from type information
  if (
    ast.typeParameters &&
    ast.typeParameters.length > 0 &&
    ast.typeParameters[0]
  ) {
    return convertAST(ast.typeParameters[0], context)
  }

  // Default fallback
  return { type: "string" }
}

function extractJSONSchemaAnnotation(ast: AST): Record<string, unknown> | null {
  if (!ast.annotations) return null

  // Look for JSONSchema annotation symbol
  const symbols = Object.getOwnPropertySymbols(ast.annotations)
  for (const symbol of symbols) {
    const keyStr = symbol.toString()
    if (keyStr.includes("JSONSchema")) {
      const value = ast.annotations[symbol]
      if (typeof value === "object" && value !== null) {
        // Convert OpenAPI 3.1 style exclusive bounds to OpenAPI 3.0 style
        const result = { ...value } as Record<string, unknown>

        if (typeof result.exclusiveMinimum === "number") {
          const min = result.exclusiveMinimum
          delete result.exclusiveMinimum
          result.minimum = min
          result.exclusiveMinimum = true
        }

        if (typeof result.exclusiveMaximum === "number") {
          const max = result.exclusiveMaximum
          delete result.exclusiveMaximum
          result.maximum = max
          result.exclusiveMaximum = true
        }

        return result as Record<string, unknown>
      }
    }
  }

  return null
}

function extractAnnotations(ast: AST): Partial<SchemaObject> | null {
  if (!ast.annotations) return null

  const result: Partial<SchemaObject> = {}

  // Check both string keys and symbol keys
  const allKeys = [
    ...Object.keys(ast.annotations),
    ...Object.getOwnPropertySymbols(ast.annotations),
  ]

  for (const key of allKeys) {
    const keyStr = key.toString()
    const value = ast.annotations[key]

    if (keyStr.includes("Title")) {
      if (value != null && !isAutoGeneratedTitle(value)) {
        result.title = value as string
      }
    } else if (keyStr.includes("Description")) {
      if (value != null && !isAutoGeneratedDescription(value)) {
        result.description = value as string
      }
    } else if (keyStr.includes("Examples")) {
      if (value != null) {
        result.examples = value as unknown[]
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

function isAutoGeneratedTitle(value: unknown): boolean {
  if (typeof value !== "string") return false

  const autoTitles = [
    "string",
    "number",
    "boolean",
    "undefined",
    "null",
    "nonEmptyString",
    "int",
    "greaterThan",
    "lessThan",
    "greaterThanOrEqualTo",
    "lessThanOrEqualTo",
    "minLength",
    "maxLength",
    "pattern",
    "multipleOf",
    "between",
    "nonNegative",
    "positive",
    "minItems",
    "maxItems",
    "itemsCount",
  ]

  // Check for exact matches first
  if (autoTitles.includes(value)) {
    return true
  }

  // Check for function call patterns, but be more specific
  const functionCallPatterns = [
    /^(greaterThan|lessThan|greaterThanOrEqualTo|lessThanOrEqualTo|minLength|maxLength|minItems|maxItems|itemsCount|pattern|multipleOf|between)\(\d+\)$/,
    /^(nonNegative|positive)\(\)$/,
  ]

  return functionCallPatterns.some((pattern) => pattern.test(value))
}

function isAutoGeneratedDescription(value: unknown): boolean {
  if (typeof value !== "string") return false

  // Auto-generated descriptions typically start with these patterns
  const autoDescriptionPatterns = [
    /^a string$/,
    /^a number$/,
    /^a boolean$/,
    /^an integer$/,
    /character\(s\)$/,
    /^divisible by/,
    /^less than/,
    /^greater than/,
    /^between/,
    /^non-negative/,
    /^positive/,
    /^non empty/,
    /^matching the pattern/,
    /^a positive number$/,
    /^a number less than/,
    /^a number greater than/,
    /^an array of at least/,
    /^an array of at most/,
    /^an array of exactly/,
  ]

  return autoDescriptionPatterns.some((pattern) => pattern.test(value))
}

function detectDiscriminatorFromAST(types: AST[]): string | null {
  if (types.length < 2) return null

  // Check if all types are TypeLiterals with a common literal property
  const objectTypes = types.filter(
    (t) => t._tag === "TypeLiteral" && t.propertySignatures,
  )
  if (objectTypes.length !== types.length) return null

  // Get the first object's property signatures to compare
  const firstType = objectTypes[0]
  if (firstType?._tag !== "TypeLiteral" || !firstType.propertySignatures) {
    return null
  }

  // Find common properties that are literals
  const firstProps = firstType.propertySignatures.map((p) => String(p.name))

  for (const propName of firstProps) {
    const allHaveProp = objectTypes.every((type) => {
      if (type._tag !== "TypeLiteral" || !type.propertySignatures) {
        return false
      }
      return type.propertySignatures.some(
        (p) => String(p.name) === propName && p.type._tag === "Literal",
      )
    })

    if (allHaveProp) {
      const values = objectTypes
        .map((type) => {
          if (type._tag !== "TypeLiteral" || !type.propertySignatures) {
            return null
          }
          const prop = type.propertySignatures.find(
            (p) => String(p.name) === propName,
          )
          if (prop?.type._tag === "Literal") {
            return prop.type.literal
          }
          return null
        })
        .filter((v) => v !== null)

      const uniqueValues = new Set(values)

      if (
        uniqueValues.size === values.length &&
        values.length === objectTypes.length
      ) {
        return propName
      }
    }
  }

  return null
}

export class EffectSchemaConverter implements ConditionalSchemaConverter {
  condition(schema: AnySchema): boolean {
    return schema !== undefined && schema["~standard"].vendor === "effect"
  }

  convert(
    schema: AnySchema | undefined,
    _options: SchemaConvertOptions,
  ): [required: boolean, jsonSchema: OrpcOpenAPIJSONSchema] {
    const simplifiedSchema = schema as StandardSchemaV1 &
      S.Schema<unknown, unknown, never>

    const result = convertEffectSchemaToOpenAPI(simplifiedSchema)

    return [true, result as OrpcOpenAPIJSONSchema]
  }
}
