import { Field, InputType } from 'type-graphql'

@InputType()
export class AuthInput {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  email!: string

  @Field(() => String)
  password!: string
}
