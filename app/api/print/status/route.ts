import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { filename, status } = await request.json()

    if (!filename || !status) {
      return NextResponse.json(
        { error: 'Filename and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['processing', 'completed', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Move file to appropriate folder based on status
    const { error: moveError } = await supabase
      .storage
      .from('uploads')
      .move(
        `processing/${filename}`,
        `${status}/${filename}`
      )

    if (moveError) {
      console.error('Move error:', moveError)
      return NextResponse.json(
        { error: 'Failed to update file status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'File status updated successfully'
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 