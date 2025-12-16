const fetch = require('node-fetch'); // Ensure node-fetch is installed or use global fetch in Node 18+

const API_KEY = process.env.MINIMAX_API_KEY;
const GROUP_ID = process.env.MINIMAX_GROUP_ID; // Might be needed for some endpoints, checking doc

if (!API_KEY) {
    console.error("❌ Error: MINIMAX_API_KEY environment variable is not set.");
    console.error("Please set it in your .env.local or run: export MINIMAX_API_KEY='your_key'");
    process.exit(1);
}

// 1. Trigger Video Generation
async function createVideoTask() {
    console.log("🚀 Starting Minimax Video Generation...");

    // Prompt: A cinematic vertical video for a flight deal to Paris
    const prompt = "A breathtaking cinematic drone shot of the Eiffel Tower in Paris at sunset, golden hour lighting. Overlay text 'PARIS PROMO' in elegant gold font appears. Atmosphere is romantic and luxurious. High quality, 4k, vertical video for social media.";

    try {
        const response = await fetch('https://api.minimax.io/v1/video_generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "MiniMax-Hailuo-2.3", // Latest model
                prompt: prompt,
                duration: 6,
                resolution: "1080P" // Docs specify resolution, not aspect_ratio
            })
        });

        const data = await response.json();

        if (data.base_resp && data.base_resp.status_code !== 0) {
            console.error("❌ API Error:", data.base_resp.status_msg);
            console.log("Full Response:", data);
            return null;
        }

        console.log("✅ Task Created! Task ID:", data.task_id);
        return data.task_id;

    } catch (error) {
        console.error("❌ Network/Script Error:", error);
        return null;
    }
}

// 2. Poll Status
async function pollStatus(taskId) {
    console.log(`⏳ Polling status for Task ID: ${taskId}...`);

    const url = `https://api.minimax.io/v1/video_generation/query?task_id=${taskId}`;

    while (true) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            const data = await response.json();

            if (data.status === 'Success' || data.status === 'success') {
                console.log("🎉 Video Generated Successfully!");
                console.log("🔽 Download URL:", data.file_id); // Does file_id need another call? 
                // Documentation usually returns file_id, we might need to construct download URL or it gives a 'url'.
                // Checking response structure in previous steps... assuming file_id is returned.
                // Actually, let's verify if there is a direct URL. Often 'file_id' needs a download endpoint.

                // If it returns file_id, we need to call GET /download
                if (data.file_id) {
                    await downloadVideo(data.file_id);
                }
                return;
            } else if (data.status === 'Fail' || data.status === 'failed') {
                console.error("❌ Generation Failed.");
                return;
            } else {
                console.log(`... Status: ${data.status} (Waiting 5s)`);
                await new Promise(r => setTimeout(r, 5000));
            }

        } catch (error) {
            console.error("❌ Polling Error:", error);
            return;
        }
    }
}

async function downloadVideo(fileId) {
    console.log(`📥 Fetching download link for File ID: ${fileId}...`);
    // Need to check specific download endpoint doc, usually /v1/files/download or similar.
    // Assuming standard based on previous chunks (GET Download the Video File).
    const url = `https://api.minimax.io/v1/files/download?file_id=${fileId}`;
    // Actually, I'll print the command to download it manually to avoid file system complexity in this script for now.

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const data = await response.json();
        if (data.download_url) {
            console.log("\n🎬 FINAL VIDEO URL:\n", data.download_url);
            console.log("\n(Open this link in your browser to view)");
        } else {
            console.log("Could not resolve direct text link, trying curl backup:");
            console.log(`curl -H "Authorization: Bearer ${API_KEY}" "${url}" --output video.mp4`);
        }
    } catch (e) {
        console.log("Error fetching download url: ", e);
    }
}

// Run
(async () => {
    const taskId = await createVideoTask();
    if (taskId) {
        await pollStatus(taskId);
    }
})();
