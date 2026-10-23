-- Runs once, the first time the Postgres container initialises its data volume.
-- POSTGRES_DB (dealership) is created by the image; we add a separate DB for the test suite.
CREATE DATABASE dealership_test;
