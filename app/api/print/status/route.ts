import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['completed', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // List files in processing folder
    const { data: files, error: listError } = await supabase
      .storage
      .from('uploads')
      .list('processing')

    if (listError) {
      console.error('List error:', listError)
      return NextResponse.json(
        { error: 'Failed to list processing files' },
        { status: 500 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files in processing' },
        { status: 404 }
      )
    }

    // Get the most recent file
    const mostRecentFile = files.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    // Move file to appropriate folder based on status
    const { error: moveError } = await supabase
      .storage
      .from('uploads')
      .move(
        `processing/${mostRecentFile.name}`,
        `${status}/${mostRecentFile.name}`
      )

    if (moveError) {
      console.error('Move error:', moveError)
      return NextResponse.json(
        { error: 'Failed to update file status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'File status updated successfully',
      file: mostRecentFile
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 