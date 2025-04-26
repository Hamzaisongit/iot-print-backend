import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()

    // List files in the uploads bucket
    const { data: files, error } = await supabase
      .storage
      .from('uploads')
      .list()

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

    // Get public URL for the file
    const { data: fileData } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(oldestFile.name)

    if (!fileData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate file URL' },
        { status: 500 }
      )
    }

    // // Move the file to a 'processing' folder to prevent it from being picked up again
    // const { error: moveError } = await supabase
    //   .storage
    //   .from('uploads')
    //   .move(oldestFile.name, `processing/${oldestFile.name}`)

    // if (moveError) {
    //   console.error('Move error:', moveError)
    //   // Continue anyway as we already have the URL
    // }

    // Redirect to the file URL with download parameter
    return NextResponse.redirect(`${fileData.publicUrl}`)

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 