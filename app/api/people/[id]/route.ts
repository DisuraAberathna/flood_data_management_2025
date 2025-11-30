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

    return NextResponse.json(rows[0]);
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
    const { name, age, number_of_members, address, house_state } = body;

    if (!name || !age || !number_of_members || !address || !house_state) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result]: any = await pool.query(
      'UPDATE isolated_people SET name = ?, age = ?, number_of_members = ?, address = ?, house_state = ?, updated_at = ? WHERE id = ?',
      [name, age, number_of_members, address, house_state, now, params.id]
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

