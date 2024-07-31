import { ID, Query } from 'node-appwrite';

import { users } from '../appwrite.config';

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined
      // user.name
    );
  } catch (error: any) {
    if (error && error?.code === 409) {
      // const documents = await users.list([Query.equal('email', [user.email])]);
      // return documents.users[0];
    }
    console.error('An error occurred while creating a new user:', error);
  }
};
