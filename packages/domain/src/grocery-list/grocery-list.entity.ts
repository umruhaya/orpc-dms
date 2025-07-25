import type { Result } from "@carbonteq/fp"
import { Result as R } from "@carbonteq/fp"
import type { UserType } from "@domain/user/user.entity"
import { BaseEntity, defineEntityStruct } from "@domain/utils/base.entity"
import { DateTime, UUID } from "@domain/utils/refined-types"
import { createEncoderDecoderBridge } from "@domain/utils/schema-utils"
import { Schema as S } from "effect"
import { GroceryListOwnershipError } from "./grocery-list.errors"

export const GroceryListId = UUID.pipe(S.brand("GroceryListId"))
export const GroceryListSchema = defineEntityStruct({
  id: GroceryListId,
  name: S.String.pipe(S.minLength(1)),
  description: S.String,
  active: S.Boolean,
  ownerId: UUID.pipe(S.brand("UserId")),
})

export const GroceryListCreateSchema = GroceryListSchema.pipe(
  S.pick("name", "description"),
)

export const GroceryListUpdateSchema = S.partialWith(
  GroceryListSchema.pipe(S.pick("name", "description", "active")),
  { exact: true },
)

export type GroceryListType = S.Schema.Type<typeof GroceryListSchema>
export type GroceryListUpdateData = S.Schema.Type<
  typeof GroceryListUpdateSchema
>
export type GroceryListCreateData = S.Schema.Type<
  typeof GroceryListCreateSchema
>

const bridge = createEncoderDecoderBridge(GroceryListSchema)

export class GroceryListEntity extends BaseEntity implements GroceryListType {
  override readonly id: GroceryListType["id"]

  readonly name: string
  readonly active: boolean
  readonly description: GroceryListType["description"]
  readonly ownerId: GroceryListType["ownerId"]

  private constructor(data: GroceryListType) {
    super(data)
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.ownerId = data.ownerId
    this.active = data.active
  }

  static create(
    data: GroceryListCreateData,
    owner: UserType,
  ): GroceryListEntity {
    const groceryListData: GroceryListType = {
      id: GroceryListId.make(UUID.new()),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      name: data.name,
      active: false,
      description: data.description,
      ownerId: owner.id,
    }

    return new GroceryListEntity(groceryListData)
  }

  static from(data: GroceryListType): GroceryListEntity {
    return new GroceryListEntity(data)
  }

  static fromEncoded(data: S.Schema.Encoded<typeof GroceryListSchema>) {
    return bridge.deserialize(data).map((d) => new GroceryListEntity(d))
  }

  isOwner(userId: UserType["id"]): boolean {
    return this.ownerId === userId
  }

  ensureIsOwner(user: UserType): Result<void, GroceryListOwnershipError> {
    if (!this.isOwner(user.id)) {
      return R.Err(new GroceryListOwnershipError(this.id))
    }
    return R.Ok(undefined)
  }

  serialize() {
    return bridge.serialize(this)
  }
}
