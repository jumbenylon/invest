-- Seed first tenant: jumbenylon
-- Password: @Hkgg8886 (bcrypt hash, cost 12)
-- Generate fresh hash before running: node -e "const b=require('bcryptjs');b.hash('@Hkgg8886',12).then(h=>console.log(h))"

SET @user_id = UUID();

INSERT INTO users (id, email, password_hash, name, role, plan, subscription_expires_at)
VALUES (
  @user_id,
  'jumbenylon@gmail.com',
  '$2a$12$placeholder_replace_with_bcrypt_hash',
  'Jumbe Nylon',
  'user',
  'pro',
  NULL  -- pro forever, no expiry
);

-- Create default portfolio
INSERT INTO portfolios (id, user_id, name, currency, is_default)
VALUES (UUID(), @user_id, 'Main Portfolio', 'TZS', 1);

-- Note: Run scripts/migrate-neon.ts to populate actual transaction/investment data
