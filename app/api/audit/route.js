import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
  try {
    const { action, user, details } = await req.json();
    const client = await clientPromise;
    const db = client.db("analytics");
    await db.collection("audit_logs").insertOne({
      action,
      user,
      details,
      timestamp: new Date()
    });
    return NextResponse.json({ message: 'Audit log recorded' });
  } catch (error) {
    console.error('Error recording audit log:', error);
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}