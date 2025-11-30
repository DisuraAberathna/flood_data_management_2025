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
    const [rows]: any = await pool.query('SELECT * FROM isolated_people ORDER BY created_at DESC');
    
    // Parse lost_items and family_members JSON for each row
    const people = rows.map((row: any) => {
      if (row.lost_items) {
        try {
          row.lost_items = typeof row.lost_items === 'string' ? JSON.parse(row.lost_items) : row.lost_items;
        } catch (e) {
          row.lost_items = null;
        }
      }
      if (row.family_members) {
        try {
          row.family_members = typeof row.family_members === 'string' ? JSON.parse(row.family_members) : row.family_members;
        } catch (e) {
          row.family_members = null;
        }
      }
      return row;
    });
    
    return NextResponse.json(people);
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
    const { name, age, nic, number_of_members, address, house_state, location, lost_items, family_members } = body;

    if (!name || !age || !address || !house_state || !location) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Auto-calculate number_of_members from family_members if provided
    // If no family members, default to 1 (the person themselves)
    let calculatedMembers = number_of_members;
    if (family_members && Array.isArray(family_members) && family_members.length > 0) {
      calculatedMembers = family_members.length;
    } else if (!calculatedMembers || calculatedMembers < 1) {
      calculatedMembers = 1; // Default to 1 if no family members provided
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const lostItemsJson = lost_items && Array.isArray(lost_items) ? JSON.stringify(lost_items) : null;
    const familyMembersJson = family_members && Array.isArray(family_members) ? JSON.stringify(family_members) : null;
    
    const [result]: any = await pool.query(
      'INSERT INTO isolated_people (name, age, nic, number_of_members, address, house_state, location, lost_items, family_members, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, age, nic || null, calculatedMembers, address, house_state, location, lostItemsJson, familyMembersJson, now, now]
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Person registered successfully' },
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

