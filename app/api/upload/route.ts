import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient()

    // Upload file to Supabase storage in the pending folder
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('uploads')
      .upload(`pending/${Date.now()}-${file.name}`, file)

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: storageData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 