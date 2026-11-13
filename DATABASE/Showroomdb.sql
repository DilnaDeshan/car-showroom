CREATE DATABASE showroomdb;

USE showroomdb;

CREATE TABLE vehicles (
    veh_id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL ,
    color VARCHAR(30) NOT NULL,
    veh_type VARCHAR(30) NOT NULL,
    engine VARCHAR(50) NOT NULL

);

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    optional_number VARCHAR(15) NULL
);

CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    veh_id INT NOT NULL,
    Preffered_date DATE NOT NULL,
    preffered_time TIME NOT NULL,
    add_Message VARCHAR(255) NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (veh_id) REFERENCES vehicles(veh_id)
};






