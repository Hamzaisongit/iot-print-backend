import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()

    // List files in the pending folder of uploads bucket
    const { data: files, error } = await supabase
      .storage
      .from('uploads')
      .list('pending')

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files available' },
        { status: 404 }
      )
    }

    // Get the oldest file (FIFO)
    const oldestFile = files.sort((b, a) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0]

    // Move the file to 'processing' first
    const { error: moveError } = await supabase
      .storage
      .from('uploads')
      .move(`pending/${oldestFile.name}`, `processing/${oldestFile.name}`)

    if (moveError) {
      console.error('Move error:', moveError)
      return NextResponse.json(
        { error: 'Failed to move file' },
        { status: 500 }
      )
    }

    // Now generate the public URL for the new location
    const { data: fileData } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(`processing/${oldestFile.name}`)

    if (!fileData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate file URL' },
        { status: 500 }
      )
    }
    console.log('fileData.publicUrl', fileData.publicUrl)
    // Redirect to the new public URL
    return NextResponse.redirect(`${fileData.publicUrl}`)

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 