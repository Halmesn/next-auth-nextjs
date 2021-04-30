import { getSession } from 'next-auth/client';
import { hashPassword, verifyPassword } from 'utilities/auth';

import { connectDatabase } from 'utilities/MongoDb';

async function handler(req, res) {
  if (req.method !== 'PATCH') return;

  const session = await getSession({ req: req });
  const userEmail = session.user.email;

  if (!session) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { oldPassword, newPassword } = req.body;
  if (oldPassword === newPassword) {
    res.status(422).json({
      message: 'Your new password should not be the same as your old one',
    });
    return;
  }

  const newHashedPassword = await hashPassword(newPassword);

  let client;

  try {
    client = await connectDatabase();
  } catch (error) {
    res.status(500).json({ message: 'Connection to database failed' });
    return;
  }

  const user = await client
    .db()
    .collection('users')
    .findOne({ email: userEmail });

  const isValid = await verifyPassword(oldPassword, user.password);

  if (!isValid) {
    res.status(403).json({ message: 'Your password does not match' });
    client.close();
    return;
  }

  try {
    await client
      .db()
      .collection('users')
      .updateOne(
        { email: userEmail },
        { $set: { password: newHashedPassword } }
      );
    res.status(201).json({ message: 'Successfully changed your password!' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong, change password failed' });
  }

  client.close();
}

export default handler;
