import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

// GET - Fetch all people
export async function GET() {
  try {
    await ensureDbInitialized();
    const [rows] = await pool.query('SELECT * FROM isolated_people ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new person
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { name, age, number_of_members, address, house_state } = body;

    if (!name || !age || !number_of_members || !address || !house_state) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result]: any = await pool.query(
      'INSERT INTO isolated_people (name, age, number_of_members, address, house_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, age, number_of_members, address, house_state, now, now]
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Person added successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { error: 'Failed to create person', details: error.message },
      { status: 500 }
    );
  }
}

