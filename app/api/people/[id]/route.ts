import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch a single person by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM isolated_people WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    // Parse lost_items and family_members JSON
    const person = rows[0];
    if (person.lost_items) {
      try {
        person.lost_items = typeof person.lost_items === 'string' ? JSON.parse(person.lost_items) : person.lost_items;
      } catch (e) {
        person.lost_items = null;
      }
    }
    if (person.family_members) {
      try {
        person.family_members = typeof person.family_members === 'string' ? JSON.parse(person.family_members) : person.family_members;
      } catch (e) {
        person.family_members = null;
      }
    }

    return NextResponse.json(person);
  } catch (error: any) {
    console.error('Error fetching person:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a person
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      'UPDATE isolated_people SET name = ?, age = ?, nic = ?, number_of_members = ?, address = ?, house_state = ?, location = ?, lost_items = ?, family_members = ?, updated_at = ? WHERE id = ?',
      [name, age, nic || null, calculatedMembers, address, house_state, location, lostItemsJson, familyMembersJson, now, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Person updated successfully' });
  } catch (error: any) {
    console.error('Error updating person:', error);
    return NextResponse.json(
      { error: 'Failed to update person', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a person
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result]: any = await pool.query(
      'DELETE FROM isolated_people WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { error: 'Failed to delete person', details: error.message },
      { status: 500 }
    );
  }
}

