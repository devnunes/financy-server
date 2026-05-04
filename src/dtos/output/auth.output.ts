import { Field, ObjectType } from 'type-graphql'
import { UserModel } from '../../models/user.model'

@ObjectType()
export class SignUpOutput {
  @Field(() => String)
  token!: string

  @Field(() => String)
  refreshToken!: string

  @Field(() => UserModel)
  user!: UserModel
}

@ObjectType()
export class SignInOutput {
  @Field(() => UserModel)
  user!: UserModel
}
