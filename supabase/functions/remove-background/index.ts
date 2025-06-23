import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the ClipDrop API key from environment variables
    const clipDropApiKey = Deno.env.get('CLIPDROP_API_KEY')
    
    if (!clipDropApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'ClipDrop API key not configured. Please set CLIPDROP_API_KEY environment variable.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload an image.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (imageFile.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare form data for ClipDrop API
    const clipDropFormData = new FormData()
    clipDropFormData.append('image_file', imageFile)

    // Call ClipDrop API
    const clipDropResponse = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': clipDropApiKey,
      },
      body: clipDropFormData,
    })

    if (!clipDropResponse.ok) {
      const errorText = await clipDropResponse.text()
      console.error('ClipDrop API error:', errorText)
      
      let errorMessage = 'Failed to process image'
      if (clipDropResponse.status === 401) {
        errorMessage = 'Invalid API key'
      } else if (clipDropResponse.status === 402) {
        errorMessage = 'API quota exceeded'
      } else if (clipDropResponse.status === 413) {
        errorMessage = 'Image file too large'
      } else if (clipDropResponse.status === 415) {
        errorMessage = 'Unsupported image format'
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          status: clipDropResponse.status 
        }),
        { 
          status: clipDropResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the processed image
    const processedImageBuffer = await clipDropResponse.arrayBuffer()

    // Return the processed image
    return new Response(processedImageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Content-Length': processedImageBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})