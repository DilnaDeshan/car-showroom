USE showroomdb;

ALTER TABLE vehicles
    ADD COLUMN image VARCHAR(255) NOT NULL DEFAULT 'statics/image/backgroundimage-car.jpg',
    ADD COLUMN status ENUM('In Stock', 'Sold') NOT NULL DEFAULT 'In Stock';
