import {
  Client,
  Paginate,
  Documents,
  Collection,
  Lambda,
  Get,
  Var,
  Map,
  Match,
  Index,
  Create,
  Update,
  Select,
} from 'faunadb'
import assert from 'assert'

import { UserDoc } from '../db/types'

enum Collections {
  Users = 'users',
}

enum Indexes {
  UsersByUsername = 'users_by_username',
  UsersByAddress = 'users_by_walletAddress',
}

export class FaunaApi {
  private readonly instance: Client

  constructor(clientInstance: Client) {
    this.instance = clientInstance
  }

  async tryGetUser(walletAddress: string, assertive: boolean = true) {
    const {
      data: user,
    }: { data: Record<string, any> } = await this.instance.query(
      Get(Match(Index(Indexes.UsersByAddress), walletAddress)),
    )
    // const user = await this.users.findOne({ walletAddress })
    if (assertive) {
      assert.ok(!!user, `User with address '${walletAddress}' not found`)
    }
    return user
  }

  async createUser(walletAddress: string, username: string) {
    const data = { username, walletAddress } as UserDoc

    let exists
    try {
      exists = !!(await this.tryGetUser(walletAddress, false))
    } catch (error) {
      //
    }
    if (exists) {
      throw new Error(
        `User with address '${walletAddress}' or username '${username}' already exists`,
      )
    }

    const {
      data: user,
    }: { data: Record<string, any> } = await this.instance.query(
      Create(Collection(Collections.Users), {
        data,
      }),
    )
    return user
  }
}
