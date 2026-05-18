import { Field, ID, ObjectType } from 'type-graphql'

export type AuthOutputWithoutPassword = Omit<AuthOutput, 'password'>

@ObjectType()
export class AuthOutput {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string
}
