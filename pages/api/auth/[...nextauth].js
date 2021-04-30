import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { verifyPassword } from 'utilities/auth';
import { connectDatabase } from 'utilities/MongoDb';

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    Providers.Credentials({
      async authorize({ email, password }) {
        const client = await connectDatabase();

        const usersCollection = client.db().collection('users');

        const user = await usersCollection.findOne({ email: email });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          client.close();
          throw new Error('Password is not correct!');
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
});
