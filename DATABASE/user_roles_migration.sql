USE showroomdb;

ALTER TABLE customers
    ADD COLUMN password_hash VARCHAR(255) NULL,
    ADD COLUMN user_type ENUM('customer', 'owner') NOT NULL DEFAULT 'customer';

-- After registering the owner account, promote it with:
-- UPDATE customers SET user_type = 'owner' WHERE email = 'owner@example.com';
