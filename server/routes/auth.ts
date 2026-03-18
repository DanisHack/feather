import { Router } from 'express';

export const authRouter = Router();

// Clerk webhook handler
authRouter.post('/webhook', (req, res) => {
  const event = req.body;

  // TODO: verify Clerk webhook signature
  switch (event.type) {
    case 'user.created':
      // TODO: create user in database
      break;
    case 'user.updated':
      // TODO: update user in database
      break;
    case 'user.deleted':
      // TODO: soft delete user in database
      break;
  }

  res.json({ received: true });
});
