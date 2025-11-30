import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flood_data",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS isolated_people(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        nic VARCHAR(50) DEFAULT NULL,
        number_of_members INT NOT NULL,
        address TEXT NOT NULL,
        house_state VARCHAR(100) NOT NULL,
        location VARCHAR(255) DEFAULT NULL,
        lost_items LONGTEXT DEFAULT NULL,
        family_members LONGTEXT DEFAULT NULL,
        created_at DATETIME DEFAULT NULL,
        updated_at DATETIME DEFAULT NULL
      )
    `);

    // Add lost_items column if it doesn't exist (for existing tables)
    try {
      await connection.query(`
        ALTER TABLE isolated_people 
        ADD COLUMN lost_items LONGTEXT DEFAULT NULL
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (
        error.message.includes("Duplicate column name") ||
        error.code === "ER_DUP_FIELDNAME"
      ) {
        // Column already exists, that's fine
      } else {
        console.warn("Could not add lost_items column:", error.message);
      }
    }

    // Add family_members column if it doesn't exist (for existing tables)
    try {
      await connection.query(`
        ALTER TABLE isolated_people 
        ADD COLUMN family_members LONGTEXT DEFAULT NULL
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (
        error.message.includes("Duplicate column name") ||
        error.code === "ER_DUP_FIELDNAME"
      ) {
        // Column already exists, that's fine
      } else {
        console.warn("Could not add family_members column:", error.message);
      }
    }

    // Add location column if it doesn't exist (for existing tables)
    try {
      await connection.query(`
        ALTER TABLE isolated_people 
        ADD COLUMN location VARCHAR(255) DEFAULT NULL
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (
        error.message.includes("Duplicate column name") ||
        error.code === "ER_DUP_FIELDNAME"
      ) {
        // Column already exists, that's fine
      } else {
        console.warn("Could not add location column:", error.message);
      }
    }

    // Add nic column if it doesn't exist (for existing tables)
    try {
      await connection.query(`
        ALTER TABLE isolated_people 
        ADD COLUMN nic VARCHAR(50) DEFAULT NULL
      `);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (
        error.message.includes("Duplicate column name") ||
        error.code === "ER_DUP_FIELDNAME"
      ) {
        // Column already exists, that's fine
      } else {
        console.warn("Could not add nic column:", error.message);
      }
    }

    connection.release();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export default pool;
