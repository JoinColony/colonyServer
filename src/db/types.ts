import {
  OnlyFieldsOfType,
  PullAllOperator,
  PullOperator,
  PushOperator,
  RootQuerySelector,
  SetFields,
} from 'mongodb'

// Stricter than RootQuerySelector (only allows fields from T),
// but doesn't allow dot-notation fields.
export type StrictRootQuerySelector<T> = Partial<T> &
  Pick<
    RootQuerySelector<T>,
    '$and' | '$nor' | '$or' | '$text' | '$where' | '$comment'
  >

// Stricter than UpdateQuery (only allows fields from T),
// but doesn't allow dot-notation fields
export interface StrictUpdateQuery<T> {
  $currentDate?: OnlyFieldsOfType<
    T,
    Date,
    true | { $type: 'date' | 'timestamp' }
  >
  $inc?: OnlyFieldsOfType<T, number>
  $min?: Partial<T>
  $max?: Partial<T>
  $mul?: OnlyFieldsOfType<T, number>
  $rename?: { [key: string]: string }
  $set?: Partial<T>
  $setOnInsert?: Partial<T>
  $unset?: OnlyFieldsOfType<T, any, ''>
  $addToSet?: SetFields<T>
  $pop?: OnlyFieldsOfType<T, any[], 1 | -1>
  $pull?: PullOperator<T>
  $push?: PushOperator<T>
  $pullAll?: PullAllOperator<T>
  $bit?: {
    [key: string]: { [key in 'and' | 'or' | 'xor']?: number }
  }
}
